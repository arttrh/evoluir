package br.com.prumo;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.json.JsonMapper;

@RestController
public class LearnHarnessController {
    private final String origin;
    private final String key;
    private final JsonMapper json;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5))
        .followRedirects(HttpClient.Redirect.NEVER).build();

    public LearnHarnessController(@Value("${LEARNHARNESS_URL:}") String origin,
            @Value("${LEARNHARNESS_KEY:}") String key, JsonMapper json) {
        this.origin = origin; this.key = key; this.json = json;
    }
    @GetMapping("/api/study-sessions")
    public ResponseEntity<?> sessions() { return forward(null); }

    @PostMapping("/api/study-sessions")
    public ResponseEntity<?> link(@RequestBody Map<String, Object> value) {
        if (value.size() != 3 || !value.keySet().containsAll(java.util.List.of("sessionId", "trackId", "topicId"))
                || !value.values().stream().allMatch(item -> item instanceof String text && text.matches("[A-Za-z0-9_-]{1,100}")))
            return ResponseEntity.badRequest().body(Api.error("Confira a sessão, a trilha e o tópico."));
        return forward(json.writeValueAsString(value));
    }
    private ResponseEntity<?> forward(String body) {
        try {
            URI uri = URI.create(origin);
            if (!"https".equals(uri.getScheme()) || uri.getHost() == null || !uri.getHost().endsWith(".onrender.com")
                    || uri.getUserInfo() != null || uri.getQuery() != null || uri.getFragment() != null
                    || uri.getPort() != -1 || !(uri.getPath().isEmpty() || uri.getPath().equals("/")) || key.length() < 43)
                throw new IllegalStateException("Integração não configurada.");
            var builder = HttpRequest.newBuilder(uri.resolve("/prumo/records")).timeout(Duration.ofSeconds(45))
                .header("x-prumo-gateway", key).header("Accept", "application/json");
            if (body != null) builder.header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body));
            var response = client.sendAsync(builder.build(), ignored -> Remote.limitedBody(2_000_000))
                .get(46, java.util.concurrent.TimeUnit.SECONDS);
            return ResponseEntity.status(response.statusCode()).contentType(MediaType.APPLICATION_JSON).body(response.body());
        } catch (Exception error) {
            if (error instanceof InterruptedException) Thread.currentThread().interrupt();
            return ResponseEntity.status(503).body(Api.error("O LearnHarness está iniciando ou indisponível. Aguarde um minuto e atualize."));
        }
    }
}
