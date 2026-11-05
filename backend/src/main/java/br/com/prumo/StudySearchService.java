package br.com.prumo;

import jakarta.annotation.PreDestroy;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.springframework.stereotype.Service;
import org.w3c.dom.Element;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class StudySearchService {
    private final StudyService study;
    private final Remote remote;
    private final JsonMapper json;
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
    record Batch(List<Map<String, Object>> sources, String unavailable) {}
    public StudySearchService(StudyService study, Remote remote, JsonMapper json) { this.study=study; this.remote=remote; this.json=json; }
    @PreDestroy void close() { executor.shutdownNow(); }
    static String query(String query, String family) {
        if(query.trim().equalsIgnoreCase("spring"))return "Spring Framework";
        return family.equals("Go") ? query.replaceAll("(?i)\\b(golang|golengue|golink|go(?:\\s+lang)?)\\b", "golang") : query;
    }
    static boolean relevant(String text, String query) {
        String normalized=Api.normalized(text);
        var ignored=List.of("como","quero","aprender","estudar","sobre","with","para","the","and","com");
        for(String term:Api.normalized(query).split("[^a-z0-9]+")) {
            if(term.length()<=2 || ignored.contains(term))continue;
            if(!Pattern.compile("(?:^|[^a-z0-9])"+Pattern.quote(term)+"[a-z]*(?:$|[^a-z0-9])").matcher(normalized).find())return false;
        }
        return true;
    }
    static List<Map<String, Object>> source(JsonNode provider, String title, String url, String context, String query) {
        try {
            URI uri=URI.create(url);String host=provider.path("host").asString();
            if(!Api.safeUrl(url)||(!host.isEmpty()&&!uri.getHost().equals(host)&&!uri.getHost().endsWith("."+host)))return List.of();
            title=title.replaceAll("<[^>]*>"," ").replaceAll("\\s+"," ").trim();
            if(title.isEmpty()||title.length()>500||!relevant(title+" "+context,query))return List.of();
            String kind=provider.path("kind").asString();
            String why=kind.equals("community") ? "Discussão encontrada na comunidade. Compare as respostas com a documentação e confira as versões citadas." : "Artigo encontrado nesta fonte. Confira versão, autoria e exemplos antes de aplicar; alguns conteúdos podem exigir acesso adicional.";
            return List.of(Map.of("title",title,"url",url,"kind",kind,"publisher",provider.path("name").asString(),"why",why));
        }catch(RuntimeException invalid){return List.of();}
    }
    private static List<Element> children(Element parent,String name) {
        var result=new ArrayList<Element>();
        for(var child=parent.getFirstChild();child!=null;child=child.getNextSibling())if(child instanceof Element e&&(name.equals(e.getLocalName())||name.equals(e.getTagName())))result.add(e);
        return result;
    }
    private static String text(Element element,String name) { var values=children(element,name);return values.isEmpty()?"":values.getFirst().getTextContent().trim(); }
    static List<Map<String,Object>> feed(byte[] body,JsonNode provider,String query) {
        if(body.length>2_000_000||Pattern.compile("<!DOCTYPE|<!ENTITY",Pattern.CASE_INSENSITIVE).matcher(new String(body,StandardCharsets.UTF_8)).find())throw new IllegalArgumentException("Feed inválido.");
        try {
            var factory=DocumentBuilderFactory.newInstance();factory.setNamespaceAware(true);factory.setXIncludeAware(false);factory.setExpandEntityReferences(false);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING,true);factory.setAttribute("jdk.xml.maxElementDepth","40");
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities",false);factory.setFeature("http://xml.org/sax/features/external-parameter-entities",false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD,"");factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA,"");
            var root=factory.newDocumentBuilder().parse(new ByteArrayInputStream(body)).getDocumentElement();
            List<Element> entries;
            if(root.getTagName().equals("rss")){var channels=children(root,"channel");entries=channels.isEmpty()?List.of():children(channels.getFirst(),"item");}
            else if("feed".equals(root.getLocalName())||"feed".equals(root.getTagName()))entries=children(root,"entry");
            else throw new IllegalArgumentException("Feed ausente.");
            var results=new ArrayList<Map<String,Object>>();
            for(var entry:entries.stream().limit(40).toList()) {
                String link=text(entry,"link");
                if(link.isEmpty())for(var candidate:children(entry,"link"))if(candidate.getAttribute("rel").equals("alternate")||candidate.getAttribute("rel").isEmpty()){link=candidate.getAttribute("href");break;}
                String context=text(entry,"description")+" "+text(entry,"summary")+" "+text(entry,"content")+" "+text(entry,"encoded")+" "+text(entry,"category");
                results.addAll(source(provider,text(entry,"title"),link,context.replaceAll("<[^>]*>"," "),query));
            }
            return results.stream().limit(5).toList();
        }catch(Exception invalid){throw new IllegalArgumentException("Feed inválido.",invalid);}
    }
    private Batch loadUrl(JsonNode provider,String query,String tag,String focus,String template) {
        try {
            String url=template.replace("{query}",URLEncoder.encode(query,StandardCharsets.UTF_8)).replace("{tag}",URLEncoder.encode(tag,StandardCharsets.UTF_8)).replace("{devtag}",URLEncoder.encode(tag.replace("-",""),StandardCharsets.UTF_8)).replace("{focus}",URLEncoder.encode(focus,StandardCharsets.UTF_8));
            var response=remote.get(URI.create(url));if(response.status()!=200)throw new IllegalStateException();
            if(provider.path("format").asString().equals("feed"))return new Batch(feed(response.body(),provider,query),"");
            var root=json.readTree(response.body());var result=new ArrayList<Map<String,Object>>();
            String format=provider.path("format").asString();
            var items=format.equals("dev")?root:root.path(format.equals("hn")?"hits":"items");
            if(!items.isArray()||items.size()>30||root.has("backoff")||root.has("error_id"))throw new IllegalStateException();
            for(var item:items) {
                try {
                String title=Api.text(item,"title",500),link,context=query;
                if(format.equals("stack")){if(!item.path("is_answered").asBoolean())continue;link=Api.text(item,"link",2000);}
                else if(format.equals("hn"))link="https://news.ycombinator.com/item?id="+URLEncoder.encode(Api.text(item,"objectID",200),StandardCharsets.UTF_8);
                else {link=Api.text(item,"url",2000);context=item.path("description").asString()+" "+item.path("tag_list").toString();}
                result.addAll(source(provider,title,link,context,query));
                } catch (RuntimeException invalid) { /* Uma entrada inválida não descarta as outras. */ }
            }
            return new Batch(result.stream().limit(5).toList(),"");
        }catch(RuntimeException unavailable){return new Batch(List.of(),provider.path("name").asString());}
    }
    Batch load(JsonNode provider,String query,String tag) {
        var terms=java.util.Arrays.stream(Api.normalized(query).split("[^a-z0-9]+")).filter(t->t.length()>2&&!List.of("como","quero","aprender","estudar","sobre","with","para","the","and","com").contains(t)).toList();
        String focus=terms.isEmpty()?tag:terms.getLast();
        String focusUrl=provider.path("focusUrl").asString();
        if(focusUrl.isEmpty()||focus.equals(tag)||focus.equals(tag.replace("-","")))return loadUrl(provider,query,tag,focus,provider.path("url").asString());
        var extra=CompletableFuture.supplyAsync(()->loadUrl(provider,query,tag,focus,focusUrl),executor);
        var base=loadUrl(provider,query,tag,focus,provider.path("url").asString());
        var focused=extra.join();var all=new ArrayList<>(base.sources());all.addAll(focused.sources());
        return new Batch(all.stream().limit(5).toList(),base.unavailable().isEmpty()||focused.unavailable().isEmpty()?"":provider.path("name").asString());
    }
    public Map<String,Object> search(String raw) {
        String canonical=query(raw,study.template(raw)),family=study.template(canonical),term=query(canonical,family);
        String tag=study.catalog().path("studyTags").path(family).asString();
        if(tag.isEmpty())tag=Api.normalized(raw).replaceAll("[^a-z0-9]+","-").replaceAll("^-|-$","");
        String finalTag=tag;
        var tasks=new ArrayList<CompletableFuture<Batch>>();
        for(var provider:study.catalog().path("studyProviders"))tasks.add(CompletableFuture.supplyAsync(()->load(provider,term,finalTag),executor));
        var sources=new ArrayList<Map<String,Object>>(study.official(canonical));var unavailable=new ArrayList<String>();
        for(var task:tasks){var batch=task.join();sources.addAll(batch.sources());if(!batch.unavailable().isEmpty())unavailable.add(batch.unavailable());}
        var seen=new HashSet<String>();
        var unique=sources.stream().filter(item->seen.add(NewsService.key((String)item.get("url")))).toList();
        String warning=unavailable.isEmpty()?"":"A busca não respondeu em: "+String.join(", ",unavailable)+". As demais fontes e as buscas diretas continuam disponíveis.";
        return Map.of("query",raw,"sources",unique,"warning",warning,"unavailableSources",unavailable,"searchedAt",Api.now());
    }
}
