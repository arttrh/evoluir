import { XMLParser, XMLValidator } from "fast-xml-parser";
import { z } from "zod";
import { readBounded } from "./http.js";
import { officialSources, studyProviders, studyQuery, studyTag, studySourceSchema, type StudySource } from "../src/study-sources.js";
import { newsKey } from "../src/news.js";

type Provider = typeof studyProviders[number];
const text = (value: unknown): string => typeof value === "string" ? value : value && typeof value === "object" ? text((value as Record<string,unknown>)["#text"]) : "";
const list = (value: unknown): Record<string,unknown>[] => (Array.isArray(value) ? value : value ? [value] : []).filter((item): item is Record<string,unknown> => typeof item === "object" && item !== null);
const clean = (value: string) => value.replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();
export function studyTerms(query: string) {
  return studyQuery(query).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().split(/[^a-z0-9]+/).filter(term => term.length > 2 && !["como","quero","aprender","estudar","sobre","with","para","the","and","com"].includes(term));
}
function relevant(value: string, query: string) {
  const normalized=value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return studyTerms(query).every(term => new RegExp(`(?:^|[^a-z0-9])${term}[a-z]*(?:$|[^a-z0-9])`).test(normalized));
}
function source(provider: Provider, title: string, url: string, context: string, query: string): StudySource[] {
  try {
    const link=new URL(url);
    if (link.protocol!=="https:" || link.username || link.password || (provider.host && link.hostname!==provider.host && !link.hostname.endsWith("."+provider.host))) return [];
    if (!relevant(`${title} ${context}`,query)) return [];
    const result=studySourceSchema.safeParse({title:clean(title),url:link.href,kind:provider.kind,publisher:provider.name,why:provider.kind==="community" ? "Discussão encontrada na comunidade. Compare as respostas com a documentação e confira as versões citadas." : "Artigo encontrado nesta fonte. Confira versão, autoria e exemplos antes de aplicar; alguns conteúdos podem exigir acesso adicional."});
    return result.success ? [result.data] : [];
  } catch { return []; }
}
export function parseStudyFeed(xml: string, provider: Provider, query: string): StudySource[] {
  if (xml.length>2_000_000 || /<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml)!==true) throw new Error("Feed inválido.");
  const document=new XMLParser({ignoreAttributes:false,parseTagValue:false,ignoreDeclaration:true,maxNestedTags:40}).parse(xml);
  if (!document.rss && !document.feed) throw new Error("Feed ausente.");
  return list(document.rss?.channel?.item || document.feed?.entry).slice(0,40).flatMap(entry=>{
    const links=list(entry.link);
    const url=text(entry.link) || String((links.find(link=>link["@_rel"]==="alternate") || links[0])?.["@_href"] || "");
    return source(provider,text(entry.title),url,clean([text(entry.description),text(entry.summary),text(entry.content),text(entry["content:encoded"]), JSON.stringify(entry.category)].join(" ")),query);
  }).slice(0,5);
}
export async function searchStudy(query: string) {
  const tag=studyTag(query),term=studyQuery(query),focus=studyTerms(query).at(-1) || tag;
  const jobs=studyProviders.map(async provider=>{
    async function load(template: string) {
    const url=template.replace("{query}",encodeURIComponent(term).replace(/%20/g,"+")).replace("{tag}",encodeURIComponent(tag)).replace("{devtag}",encodeURIComponent(tag.replace(/-/g,""))).replace("{focus}",encodeURIComponent(focus));
    const response=await fetch(url,{signal:AbortSignal.timeout(8000),redirect:"error",headers:{Accept:"application/json, application/rss+xml, application/atom+xml", "User-Agent":"Prumo/1.0"}});
    if(!response.ok)throw new Error("Fonte indisponível.");
    const body=await readBounded(response);
    if(provider.format==="feed") return parseStudyFeed(body,provider,term);
    const root=JSON.parse(body);
    if(provider.format==="stack") {
      const data=z.object({items:z.array(z.object({title:z.string(),link:z.string(),score:z.number(),is_answered:z.boolean()})).max(30),backoff:z.number().optional(),error_id:z.number().optional()}).parse(root);
      if(data.backoff||data.error_id)throw new Error("Limite da comunidade.");
      return data.items.flatMap(item=>item.is_answered ? source(provider,item.title,item.link,term,term):[]).slice(0,5);
    }
    if(provider.format==="dev") return z.array(z.object({title:z.string(),url:z.string(),description:z.string(),tag_list:z.array(z.string())})).max(30).parse(root).flatMap(item=>source(provider,item.title,item.url,`${item.description} ${item.tag_list.join(" ")}`,term)).slice(0,5);
    return z.object({hits:z.array(z.object({title:z.string().nullable(),objectID:z.string()})).max(30)}).parse(root).hits.flatMap(item=>item.title?source(provider,item.title,`https://news.ycombinator.com/item?id=${encodeURIComponent(item.objectID)}`,term,term):[]).slice(0,5);
    }
    const templates: string[]=[provider.url];
    if("focusUrl" in provider && focus!==tag && focus!==tag.replace(/-/g,""))templates.push(provider.focusUrl);
    const results=await Promise.allSettled(templates.map(load));
    if(results.every(result=>result.status==="rejected"))throw new Error("Fonte indisponível.");
    return results.flatMap(result=>result.status==="fulfilled"?result.value:[]).slice(0,5);
  });
  const results=await Promise.allSettled(jobs),sources=officialSources(query),unavailable:string[]=[];
  results.forEach((result,index)=>{if(result.status==="fulfilled")sources.push(...result.value);else unavailable.push(studyProviders[index]!.name);});
  const seen=new Set<string>();
  return {query,sources:sources.filter(item=>{const key=newsKey(item.url);if(seen.has(key))return false;seen.add(key);return true;}),warning:unavailable.length?`A busca não respondeu em: ${unavailable.join(", ")}. As demais fontes e as buscas diretas continuam disponíveis.`:"",searchedAt:new Date().toISOString()};
}
