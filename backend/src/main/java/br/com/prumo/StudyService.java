package br.com.prumo;

import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class StudyService {
    private final JsonNode catalog;
    private final Remote remote;
    private final JsonMapper json;
    public StudyService(Remote remote, JsonMapper json) throws java.io.IOException {
        this.remote = remote; this.json = json;
        try (var input = new ClassPathResource("catalog.json").getInputStream()) { catalog = json.readTree(input); }
    }
    JsonNode catalog() { return catalog; }
    String template(String query) {
        String subject = Api.normalized(query);
        if (Pattern.compile("spring[\\s-]*cloud").matcher(subject).find()) return "Spring Cloud";
        if (Pattern.compile("\\bjava\\b").matcher(subject).find() && Pattern.compile("spring[\\s-]*(boot|framework|security)").matcher(subject).find()) return "Java";
        for (var rule : catalog.path("matchers")) {
            if (Pattern.compile(rule.path("pattern").asString()).matcher(subject).find()) return rule.path("name").asString();
        }
        return "manual";
    }
    List<Map<String, Object>> official(String query) {
        var modules = catalog.path("tracks").path(template(query));
        var resources = new ArrayList<Map<String, Object>>();
        for (var module : modules) {
            var topics = module.path("topics");
            if (!topics.isEmpty()) resources.addAll(enrich(topics.get(0)).stream().limit(1).toList());
        }
        for (var module : modules) for (var topic : module.path("topics")) resources.addAll(enrich(topic));
        var ignored = Set.of("spring", "cloud", "quero", "estudar", "aprender", "melhorar", "software");
        var terms = java.util.Arrays.stream(Api.normalized(query).split("\\W+")).filter(t -> t.length() > 2 && !ignored.contains(t)).toList();
        resources.sort(Comparator.comparingLong((Map<String, Object> r) -> terms.stream()
            .filter(t -> Api.normalized(r.get("title") + " " + r.get("why") + " " + r.get("url")).contains(t)).count()).reversed());
        var seen = new HashSet<Object>();
        return resources.stream().filter(r -> seen.add(r.get("url"))).limit(8).toList();
    }
    private List<Map<String, Object>> enrich(JsonNode topic) {
        var result = new ArrayList<Map<String, Object>>();
        for (var resource : topic.path("resources")) {
            String url = resource.path("url").asString();
            if (Set.of("youtube.com", "www.youtube.com", "youtu.be").contains(URI.create(url).getHost())) continue;
            result.add(Map.of("title", resource.path("title").asString(), "url", url, "kind", "official",
                "why", "Para " + topic.path("title").asString() + ": " + resource.path("why").asString()));
        }
        return result;
    }
    public Map<String, Object> search(String query) {
        var sources = new ArrayList<>(official(query));
        String warning = "";
        try {
            String term = template(query).equals("Go") ? query.replaceAll("(?i)\\b(golang|golengue|golink|go(?:\\s+lang)?)\\b", "golang") : query;
            var response = remote.get(URI.create("https://api.stackexchange.com/2.3/search/advanced?" + Remote.parameters(Map.of(
                "site", "stackoverflow", "q", term, "pagesize", "5", "order", "desc", "sort", "votes", "accepted", "true", "closed", "false"))));
            if (response.status() != 200) throw new IllegalStateException();
            var root = json.readTree(response.body());
            if (!root.path("items").isArray() || root.path("items").size() > 5 || root.has("backoff") || root.has("error_id")) throw new IllegalStateException();
            for (var item : root.path("items")) {
                String url = Api.text(item, "link", 2000);
                if (!Api.safeUrl(url) || !"stackoverflow.com".equals(URI.create(url).getHost())) continue;
                String title = Api.text(item, "title", 500);
                if (title.isBlank() || !item.path("score").isNumber() || !item.path("is_answered").isBoolean()) continue;
                sources.add(Map.of("title", title, "url", url, "kind", "community", "why",
                    "Discussão com resposta aceita e " + item.path("score").asInt() + " votos. Use depois dos fundamentos para investigar dúvidas e comparar soluções; confira as versões citadas."));
            }
        } catch (RuntimeException unavailable) {
            warning = "A busca na comunidade não respondeu. As referências oficiais continuam disponíveis.";
        }
        return Map.of("query", query, "sources", sources, "warning", warning, "searchedAt", Api.now());
    }
}
