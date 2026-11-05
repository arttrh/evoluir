package br.com.prumo;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.HttpRequestMethodNotSupportedException;

@RestController
public class ApiController {
    private final JobsService jobs;
    private final StudySearchService study;
    private final NewsService news;
    public ApiController(JobsService jobs, StudySearchService study, NewsService news) { this.jobs = jobs; this.study = study; this.news = news; }
    @GetMapping("/api/news")
    public ResponseEntity<?> news(@RequestParam MultiValueMap<String, String> parameters) {
        String query = Api.parameter(parameters, "q", "", 120);
        String page = Api.parameter(parameters, "page", "0", 1);
        String fresh = Api.parameter(parameters, "fresh", "0", 1);
        if (!page.matches("[0-9]") || !fresh.matches("[01]")) throw new IllegalArgumentException("Página inválida.");
        var result = news.search(query, Integer.parseInt(page));
        if (((List<?>) result.get("items")).isEmpty() && !((List<?>) result.get("unavailableSources")).isEmpty())
            return ResponseEntity.status(503).body(Api.error("As fontes de notícias não responderam agora. Tente novamente em alguns minutos."));
        return ResponseEntity.ok().body(result);
    }
    @GetMapping("/api/study-search")
    public ResponseEntity<?> study(@RequestParam MultiValueMap<String, String> parameters) {
        String query = Api.parameter(parameters, "q", "", 120);
        if (query.length() < 2) throw new IllegalArgumentException("Informe um assunto entre 2 e 120 caracteres.");
        return ResponseEntity.ok().body(study.search(query));
    }
    @GetMapping("/api/jobs")
    public ResponseEntity<?> jobs(@RequestParam MultiValueMap<String, String> parameters) {
        String query = Api.parameter(parameters, "q", "", 100);
        String location = Api.parameter(parameters, "location", "", 60);
        String source = Api.parameter(parameters, "source", "Todas", 20);
        if (!List.of("Todas", "Backend BR", "Frontend BR").contains(source)) throw new IllegalArgumentException("Fonte inválida.");
        try {
            return ResponseEntity.ok()
                .body(jobs.search(query, location, source));
        } catch (RuntimeException unavailable) {
            return ResponseEntity.status(503).body(Api.error("A fonte de vagas está indisponível ou atingiu o limite de consultas. Tente novamente em alguns minutos."));
        }
    }
    @GetMapping("/api/health")
    public Map<String, String> health() { return Map.of("status", "UP"); }
}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<?> invalid(IllegalArgumentException error) {
        return ResponseEntity.badRequest().body(Api.error("Confira os parâmetros da consulta."));
    }
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<?> method() { return ResponseEntity.status(405).body(Api.error("Método não permitido.")); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<?> unavailable() { return ResponseEntity.status(503).body(Api.error("O serviço não está disponível agora.")); }
}
