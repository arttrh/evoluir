package br.com.prumo;

import static org.junit.jupiter.api.Assertions.*;
import java.util.Map;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class LearnHarnessTests {
    private final LearnHarnessController controller = new LearnHarnessController("", "", new JsonMapper());
    @Test void refusesProgressFieldsInsteadOfTreatingVisitsAsCompletion() {
        assertEquals(400, controller.link(Map.of("sessionId", "session", "trackId", "track", "topicId", "topic", "done", true)).getStatusCode().value());
        assertEquals(400, controller.link(Map.of("sessionId", "../private", "trackId", "track", "topicId", "topic")).getStatusCode().value());
    }
    @Test void missingConfigurationDoesNotClaimSuccessfulSynchronization() {
        assertEquals(503, controller.sessions().getStatusCode().value());
        assertEquals(503, controller.link(Map.of("sessionId", "session", "trackId", "track", "topicId", "topic")).getStatusCode().value());
    }
}
