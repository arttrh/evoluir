package br.com.prumo;

import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@RestController
public class StravaController {
    static final String SESSION = "__Host-evoluir-strava", STATE = "__Host-evoluir-oauth";
    private final Settings config;
    private final Remote remote;
    private final JsonMapper json;
    private final StravaSession sessions;
    public StravaController(Settings config, Remote remote, JsonMapper json, StravaSession sessions) {
        this.config = config; this.remote = remote; this.json = json; this.sessions = sessions;
    }
    private static String cookie(String name, String value, long age) {
        return name + "=" + value + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=" + age;
    }
    private static String readCookie(HttpServletRequest request, String name) {
        String header = request.getHeader("Cookie");
        if (header == null) return "";
        for (String part : header.split(";")) {
            String[] entry = part.trim().split("=", 2);
            if (entry.length == 2 && entry[0].equals(name)) return entry[1];
        }
        return "";
    }
    static JsonNode validateToken(JsonNode token) {
        if (Api.text(token, "access_token", 1000).isEmpty() || Api.text(token, "refresh_token", 1000).isEmpty()
                || !token.path("expires_at").isIntegralNumber() || token.path("expires_at").asLong() <= 0)
            throw new IllegalArgumentException("Token inválido.");
        return tools.jackson.databind.node.JsonNodeFactory.instance.objectNode()
            .put("access_token", token.path("access_token").asString())
            .put("refresh_token", token.path("refresh_token").asString())
            .put("expires_at", token.path("expires_at").asLong());
    }
    private JsonNode tokenRequest(Map<String, String> form) {
        var response = remote.request(URI.create("https://www.strava.com/oauth/token"), form, null);
        if (response.status() != 200) throw new IllegalStateException();
        return validateToken(json.readTree(response.body()));
    }
    private void saveToken(HttpHeaders headers, JsonNode token) {
        headers.add("Set-Cookie", cookie(SESSION, sessions.seal(Map.of("token", token, "until", System.currentTimeMillis() + 604800000L), config.stravaSessionSecret()), 604800));
    }
    private static ResponseEntity<?> result(int status, HttpHeaders headers, Object body) {
        return ResponseEntity.status(status).headers(headers).body(body);
    }
    private static ResponseEntity<?> redirect(int status, HttpHeaders headers, String location) {
        headers.setLocation(URI.create(location)); return result(status, headers, null);
    }
    @RequestMapping("/api/strava")
    public ResponseEntity<?> handle(HttpServletRequest request, @RequestParam MultiValueMap<String, String> parameters) {
        var headers = new HttpHeaders(); headers.set("Cache-Control", "private, no-store"); headers.set("Vary", "Cookie");
        String op = Api.parameter(parameters, "op", "status", 20), method = request.getMethod();
        JsonNode token = null;
        if (config.stravaConfigured()) {
            try {
                var session = sessions.unseal(readCookie(request, SESSION), config.stravaSessionSecret());
                if (session.path("until").isIntegralNumber() && session.path("until").asLong() > System.currentTimeMillis())
                    token = validateToken(session.path("token"));
            } catch (RuntimeException invalid) { /* Uma sessão adulterada não concede acesso. */ }
        }
        if (op.equals("status") && method.equals("GET"))
            return result(200, headers, Map.of("configured", config.stravaConfigured(), "connected", token != null));
        if (!config.stravaConfigured()) return result(503, headers, Api.error("A conexão Strava ainda não foi configurada pelo responsável pelo aplicativo."));
        String origin = config.appOrigin(), callback = origin + "/api/strava?op=callback";
        if (op.equals("connect") && method.equals("GET")) {
            byte[] bytes = new byte[32]; new SecureRandom().nextBytes(bytes); String state = HexFormat.of().formatHex(bytes);
            headers.add("Set-Cookie", cookie(STATE, sessions.seal(Map.of("state", state, "until", System.currentTimeMillis() + 600000), config.stravaSessionSecret()), 600));
            return redirect(302, headers, "https://www.strava.com/oauth/authorize?" + Remote.parameters(Map.of("client_id", config.stravaClientId(),
                "redirect_uri", callback, "response_type", "code", "approval_prompt", "auto", "scope", "read,activity:read_all", "state", state)));
        }
        if (op.equals("callback") && method.equals("GET")) {
            headers.add("Set-Cookie", cookie(STATE, "", 0));
            try {
                var state = sessions.unseal(readCookie(request, STATE), config.stravaSessionSecret());
                String returned = Api.parameter(parameters, "state", "", 1000);
                if (!state.path("until").isIntegralNumber() || state.path("until").asLong() < System.currentTimeMillis()
                        || !MessageDigest.isEqual(Api.text(state, "state", 1000).getBytes(StandardCharsets.UTF_8), returned.getBytes(StandardCharsets.UTF_8))) throw new IllegalArgumentException();
                String code = Api.parameter(parameters, "code", "", 2000);
                String scope = Api.parameter(parameters, "scope", "", 500);
                if (parameters.containsKey("error") || code.isEmpty() || !List.of(scope.split("[, ]+")).contains("activity:read_all")) throw new IllegalArgumentException();
                token = tokenRequest(Map.of("client_id", config.stravaClientId(), "client_secret", config.stravaClientSecret(), "code", code, "grant_type", "authorization_code"));
                saveToken(headers, token); return redirect(303, headers, origin + "/?strava=connected");
            } catch (RuntimeException invalid) { return redirect(303, headers, origin + "/?strava=error"); }
        }
        if (token == null) return result(401, headers, Api.error("Conecte sua conta Strava para consultar suas atividades."));
        if (op.equals("disconnect") && method.equals("POST")) {
            if (!origin.equals(request.getHeader("Origin"))) return result(403, headers, Api.error("Origem não permitida."));
            try {
                var response = remote.request(URI.create("https://www.strava.com/oauth/deauthorize"), Map.of("access_token", token.path("access_token").asString()), null);
                if (response.status() != 200) return result(502, headers, Api.error("Não foi possível revogar agora. Você também pode revogar em Strava → Configurações → Meus aplicativos."));
                headers.add("Set-Cookie", cookie(SESSION, "", 0)); return result(200, headers, Map.of("disconnected", true));
            } catch (RuntimeException unavailable) { return result(502, headers, Api.error("Falha de conexão. Revogue o acesso nas configurações do Strava ou tente novamente.")); }
        }
        if (op.equals("activities") && method.equals("GET")) {
            try {
                if (token.path("expires_at").asLong() <= Instant.now().getEpochSecond() + 60) {
                    token = tokenRequest(Map.of("client_id", config.stravaClientId(), "client_secret", config.stravaClientSecret(), "refresh_token", token.path("refresh_token").asString(), "grant_type", "refresh_token"));
                    saveToken(headers, token);
                }
                var response = remote.request(URI.create("https://www.strava.com/api/v3/athlete/activities?per_page=100&page=1"), null, token.path("access_token").asString());
                if (response.status() == 429) return result(429, headers, Api.error("O Strava atingiu o limite de consultas. Aguarde antes de atualizar."));
                if (response.status() == 401) {
                    headers.add("Set-Cookie", cookie(SESSION, "", 0)); return result(401, headers, Api.error("Autorização expirada ou revogada. Conecte novamente."));
                }
                if (response.status() != 200) throw new IllegalStateException();
                var activities = json.readTree(response.body());
                if (!activities.isArray() || activities.size() > 100) throw new IllegalArgumentException();
                var output = new ArrayList<Map<String, Object>>();
                for (var activity : activities) {
                    long id = integer(activity, "id", true), moving = integer(activity, "moving_time", false), elapsed = integer(activity, "elapsed_time", false);
                    String name = Api.text(activity, "name", 500), date = Instant.parse(Api.text(activity, "start_date", 40)).toString();
                    double distance = number(activity, "distance"); if (distance < 0) throw new IllegalArgumentException();
                    String sport = Api.text(activity, "sport_type", 100);
                    if (!List.of("Run", "TrailRun", "VirtualRun").contains(sport)) continue;
                    var item = new LinkedHashMap<String, Object>();
                    item.put("id", id); item.put("name", name); item.put("distance", distance); item.put("movingTime", moving); item.put("elapsedTime", elapsed); item.put("date", date);
                    item.put("elevation", activity.has("total_elevation_gain") ? number(activity, "total_elevation_gain") : null);
                    if (item.get("elevation") != null && (double) item.get("elevation") < 0) throw new IllegalArgumentException();
                    item.put("heartRate", activity.has("average_heartrate") ? number(activity, "average_heartrate") : null);
                    item.put("device", activity.has("device_name") ? Api.text(activity, "device_name", 2000) : null);
                    item.put("url", "https://www.strava.com/activities/" + id); output.add(item);
                }
                return result(200, headers, Map.of("activities", output, "checkedAt", Api.now(), "limit", 100));
            } catch (RuntimeException unavailable) { return result(502, headers, Api.error("Não foi possível consultar o Strava. Tente novamente ou reconecte sua conta.")); }
        }
        return result(405, headers, Api.error("Método ou operação não permitida."));
    }
    private static long integer(JsonNode node, String field, boolean positive) {
        var value = node.path(field);
        if (!value.isIntegralNumber() || value.asLong() < (positive ? 1 : 0)) throw new IllegalArgumentException();
        return value.asLong();
    }
    private static double number(JsonNode node, String field) {
        var value = node.path(field);
        if (!value.isNumber() || !Double.isFinite(value.doubleValue())) throw new IllegalArgumentException();
        return value.doubleValue();
    }
}
