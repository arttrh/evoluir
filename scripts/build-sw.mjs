import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const files = (await readdir("dist", { recursive: true }))
  .filter(
    (f) =>
      /\.(html|js|css|woff2|svg|png|webmanifest)$/.test(f) && f !== "sw.js",
  )
  .sort();
const hash = createHash("sha256");
for (const file of files) hash.update(await readFile(`dist/${file}`));
const version = hash.digest("hex").slice(0, 16);
const urls = ["/", ...files.map((f) => `/${f}`)];
const source = `const CACHE='evoluir-${version}';const FILES=${JSON.stringify(urls)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('evoluir-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));return;}if(FILES.includes(url.pathname))e.respondWith(caches.match(e.request,{ignoreVary:true}).then(cached=>cached||fetch(e.request)));});`;
await writeFile("dist/sw.js", source);
console.log(`Service worker: ${files.length} arquivos, versão ${version}`);
