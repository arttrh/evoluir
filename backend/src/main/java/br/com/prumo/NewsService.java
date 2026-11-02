package br.com.prumo;

import jakarta.annotation.PreDestroy;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
public class NewsService {
    private static final Map<String, String> SEARCH = Map.of("Go", "golang", "Python", "python", "JavaScript", "javascript",
        "Segurança", "security", "Cloud", "cloud", "Java", "java", "Spring", "spring", "Arquitetura", "architecture");
    record Batch(List<Map<String, Object>> items, boolean more, String unavailable) {}
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
    private final Remote remote;
    private final JsonMapper json;
    private final JsonNode feeds;
    public NewsService(Remote remote, JsonMapper json, StudyService study) {
        this.remote = remote; this.json = json; this.feeds = study.catalog().path("feeds");
    }
    @PreDestroy void close() { executor.shutdownNow(); }
    static String normalize(String query) {
        String q = Api.normalized(query);
        if (q.matches("go|golang|go lang|golengue|golink")) return "golang";
        if (q.matches("seguranca|ciberseguranca")) return "security";
        if (q.matches("ia|inteligencia artificial|AI|IA")) return "ai";
        return q;
    }
    static boolean matches(Map<String, Object> item, String query) {
        String q = normalize(query);
        if (q.isEmpty()) return true;
        String category = String.valueOf(item.get("category"));
        String text = normalize(item.get("title") + " " + item.get("source") + " " + category + " " + SEARCH.getOrDefault(category, "") + " " + item.get("url"));
        if (q.equals("golang")) return category.equals("Go") || Pattern.compile("\\bgo\\b|golang").matcher(text).find();
        if (q.equals("security")) return category.equals("Segurança") || Pattern.compile("security|seguranca|vulnerab|cve-").matcher(text).find();
        for (String term : q.split("\\s+")) {
            if (!Pattern.compile("(?:^|[^a-z0-9])" + Pattern.quote(term) + "(?:$|[^a-z0-9])").matcher(text).find()) return false;
        }
        return true;
    }
    private static List<Element> children(Element parent, String name) {
        var result = new ArrayList<Element>();
        for (var child = parent.getFirstChild(); child != null; child = child.getNextSibling()) {
            if (child instanceof Element e && (name.equals(e.getLocalName()) || name.equals(e.getTagName()))) result.add(e);
        }
        return result;
    }
    private static String content(Element element, String... names) {
        for (String name : names) {
            var found = children(element, name);
            if (!found.isEmpty() && !found.getFirst().getTextContent().isBlank()) return found.getFirst().getTextContent().trim();
        }
        return "";
    }
    static List<Map<String, Object>> parseFeed(byte[] body, JsonNode feed) {
        if (body.length > 2_000_000 || new String(body, StandardCharsets.UTF_8).matches("(?s).*(?i:<!DOCTYPE|<!ENTITY).*"))
            throw new IllegalArgumentException("Feed inválido.");
        try {
            var factory = DocumentBuilderFactory.newInstance();
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setAttribute("jdk.xml.maxElementDepth", "40");
            factory.setNamespaceAware(true); factory.setXIncludeAware(false); factory.setExpandEntityReferences(false);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, ""); factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
            var root = factory.newDocumentBuilder().parse(new ByteArrayInputStream(body)).getDocumentElement();
            List<Element> entries;
            if ("rss".equals(root.getTagName())) {
                var channels = children(root, "channel"); entries = channels.isEmpty() ? List.of() : children(channels.getFirst(), "item");
            } else entries = children(root, "entry");
            var output = new ArrayList<Map<String, Object>>();
            for (var entry : entries.stream().limit(40).toList()) {
                try {
                    String link = content(entry, "link");
                    if (link.isEmpty()) {
                        var links = children(entry, "link");
                        var selected = links.stream().filter(e -> e.getAttribute("rel").equals("alternate") || e.getAttribute("rel").isEmpty()).findFirst();
                        if (selected.isPresent()) link = selected.get().getAttribute("href");
                    }
                    if (link.isBlank()) continue;
                    String url = URI.create(feed.path("url").asString()).resolve(link).toString();
                    String title = content(entry, "title").replaceAll("<[^>]*>", "").trim();
                    String date = content(entry, "pubDate", "published", "updated", "date");
                    Instant time;
                    try { time = Instant.parse(date); } catch (RuntimeException notIso) { time = ZonedDateTime.parse(date, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant(); }
                    if (!Api.safeUrl(url) || title.isEmpty() || title.length() > 500 || time.isAfter(Instant.now().plusSeconds(86400))) continue;
                    output.add(Map.of("title", title, "url", url, "source", feed.path("name").asString(), "category", feed.path("category").asString(), "publishedAt", time.toString()));
                } catch (RuntimeException invalid) { /* Ignora somente a publicação inválida. */ }
            }
            return output;
        } catch (Exception invalid) { throw new IllegalArgumentException("Feed inválido."); }
    }
    private Batch feed(JsonNode feed, String query, int page) {
        try {
            var response = remote.get(URI.create(feed.path("url").asString()));
            if (response.status() != 200) throw new IllegalStateException();
            var items = parseFeed(response.body(), feed).stream().filter(i -> matches(i, query)).toList();
            int start = Math.min(items.size(), page * 3), end = Math.min(items.size(), (page + 1) * 3);
            return new Batch(items.subList(start, end), items.size() > end, "");
        } catch (RuntimeException unavailable) { return new Batch(List.of(), false, feed.path("name").asString()); }
    }
    private Batch headlines(String query, int page) {
        try {
            var response = remote.get(URI.create("https://hn.algolia.com/api/v1/search_by_date?" + Remote.parameters(Map.of(
                "query", query, "tags", "story", "hitsPerPage", "30", "page", String.valueOf(page), "restrictSearchableAttributes", "title,url", "numericFilters", "points>2"))));
            if (response.status() != 200) throw new IllegalStateException();
            var root = json.readTree(response.body());
            if (!root.path("hits").isArray() || root.path("hits").size() > 50) throw new IllegalStateException();
            var items = new ArrayList<Map<String, Object>>();
            for (var hit : root.path("hits")) {
                try {
                    String title = Api.text(hit, "title", 500).trim();
                    String url = hit.path("url").isString() ? hit.path("url").asString() : "https://news.ycombinator.com/item?id=" + java.net.URLEncoder.encode(Api.text(hit, "objectID", 200), StandardCharsets.UTF_8);
                    Instant date = Instant.parse(Api.text(hit, "created_at", 40));
                    if (!Api.safeUrl(url) || title.isEmpty() || date.isAfter(Instant.now().plusSeconds(86400))) continue;
                    items.add(Map.of("title", title, "url", url, "source", "Hacker News · comunidade", "category", "Tecnologia", "publishedAt", date.toString(), "dateKind", "shared"));
                } catch (RuntimeException invalid) { /* Ignora somente a manchete inválida. */ }
            }
            boolean more = root.path("nbPages").isIntegralNumber() ? page + 1 < root.path("nbPages").asInt() : root.path("hits").size() == 30;
            return new Batch(items, more, "");
        } catch (RuntimeException unavailable) { return new Batch(List.of(), false, "Hacker News"); }
    }
    static String key(String url) {
        String base = url.split("#", 2)[0]; int start = base.indexOf('?');
        String path = start < 0 ? base : base.substring(0, start);
        String query = start < 0 ? "" : base.substring(start + 1);
        if (URI.create(path).getRawPath().length() > 1 && path.endsWith("/")) path = path.substring(0, path.length() - 1);
        var parameters = java.util.Arrays.stream(query.split("&")).filter(p -> !p.isEmpty()).filter(p -> {
            String name = URLDecoder.decode(p.split("=", 2)[0], StandardCharsets.UTF_8);
            return !name.matches("(?i)^utm_.*|fbclid|gclid|mc_cid|mc_eid");
        }).sorted().toList();
        return path + (parameters.isEmpty() ? "" : "?" + String.join("&", parameters));
    }
    public Map<String, Object> search(String raw, int page) {
        String query = normalize(raw);
        var tasks = new ArrayList<CompletableFuture<Batch>>();
        for (var feed : feeds) {
            if (!matches(Map.of("title", "", "source", feed.path("name").asString(), "category", feed.path("category").asString(), "url", feed.path("url").asString()), query)) continue;
            tasks.add(CompletableFuture.supplyAsync(() -> feed(feed, query, page), executor));
        }
        tasks.add(CompletableFuture.supplyAsync(() -> headlines(query, page), executor));
        var all = new ArrayList<Map<String, Object>>(); var unavailable = new ArrayList<String>(); boolean more = false;
        for (var task : tasks) {
            var batch = task.join(); all.addAll(batch.items()); more |= batch.more();
            if (!batch.unavailable().isEmpty()) unavailable.add(batch.unavailable());
        }
        all.sort(Comparator.comparing(i -> Instant.parse((String) i.get("publishedAt")), Comparator.reverseOrder()));
        var urls = new HashSet<String>(); var titles = new HashSet<String>();
        var items = all.stream().filter(i -> matches(i, query)).filter(i -> urls.add(key((String) i.get("url")))
            && titles.add(Api.normalized((String) i.get("title")).replaceAll("[^a-z0-9]", ""))).limit(60).toList();
        return Map.of("items", items, "page", page, "hasMore", page < 9 && more, "updatedAt", Api.now(), "unavailableSources", unavailable);
    }
}
