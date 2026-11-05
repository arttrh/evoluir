package br.com.prumo;

import static org.assertj.core.api.Assertions.assertThat;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.databind.json.JsonMapper;

class JetBrainsNewsTests {
    @Test void readsTheOfficialJavaAnnotatedFeedFromTheSharedCatalog() throws Exception {
        var json = JsonMapper.builder().build();
        var catalog = json.readTree(new ClassPathResource("catalog.json").getInputStream());
        var feed = java.util.stream.StreamSupport.stream(catalog.path("feeds").spliterator(), false)
            .filter(value -> value.path("name").asString().contains("JetBrains")).findFirst().orElseThrow();
        assertThat(feed.path("url").asString()).isEqualTo("https://blog.jetbrains.com/idea/tag/java-annotated/feed/");
        var xml = "<rss><channel><item><title>Java Annotated Monthly</title><link>https://blog.jetbrains.com/idea/2026/10/java-annotated-monthly/</link><pubDate>Sun, 01 Nov 2026 10:00:00 GMT</pubDate></item></channel></rss>";
        var items = NewsService.parseFeed(xml.getBytes(StandardCharsets.UTF_8), feed);
        assertThat(items).hasSize(1);
        assertThat(items.getFirst()).containsEntry("category", "Java").containsEntry("source", "JetBrains · Java Annotated Monthly");
    }
}
