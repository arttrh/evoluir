import {afterEach,expect,it,vi} from "vitest";
import {searchStudy,parseStudyFeed} from "../server/study-search";
import {studyProviders,studyTag,studySearchLinks} from "../src/study-sources";
afterEach(()=>vi.unstubAllGlobals());
const provider=(name:string)=>studyProviders.find(p=>p.name===name)!;
const feed=(title:string,url:string,context="")=>`<rss><channel><item><title>${title}</title><link>${url}</link><description>${context}</description></item></channel></rss>`;
it("lê artigos e Atom sem exigir ou inventar data de publicação",()=>{
 const result=parseStudyFeed(feed("Python asyncio","https://www.baeldung.com/python-asyncio"),provider("Baeldung"),"Python asyncio");
 expect(result).toEqual([expect.objectContaining({kind:"article",publisher:"Baeldung",title:"Python asyncio"})]);expect(result[0]).not.toHaveProperty("publishedAt");
 const atom='<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Go channels</title><link href="https://www.reddit.com/r/golang/comments/123/test"/><content>golang channels</content></entry></feed>';
 expect(parseStudyFeed(atom,provider("Reddit"),"golang channels")[0]?.publisher).toBe("Reddit");
});
it("recusa XML inseguro, URLs fora da fonte e resultados sem relação com o assunto",()=>{
 for(const xml of ['<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>','x'.repeat(2_000_001),'<rss>'])expect(()=>parseStudyFeed(xml,provider("Baeldung"),"Python")).toThrow();
 for(const url of ['javascript:alert(1)','https://evil.test/python','https://user:pass@www.baeldung.com/python'])expect(parseStudyFeed(feed("Python",url),provider("Baeldung"),"Python")).toEqual([]);
 expect(parseStudyFeed(feed("Spring release","https://www.baeldung.com/spring"),provider("Baeldung"),"Python asyncio")).toEqual([]);
});
it("consulta todas as fontes, deduplica e preserva documentação em falha parcial",async()=>{
 const calls:string[]=[];vi.stubGlobal("fetch",vi.fn(async(input:string|URL)=>{
  const url=String(input);calls.push(url);
  if(url.startsWith('https://www.baeldung.com/'))return new Response(feed('Python asyncio','https://www.baeldung.com/python-asyncio'));
  if(url.startsWith('https://medium.com/'))return new Response(feed('Python asyncio','https://www.baeldung.com/python-asyncio'));
  if(url.startsWith('https://www.reddit.com/'))return new Response('',{status:429});
  if(url.startsWith('https://dev.to/'))return Response.json([{title:'Python asyncio example',url:'https://dev.to/example/asyncio',description:'Python asyncio',tag_list:['python']}]);
  if(url.startsWith('https://hn.algolia.com/'))return Response.json({hits:[{title:'Asyncio in Python',objectID:'7'}]});
  return Response.json({items:[{title:'Asyncio Python',link:'https://stackoverflow.com/questions/1/python',score:2,is_answered:true}]});
 }));
 const r=await searchStudy('Python asyncio');expect(new Set(calls.map(url=>new URL(url).hostname)).size).toBe(6);expect(r.sources.some(s=>s.kind==='official')).toBe(true);expect(r.sources.filter(s=>s.url==='https://www.baeldung.com/python-asyncio')).toHaveLength(1);expect(r.sources.some(s=>s.publisher==='DEV Community')).toBe(true);expect(r.warning).toContain('Reddit');expect(r.warning).not.toContain('Baeldung');
});
it("tags e buscas diretas cobrem várias tecnologias sem virar artigos falsos",()=>{
 for(const [q,tag] of [['Go channels','golang'],['Python asyncio','python'],['React hooks','react'],['Spring Cloud Eureka','spring-cloud']] as const)expect(studyTag(q)).toBe(tag);
 expect(studyTag("Spring")).toBe("spring-boot");
 const links=studySearchLinks('Python asyncio');expect(links.some(l=>l.title==='Reddit'&&new URL(l.url).searchParams.get('q')==='Python asyncio')).toBe(true);expect(links.some(l=>l.title==='Spring')).toBe(false);expect(studySearchLinks('Spring Security').some(l=>l.title==='Spring')).toBe(true);
});
it("falha total continua honesta e mantém as referências locais",async()=>{
 vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('offline')));const result=await searchStudy('Docker networking');expect(result.sources.length).toBeGreaterThan(0);expect(result.sources.every(s=>s.kind==='official')).toBe(true);expect(result.warning).toContain('não respondeu');
});
