package br.com.prumo;

import java.net.URI;
import java.text.Normalizer;
import java.time.Instant;
import java.util.Map;
import org.springframework.util.MultiValueMap;
import tools.jackson.databind.JsonNode;

final class Api {
    private Api() {}
    static String parameter(MultiValueMap<String, String> query, String name, String fallback, int max) {
        var values = query.get(name);
        if (values == null) return fallback;
        if (values.size() != 1 || values.getFirst() == null || values.getFirst().trim().length() > max)
            throw new IllegalArgumentException("Parâmetro inválido: " + name + ".");
        return values.getFirst().trim();
    }
    static String text(JsonNode node, String field, int max) {
        JsonNode value = node.path(field);
        if (!value.isString() || value.asString().length() > max) throw new IllegalArgumentException("Resposta inválida da fonte.");
        return value.asString();
    }
    static String normalized(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "").toLowerCase(java.util.Locale.ROOT).trim();
    }
    static boolean safeUrl(String url) {
        try {
            URI uri = URI.create(url);
            return url.length() <= 2000 && "https".equals(uri.getScheme()) && uri.getHost() != null && uri.getUserInfo() == null;
        } catch (IllegalArgumentException error) { return false; }
    }
    static String now() { return Instant.now().toString(); }
    static Map<String, String> error(String message) { return Map.of("error", message); }
}
