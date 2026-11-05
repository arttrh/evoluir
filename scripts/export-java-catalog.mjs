import { createServer } from "vite";
import { writeFile, mkdir } from "node:fs/promises";
const server = await createServer({configFile: false, server: {middlewareMode: true}, appType: "custom"});
try {
  const {createTrack, templateNames, templateMatchers} = await server.ssrLoadModule("/src/catalog.ts");
  const {newsFeeds} = await server.ssrLoadModule("/server/news-feeds.ts");
  const {studyProviders, studyTags} = await server.ssrLoadModule("/src/study-sources.ts");
  const tracks = Object.fromEntries(templateNames.map(name => {
    const track = createTrack(name, "auto");
    return [name, track.modules.map(module => ({title: module.title, topics: module.topics.map(topic => ({title: topic.title, resources: topic.resources}))}))];
  }));
  await mkdir("backend/src/main/resources", {recursive: true});
  await writeFile("backend/src/main/resources/catalog.json", JSON.stringify({tracks, studyProviders, studyTags, feeds: newsFeeds, matchers: templateMatchers.map(([name, pattern]) => ({name, pattern: pattern.source}))}) + "\n");
  console.log(`Catálogo Java gerado: ${templateNames.length} trilhas.`);
} finally { await server.close(); }
