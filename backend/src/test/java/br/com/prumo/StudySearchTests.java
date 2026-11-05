package br.com.prumo;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class StudySearchTests {
    private final JsonMapper json=JsonMapper.builder().build();
    private JsonNode provider(String name) throws Exception {
        var root=json.readTree(new ClassPathResource("catalog.json").getInputStream());
        for(var provider:root.path("studyProviders"))if(provider.path("name").asString().equals(name))return provider;
        throw new IllegalArgumentException();
    }
    private byte[] bytes(String text){return text.getBytes(StandardCharsets.UTF_8);}
    @Test void readsArticlesAndDiscussionsWithoutInventingDates() throws Exception {
        String rss="<rss><channel><item><title>Python asyncio</title><link>https://www.baeldung.com/python-asyncio</link><description>Python asyncio</description></item></channel></rss>";
        var result=StudySearchService.feed(bytes(rss),provider("Baeldung"),"Python asyncio");
        assertThat(result).hasSize(1);assertThat(result.getFirst()).containsEntry("kind","article").containsEntry("publisher","Baeldung").doesNotContainKey("publishedAt");
        String atom="<feed xmlns='http://www.w3.org/2005/Atom'><entry><title>Go channels</title><link href='https://www.reddit.com/r/golang/comments/1/test'/><content>golang channels</content></entry></feed>";
        assertThat(StudySearchService.feed(bytes(atom),provider("Reddit"),"golang channels")).hasSize(1);
    }
    @Test void rejectsUnsafeXmlAndLinksAndIrrelevantResults() throws Exception {
        var provider=provider("Baeldung");
        for(String xml:List.of("<!DOCTYPE rss [<!ENTITY x SYSTEM 'file:///etc/passwd'>]><rss/>","<rss>","x".repeat(2_000_001)))assertThatThrownBy(()->StudySearchService.feed(bytes(xml),provider,"Python")).isInstanceOf(IllegalArgumentException.class);
        for(String url:List.of("javascript:alert(1)","http://www.baeldung.com/python","https://evil.test/python","https://user:pass@www.baeldung.com/python"))assertThat(StudySearchService.source(provider,"Python",url,"Python","Python")).isEmpty();
        assertThat(StudySearchService.source(provider,"Spring release","https://www.baeldung.com/spring","Spring","Python asyncio")).isEmpty();
    }
    @Test void partialFailureKeepsOfficialReferencesAndOtherPublishers() throws Exception {
        var study=mock(StudyService.class);var remote=mock(Remote.class);
        var catalog=json.readTree(new ClassPathResource("catalog.json").getInputStream());
        when(study.catalog()).thenReturn(catalog);when(study.template(anyString())).thenReturn("Python");
        when(study.official(anyString())).thenReturn(List.of(Map.of("title","Python docs","url","https://docs.python.org/3/library/asyncio.html","kind","official","why","Referência oficial")));
        when(remote.get(any())).thenAnswer(call->{
            var uri=(java.net.URI)call.getArgument(0);
            if(uri.getHost().equals("www.baeldung.com"))return new Remote.Result(200,bytes("<rss><channel><item><title>Python asyncio</title><link>https://www.baeldung.com/python-asyncio</link></item></channel></rss>"));
            if(uri.getHost().equals("dev.to"))return new Remote.Result(200,json.writeValueAsBytes(List.of(Map.of("title","Python asyncio","url","https://dev.to/example/asyncio","description","Python asyncio","tag_list",List.of("python")))));
            if(uri.getHost().equals("hn.algolia.com"))return new Remote.Result(200,bytes("{\"hits\":[{\"title\":null,\"objectID\":\"bad\"},{\"title\":\"Python asyncio\",\"objectID\":\"7\"}]}"));
            return new Remote.Result(503,bytes("unavailable"));
        });
        var search=new StudySearchService(study,remote,json);
        try {
            var result=search.search("Python asyncio");var sources=(List<?>)result.get("sources");
            assertThat(sources).hasSize(4);assertThat(result.get("warning").toString()).contains("Reddit").doesNotContain("Baeldung");
            assertThat(result.toString()).contains("Baeldung","DEV Community","Referência oficial");
        }finally{search.close();}
    }
    @Test void topicAliasesAndSpecificTermsRemainRelevantAcrossLanguages() {
        assertThat(StudySearchService.query("Spring","manual")).isEqualTo("Spring Framework");
        assertThat(StudySearchService.query("Go channels","Go")).isEqualTo("golang channels");
        assertThat(StudySearchService.relevant("Python asyncio tutorial","Python asyncio")).isTrue();
        assertThat(StudySearchService.relevant("Rust ownership borrowing","Rust ownership")).isTrue();
        assertThat(StudySearchService.relevant("Go channels","Python asyncio")).isFalse();
    }
}
