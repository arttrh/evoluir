package br.com.prumo;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.Flow;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class Remote {
    public record Result(int status, byte[] body) {}
    private final HttpClient client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER)
        .connectTimeout(Duration.ofSeconds(3)).build();
    public static String parameters(Map<String, String> values) {
        return values.entrySet().stream().map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
            .collect(Collectors.joining("&"));
    }
    private static String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    public Result get(URI uri) { return request(uri, null, null); }
    public Result request(URI uri, Map<String, String> form, String token) {
        if (!"https".equals(uri.getScheme()) || uri.getUserInfo() != null
                || !List.of("api.github.com", "hn.algolia.com", "api.stackexchange.com", "www.strava.com",
                    "www.baeldung.com", "medium.com", "dev.to", "www.reddit.com", "blog.jetbrains.com", "inside.java", "spring.io", "feed.infoq.com", "martinfowler.com", "go.dev", "blog.python.org",
                    "devblogs.microsoft.com", "kubernetes.io", "blog.talosintelligence.com", "www.microsoft.com")
                    .contains(uri.getHost())) throw new IllegalArgumentException("Destino não permitido.");
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(9))
            .header("User-Agent", "Prumo/1.0").header("Accept", "application/json, application/atom+xml, application/rss+xml, application/xml");
        if (token != null) builder.header("Authorization", "Bearer " + token);
        if (form != null) builder.header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString(parameters(form)));
        var pending = client.sendAsync(builder.build(), ignored -> limitedBody(3_000_000));
        try {
            var response = pending.get(10, TimeUnit.SECONDS);
            return new Result(response.statusCode(), response.body());
        } catch (Exception exception) {
            pending.cancel(true);
            if (exception instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new IllegalStateException("A fonte não respondeu dentro do limite.");
        }
    }
    static HttpResponse.BodySubscriber<byte[]> limitedBody(int maximum) {
        var delegate = HttpResponse.BodySubscribers.ofByteArray();
        return new HttpResponse.BodySubscriber<>() {
            private Flow.Subscription subscription;
            private int received;
            public CompletionStage<byte[]> getBody() { return delegate.getBody(); }
            public void onSubscribe(Flow.Subscription value) { subscription = value; delegate.onSubscribe(value); }
            public void onNext(List<ByteBuffer> chunks) {
                long size = chunks.stream().mapToLong(ByteBuffer::remaining).sum();
                if (size > maximum - received) {
                    subscription.cancel(); delegate.onError(new IOException("Resposta acima do limite.")); return;
                }
                received += (int) size; delegate.onNext(chunks);
            }
            public void onError(Throwable error) { delegate.onError(error); }
            public void onComplete() { delegate.onComplete(); }
        };
    }
}
