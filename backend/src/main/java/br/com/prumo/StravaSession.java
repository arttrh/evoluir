package br.com.prumo;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
public class StravaSession {
    private final JsonMapper json;
    private final SecureRandom random = new SecureRandom();
    public StravaSession(JsonMapper json) { this.json = json; }
    public String seal(Object value, String secret) {
        try {
            byte[] iv = new byte[12]; random.nextBytes(iv);
            Cipher cipher = cipher(Cipher.ENCRYPT_MODE, iv, secret);
            byte[] encoded = cipher.doFinal(json.writeValueAsBytes(value));
            byte[] output = new byte[iv.length + encoded.length];
            System.arraycopy(iv, 0, output, 0, 12);
            System.arraycopy(encoded, encoded.length - 16, output, 12, 16);
            System.arraycopy(encoded, 0, output, 28, encoded.length - 16);
            return Base64.getUrlEncoder().withoutPadding().encodeToString(output);
        } catch (Exception invalid) { throw new IllegalStateException("Não foi possível proteger a sessão."); }
    }
    public JsonNode unseal(String value, String secret) {
        try {
            if (value == null || value.length() > 4096) throw new IllegalArgumentException();
            byte[] raw = Base64.getUrlDecoder().decode(value);
            if (raw.length < 29) throw new IllegalArgumentException();
            byte[] input = new byte[raw.length - 12];
            System.arraycopy(raw, 28, input, 0, raw.length - 28);
            System.arraycopy(raw, 12, input, raw.length - 28, 16);
            return json.readTree(cipher(Cipher.DECRYPT_MODE, Arrays.copyOf(raw, 12), secret).doFinal(input));
        } catch (Exception invalid) { throw new IllegalArgumentException("Sessão inválida."); }
    }
    private static Cipher cipher(int mode, byte[] iv, String secret) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        byte[] key = MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
        cipher.init(mode, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
        return cipher;
    }
}
