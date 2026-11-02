package br.com.prumo;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.net.URI;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Flow;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "prumo.api-key=test-backend-key-for-contract-tests-only", "prumo.strava-client-id=123",
    "prumo.strava-client-secret=test-client-secret", "prumo.strava-session-secret=test-session-key-for-interop-only-0000"
})
class BackendTests {
    static final String KEY = "test-backend-key-for-contract-tests-only";
    @Value("${local.server.port}") int port;
    @Autowired JsonMapper json;
    @Autowired StravaSession sessions;
    @Autowired StudyService study;
    @MockitoBean Remote remote;
    private final HttpClient client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    @BeforeEach void defaults() {
        reset(remote);
        when(remote.get(any())).thenReturn(new Remote.Result(503, new byte[0]));
        when(remote.request(any(), any(), any())).thenReturn(new Remote.Result(503, new byte[0]));
    }
    HttpResponse<String> call(String path) throws Exception { return call(path, "GET", KEY, null, null); }
    HttpResponse<String> call(String path, String method, String key, String cookie, String origin) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).method(method, HttpRequest.BodyPublishers.noBody());
        if (key != null) builder.header("X-Prumo-Backend-Key", key);
        if (cookie != null) builder.header("Cookie", cookie);
        if (origin != null) builder.header("Origin", origin);
        return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }
    Remote.Result body(Object value) { return new Remote.Result(200, json.writeValueAsBytes(value)); }
    JsonNode parsed(HttpResponse<String> response) { return json.readTree(response.body()); }
    Map<String, Object> issue(String url) {
        return Map.of("title", "[Remoto] Java Júnior", "html_url", url, "created_at", Api.now(), "body", "<script>texto do anúncio</script>", "state", "open", "labels", List.of(Map.of("name", "Júnior")));
    }
    JsonNode nodeSession() throws Exception {
        try (var stream = new ClassPathResource("node-session.json").getInputStream()) { return json.readTree(stream); }
    }
    @Test void rejectsDirectAccessWithoutKeyAndDoesNotCachePrivateBackend() throws Exception {
        for (String key : new String[]{null, "invalid"}) {
            var response = call("/api/health", "GET", key, null, null);
            assertThat(response.statusCode()).isEqualTo(401);
            assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
        }
        var response = call("/api/health"); assertThat(response.statusCode()).isEqualTo(200);
        assertThat(parsed(response).path("status").asString()).isEqualTo("UP");
        assertThat(response.body()).doesNotContain(KEY);
    }
    @Test void validatesBeforeQueryingAnySource() throws Exception {
        for (String path : List.of("/api/jobs?source=External", "/api/jobs?q=Java&q=Go", "/api/jobs?q=" + "x".repeat(101), "/api/news?page=10", "/api/news?fresh=yes", "/api/study-search?q=x"))
            assertThat(call(path).statusCode()).as(path).isEqualTo(400);
        assertThat(call("/api/jobs", "POST", KEY, null, null).statusCode()).isEqualTo(405);
        verifyNoInteractions(remote);
    }
    @Test void searchesAllowedRepositoriesAndRejectsTamperedVacancies() throws Exception {
        when(remote.get(any())).thenReturn(body(Map.of("items", List.of(issue("https://github.com/backend-br/vagas/issues/123"), issue("https://github.com.evil.test/backend-br/vagas/issues/1"), issue("https://github.com/private/data/issues/1")), "total_count", 3, "incomplete_results", false)));
        var response = call("/api/jobs?q=Java&location=Remoto&source=Backend%20BR");
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(parsed(response).path("items").size()).isEqualTo(1);
        assertThat(parsed(response).path("items").get(0).path("description").asString()).contains("<script>");
        var capture = org.mockito.ArgumentCaptor.forClass(URI.class); verify(remote).get(capture.capture());
        String query = URLDecoder.decode(capture.getValue().getRawQuery(), StandardCharsets.UTF_8);
        assertThat(query).contains("repo:backend-br/vagas", "is:open", "created:>=", "\"Java\"", "\"Remoto\"").doesNotContain("repo:frontendbr/vagas");
        assertThat(response.headers().firstValue("Cache-Control").orElse("")).contains("no-store");
    }
    @Test void distinguishesNoVacanciesFromProviderFailure() throws Exception {
        assertThat(call("/api/jobs").statusCode()).isEqualTo(503);
        when(remote.get(any())).thenReturn(body(Map.of("items", List.of(), "total_count", 0, "incomplete_results", false)));
        var response = call("/api/jobs"); assertThat(response.statusCode()).isEqualTo(200);
        assertThat(parsed(response).path("total").asInt()).isZero();
        when(remote.get(any())).thenReturn(body(Map.of("items", "invalid")));
        assertThat(call("/api/jobs").statusCode()).isEqualTo(503);
    }
    @Test void keepsOfficialSourcesWhenCommunityFailsAndRecognizesTopicAliases() throws Exception {
        for (String name : List.of("Golang", "golengue", "Go lang", "GoLink")) assertThat(study.template(name)).isEqualTo("Go");
        assertThat(study.template("Java Script")).isEqualTo("JavaScript");
        assertThat(study.template("Java e Spring Boot")).isEqualTo("Java");
        assertThat(study.template("Spring Cloud")).isEqualTo("Spring Cloud");
        assertThat(study.template("System Design")).isEqualTo("System Design");
        for (String name : List.of("Java", "Spring Boot", "Spring Cloud", "Go")) assertThat(study.official(name)).isNotEmpty();
        var response = call("/api/study-search?q=Golang");
        assertThat(response.statusCode()).isEqualTo(200); assertThat(parsed(response).path("warning").asString()).isNotBlank();
        assertThat(response.body()).contains("go.dev").doesNotContain("youtube.com");
    }
    @Test void communityOnlyAcceptsHttpsStackOverflowLinks() throws Exception {
        when(remote.get(any())).thenReturn(body(Map.of("items", List.of(Map.of("title", "Solução aceita", "link", "https://stackoverflow.com/questions/1/test", "score", 12, "is_answered", true), Map.of("title", "Outra", "link", "https://evil.test/", "score", 3, "is_answered", true)))));
        var response = call("/api/study-search?q=Java"); assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("Solução aceita").doesNotContain("evil.test");
    }
    @Test void parsesRssAtomAndRejectsExternalEntitiesAndExcessiveNesting() {
        var feed = json.valueToTree(Map.of("name", "Go Blog", "url", "https://go.dev/blog/feed.atom", "category", "Go"));
        String atom = "<feed xmlns='http://www.w3.org/2005/Atom'><entry><title>Go &amp; HTTP</title><link href='/blog/test' rel='alternate'/><published>2026-01-01T10:00:00Z</published></entry></feed>";
        var items = NewsService.parseFeed(atom.getBytes(StandardCharsets.UTF_8), feed);
        assertThat(items).hasSize(1); assertThat(items.getFirst().get("url")).isEqualTo("https://go.dev/blog/test");
        String rss = "<rss><channel><item><title>Go</title><link>https://go.dev/blog/test</link><pubDate>Thu, 01 Jan 2026 10:00:00 GMT</pubDate></item></channel></rss>";
        assertThat(NewsService.parseFeed(rss.getBytes(StandardCharsets.UTF_8), feed)).hasSize(1);
        String hostile = "<!DOCTYPE rss [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><rss><channel><item>&xxe;</item></channel></rss>";
        assertThatThrownBy(() -> NewsService.parseFeed(hostile.getBytes(StandardCharsets.UTF_8), feed)).isInstanceOf(IllegalArgumentException.class);
        String nested = "<rss>".repeat(45) + "</rss>".repeat(45);
        assertThatThrownBy(() -> NewsService.parseFeed(nested.getBytes(StandardCharsets.UTF_8), feed)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> NewsService.parseFeed(new byte[2_000_001], feed)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void paginatesRealQueriesAndDeduplicatesTrackingParameters() throws Exception {
        when(remote.get(any())).thenAnswer(invocation -> {
            URI url = invocation.getArgument(0);
            if (!url.getHost().equals("hn.algolia.com")) return new Remote.Result(503, new byte[0]);
            boolean second = url.getRawQuery().contains("page=1");
            return body(Map.of("nbPages", 2, "hits", List.of(Map.of("title", second ? "Go segunda notícia" : "Go primeira notícia", "url", "https://go.dev/blog/" + (second ? "second" : "first"), "created_at", Api.now(), "objectID", "1"))));
        });
        var first = call("/api/news?q=golengue&fresh=1"); var second = call("/api/news?q=Go&page=1");
        assertThat(first.statusCode()).isEqualTo(200); assertThat(second.statusCode()).isEqualTo(200);
        assertThat(parsed(first).path("hasMore").asBoolean()).isTrue(); assertThat(parsed(second).path("hasMore").asBoolean()).isFalse();
        assertThat(parsed(first).path("items").get(0).path("dateKind").asString()).isEqualTo("shared");
        assertThat(parsed(first).path("items").get(0).path("url")).isNotEqualTo(parsed(second).path("items").get(0).path("url"));
        assertThat(NewsService.key("https://go.dev/post/?b=2&utm_source=test&a=1#section")).isEqualTo("https://go.dev/post?a=1&b=2");
    }
    @Test void acceptsExistingNodeEncryptedSessionAndRejectsTampering() throws Exception {
        var fixture = nodeSession(); String secret = fixture.path("secret").asString(), cookie = fixture.path("cookie").asString();
        var decoded = sessions.unseal(cookie, secret);
        assertThat(decoded).isEqualTo(fixture.path("payload"));
        assertThat(sessions.unseal(sessions.seal(decoded, secret), secret)).isEqualTo(decoded);
        assertThatThrownBy(() -> sessions.unseal(cookie, secret + "wrong")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> sessions.unseal("x" + cookie.substring(1), secret)).isInstanceOf(IllegalArgumentException.class);
        var status = call("/api/strava?op=status", "GET", KEY, "__Host-evoluir-strava=" + cookie, null);
        assertThat(parsed(status).path("connected").asBoolean()).isTrue(); assertThat(status.body()).doesNotContain("test-access");
    }
    @Test void protectsOAuthStateAndKeepsSecureCookieAttributes() throws Exception {
        var connect = call("/api/strava?op=connect"); assertThat(connect.statusCode()).isEqualTo(302);
        String cookie = connect.headers().firstValue("Set-Cookie").orElseThrow();
        assertThat(cookie).contains("__Host-evoluir-oauth=", "HttpOnly", "Secure", "SameSite=Lax", "Path=/");
        String location = connect.headers().firstValue("Location").orElseThrow();
        assertThat(location).startsWith("https://www.strava.com/oauth/authorize?");
        String state = java.util.Arrays.stream(URI.create(location).getRawQuery().split("&")).filter(s -> s.startsWith("state=")).findFirst().orElseThrow().substring(6);
        var rejected = call("/api/strava?op=callback&code=test&scope=activity%3Aread_all&state=wrong", "GET", KEY, cookie.split(";", 2)[0], null);
        assertThat(rejected.headers().firstValue("Location").orElse("")).endsWith("?strava=error"); verify(remote, never()).request(any(), any(), any());
        when(remote.request(any(), any(), any())).thenReturn(body(Map.of("access_token", "test-access", "refresh_token", "test-refresh", "expires_at", 4102444800L)));
        var response = call("/api/strava?op=callback&code=test&scope=activity%3Aread_all&state=" + state, "GET", KEY, cookie.split(";", 2)[0], null);
        assertThat(response.statusCode()).isEqualTo(303); assertThat(response.headers().allValues("Set-Cookie")).hasSize(2);
        assertThat(response.headers().firstValue("Location").orElse("")).endsWith("?strava=connected");
    }
    @Test void activitiesNeverExposeProviderTokensAndDisconnectChecksOrigin() throws Exception {
        String cookie = "__Host-evoluir-strava=" + nodeSession().path("cookie").asString();
        var activity = Map.of("id", 123, "name", "Corrida", "distance", 5000, "moving_time", 1800, "elapsed_time", 1900, "start_date", Api.now(), "sport_type", "Run");
        when(remote.request(any(), any(), any())).thenReturn(body(List.of(activity)));
        var response = call("/api/strava?op=activities", "GET", KEY, cookie, null);
        assertThat(response.statusCode()).isEqualTo(200); assertThat(parsed(response).path("activities").get(0).path("movingTime").asInt()).isEqualTo(1800);
        assertThat(response.body()).doesNotContain("test-access", "test-refresh", "access_token");
        assertThat(call("/api/strava?op=disconnect", "POST", KEY, cookie, "https://evil.test").statusCode()).isEqualTo(403);
        when(remote.request(any(), any(), any())).thenReturn(new Remote.Result(429, new byte[0]));
        assertThat(call("/api/strava?op=activities", "GET", KEY, cookie, null).statusCode()).isEqualTo(429);
        when(remote.request(any(), any(), any())).thenReturn(new Remote.Result(401, new byte[0]));
        var revoked = call("/api/strava?op=activities", "GET", KEY, cookie, null); assertThat(revoked.statusCode()).isEqualTo(401);
        assertThat(revoked.headers().firstValue("Set-Cookie").orElse("")).contains("Max-Age=0");
    }
    @Test void refreshesExpiredTokenAndDropsUnexpectedProviderFields() throws Exception {
        var expired = json.valueToTree(Map.of("token", Map.of("access_token", "old-access", "refresh_token", "old-refresh", "expires_at", 1), "until", 4102444800000L));
        String cookie = "__Host-evoluir-strava=" + sessions.seal(expired, "test-session-key-for-interop-only-0000");
        when(remote.request(any(), any(), any())).thenAnswer(invocation -> {
            URI uri = invocation.getArgument(0);
            if (uri.getPath().equals("/oauth/token")) return body(Map.of("access_token", "new-access", "refresh_token", "new-refresh", "expires_at", 4102444800L, "athlete", Map.of("email", "private@example.test")));
            assertThat((String) invocation.getArgument(2)).isEqualTo("new-access");
            return body(List.of());
        });
        var response = call("/api/strava?op=activities", "GET", KEY, cookie, null);
        assertThat(response.statusCode()).isEqualTo(200);
        String saved = response.headers().firstValue("Set-Cookie").orElseThrow().split(";", 2)[0].split("=", 2)[1];
        var decoded = sessions.unseal(saved, "test-session-key-for-interop-only-0000");
        assertThat(decoded.path("token").size()).isEqualTo(3); assertThat(decoded.toString()).doesNotContain("athlete", "private@example.test");
        assertThat(response.body()).doesNotContain("new-access", "new-refresh");
    }
    @Test void requiresStrongConfigurationAndCancelsOversizeResponseWhileStreaming() {
        assertThatThrownBy(() -> new Settings("short", "https://example.test", "", "", "")).isInstanceOf(IllegalArgumentException.class);
        var cancelled = new AtomicBoolean(); var subscriber = Remote.limitedBody(3);
        subscriber.onSubscribe(new Flow.Subscription() { public void request(long n) {} public void cancel() { cancelled.set(true); } });
        subscriber.onNext(List.of(ByteBuffer.wrap(new byte[4])));
        assertThat(cancelled).isTrue(); assertThat(subscriber.getBody().toCompletableFuture()).isCompletedExceptionally();
    }
}
