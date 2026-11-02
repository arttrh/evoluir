package br.com.prumo;

import java.net.URI;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("prumo")
public record Settings(String apiKey, String appOrigin, String stravaClientId,
                       String stravaClientSecret, String stravaSessionSecret) {
    public Settings {
        if (apiKey == null || apiKey.length() < 32) {
            throw new IllegalArgumentException("Configure BACKEND_API_KEY com pelo menos 32 caracteres, somente no servidor.");
        }
        URI origin = URI.create(appOrigin);
        if (!"https".equals(origin.getScheme()) || origin.getHost() == null || origin.getUserInfo() != null
                || origin.getPort() != -1 || !origin.getRawPath().isEmpty() && !origin.getRawPath().equals("/")
                || origin.getRawQuery() != null || origin.getRawFragment() != null) {
            throw new IllegalArgumentException("APP_ORIGIN deve ser uma origem HTTPS válida.");
        }
        appOrigin = "https://" + origin.getHost();
    }
    public boolean stravaConfigured() {
        return stravaClientId != null && stravaClientId.matches("[0-9]+")
            && stravaClientSecret != null && !stravaClientSecret.isBlank()
            && stravaSessionSecret != null && stravaSessionSecret.length() >= 32;
    }
}
