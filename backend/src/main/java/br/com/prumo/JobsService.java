package br.com.prumo;

import java.net.URI;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

@Service
public class JobsService {
    private final Remote remote;
    private final JsonMapper json;
    public JobsService(Remote remote, JsonMapper json) { this.remote = remote; this.json = json; }
    public Map<String, Object> search(String query, String location, String source) {
        var terms = new ArrayList<>(Arrays.stream((query + " " + location).replaceAll("[^\\p{L}\\p{N}+#.\\s-]", " ")
            .split("\\s+")).filter(word -> word.matches(".*[\\p{L}\\p{N}].*")).map(word -> "\"" + word + "\"").toList());
        if (!source.equals("Frontend BR")) terms.add("repo:backend-br/vagas");
        if (!source.equals("Backend BR")) terms.add("repo:frontendbr/vagas");
        terms.addAll(List.of("is:issue", "is:open", "in:title,body", "created:>=" + Instant.now().minus(90, ChronoUnit.DAYS).toString().substring(0, 10)));
        URI url = URI.create("https://api.github.com/search/issues?" + Remote.parameters(Map.of("q", String.join(" ", terms),
            "sort", "created", "order", "desc", "per_page", "30")));
        var response = remote.get(url);
        if (response.status() != 200) throw new IllegalStateException("A fonte de vagas está indisponível ou atingiu o limite de consultas.");
        var root = json.readTree(response.body());
        if (!root.path("items").isArray() || root.path("items").size() > 30 || !root.path("total_count").isIntegralNumber()
                || root.path("total_count").asLong() < 0 || !root.path("incomplete_results").isBoolean())
            throw new IllegalStateException("Resposta inválida da fonte de vagas.");
        var items = new ArrayList<Map<String, Object>>();
        for (var issue : root.path("items")) {
            try {
                String link = Api.text(issue, "html_url", 2000);
                if (!link.matches("https://github\\.com/(backend-br|frontendbr)/vagas/issues/[1-9][0-9]*")
                        || !issue.path("state").asString("").equals("open") || issue.has("pull_request")) continue;
                String title = Api.text(issue, "title", 10000);
                if (title.isBlank()) continue;
                String published = Instant.parse(Api.text(issue, "created_at", 40)).toString();
                if (!issue.path("labels").isArray()) continue;
                var labels = new ArrayList<String>();
                for (var label : issue.path("labels")) {
                    if (labels.size() == 30) break;
                    String name = Api.text(label, "name", 10000);
                    labels.add(name.substring(0, Math.min(name.length(), 100)));
                }
                String body = issue.path("body").isNull() ? "" : Api.text(issue, "body", 3_000_000);
                var item = new LinkedHashMap<String, Object>();
                item.put("title", title.substring(0, Math.min(title.length(), 180)));
                item.put("url", link); item.put("publishedAt", published); item.put("labels", labels);
                item.put("source", link.contains("/backend-br/") ? "Backend BR" : "Frontend BR");
                item.put("description", body.substring(0, Math.min(body.length(), 12000)));
                items.add(item);
            } catch (IllegalArgumentException invalid) { /* Uma issue inválida não impede os outros anúncios. */ }
        }
        return Map.of("items", items, "total", root.path("total_count").asLong(),
            "incomplete", root.path("incomplete_results").asBoolean(), "updatedAt", Api.now());
    }
}
