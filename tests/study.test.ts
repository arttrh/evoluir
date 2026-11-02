import { it, expect } from "vitest";
import { createTrack, expandTrack } from "../src/catalog";
import { dataSchema, emptyData, trackProgress } from "../src/model";
import { officialSources, roadmapFor, topicModule } from "../src/study-sources";
it("Spring Cloud tem sequência completa e cada tópico tem critérios, prática e fontes", () => {
  const t = createTrack("Spring Cloud", "auto");
  expect(t.modules).toHaveLength(9);
  expect(trackProgress(t).total).toBe(25);
  expect(
    t.modules
      .flatMap((m) => m.topics)
      .every(
        (tp) =>
          tp.criteria.length > 20 &&
          tp.exercise.length > 20 &&
          tp.resources.length > 0,
      ),
  ).toBe(true);
});
it("amplia a trilha antiga sem apagar IDs, notas de conclusão ou progresso", () => {
  const full = createTrack("Spring Cloud", "auto");
  const old = {
    ...full,
    modules: [
      {
        ...full.modules[0],
        topics: [{ ...full.modules[0].topics[0], done: true }],
      },
    ],
  };
  const expanded = expandTrack(old);
  expect(expanded.modules[0].id).toBe(old.modules[0].id);
  expect(expanded.modules.flatMap((m) => m.topics)).toContainEqual(
    old.modules[0].topics[0],
  );
  expect(trackProgress(expanded)).toEqual({ done: 1, total: 25 });
  expect(trackProgress(expandTrack(expanded)).total).toBe(25);
});
it("fontes oficiais são contextualizadas, sem links repetidos", () => {
  const sources = officialSources("Spring Cloud");
  expect(sources.length).toBeGreaterThan(3);
  expect(new Set(sources.map((s) => s.url)).size).toBe(sources.length);
  expect(sources.every((s) => s.why.length > 20)).toBe(true);
  expect(roadmapFor("Spring Cloud")?.url).toBe("https://roadmap.sh/backend");
});
it("gera um módulo editável para um foco informado sem alterar a estrutura do backup", () => {
  const track = createTrack("Spring Cloud", "auto");
  track.modules = [topicModule("Gateway", officialSources("Spring Cloud"))];
  expect(() =>
    dataSchema.parse({ ...emptyData(), tracks: [track] }),
  ).not.toThrow();
  expect(track.modules[0].topics).toHaveLength(2);
});

it("foco em Gateway e Eureka usa prática específica e referências do tópico", () => {
  const track = createTrack("Spring Cloud", "auto");
  const sources = officialSources("Spring Cloud");
  expect(sources.some((s) => s.url.includes("spring-cloud-gateway"))).toBe(
    true,
  );
  const gateway = topicModule("Gateway", sources, track),
    eureka = topicModule("Eureka", sources, track);
  expect(gateway.topics).toHaveLength(3);
  expect(
    gateway.topics[0].resources.some((r) =>
      r.url.includes("spring-cloud-gateway"),
    ),
  ).toBe(true);
  expect(eureka.topics[0].exercise).toContain("Eureka");
  expect(
    new Set([...gateway.topics, ...eureka.topics].map((t) => t.id)).size,
  ).toBe(gateway.topics.length + eureka.topics.length);
});
it.each([
  "Java",
  "Docker",
  "System design",
  "Arquiteturas de projetos",
  "Backend",
])(
  "oferece progressão, recursos contextualizados e expansão segura: %s",
  (title) => {
    const track = createTrack(title, "auto");
    expect(track.modules.length).toBeGreaterThanOrEqual(4);
    expect(track.modules[0].title).toContain("Básico");
    expect(track.modules.some((m) => m.title.includes("Avançado"))).toBe(true);
    expect(roadmapFor(title)).toBeTruthy();
    expect(() =>
      dataSchema.parse({ ...emptyData(), tracks: [track] }),
    ).not.toThrow();
    expect(
      track.modules
        .flatMap((m) => m.topics)
        .every(
          (t) =>
            t.resources.length &&
            t.criteria.length > 20 &&
            t.exercise.length > 20,
        ),
    ).toBe(true);
    const old = {
      ...track,
      modules: [
        {
          ...track.modules[0],
          topics: [{ ...track.modules[0].topics[0], done: true }],
        },
      ],
    };
    const full = expandTrack(old);
    expect(full.modules.flatMap((m) => m.topics)).toContainEqual(
      old.modules[0].topics[0],
    );
    expect(trackProgress(full).total).toBe(trackProgress(track).total);
    expect(trackProgress(expandTrack(full)).total).toBe(
      trackProgress(full).total,
    );
  },
);

it.each([
  "Go",
  "Golang",
  "GoLink",
  "Golengue",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Rust",
  "C#",
  "PostgreSQL",
  "Git",
  "Linux",
  "K8s",
  "Segurança",
  "AWS",
])("entrega uma trilha pronta e completa para %s", (subject) => {
  const track = createTrack(subject, "auto");
  expect(track.modules.length).toBeGreaterThanOrEqual(3);
  expect(
    track.modules.reduce((n, m) => n + m.topics.length, 0),
  ).toBeGreaterThanOrEqual(6);
  expect(track.modules[0].title).toContain("Básico");
  expect(track.modules.some((m) => m.title.includes("Avançado"))).toBe(true);
  expect(roadmapFor(subject)).toBeTruthy();
  expect(() =>
    dataSchema.parse({ ...emptyData(), tracks: [track] }),
  ).not.toThrow();
  expect(
    track.modules
      .flatMap((m) => m.topics)
      .every(
        (t) =>
          t.exercise.length > 30 &&
          t.criteria.length > 30 &&
          t.resources.length &&
          t.resources.every(
            (r) => r.url.startsWith("https://") && r.why.length > 40,
          ),
      ),
  ).toBe(true);
});
it("Go tem prática de módulos, HTTP, testes, concorrência e entrega, com IDs novos a cada criação", () => {
  const first = createTrack("Go", "auto"),
    second = createTrack("Golang", "auto");
  const titles = first.modules
    .flatMap((m) => m.topics.map((t) => t.title))
    .join(" ");
  expect(titles).toMatch(/API HTTP/);
  expect(titles).toMatch(/Goroutines/);
  expect(titles).toMatch(/Testes/);
  expect(titles).toMatch(/Projeto final/);
  const ids = new Set(first.modules.flatMap((m) => m.topics.map((t) => t.id)));
  expect(
    second.modules.flatMap((m) => m.topics).some((t) => ids.has(t.id)),
  ).toBe(false);
});

import { lessonGuides } from "../src/lesson-guides";
it("Java inclui uma formação integrada e cada aula tem explicação, laboratório e evidência", () => {
  const track = createTrack("Java", "auto");
  expect(track.modules).toHaveLength(25);
  expect(trackProgress(track).total).toBe(71);
  for (const topic of track.modules.flatMap((m) => m.topics)) {
    const guide = lessonGuides[`Java::${topic.title}`];
    expect(guide).toBeTruthy();
    expect(guide.explanation.join(" ").length).toBeGreaterThan(180);
    expect(guide.practice.length).toBeGreaterThanOrEqual(3);
    expect(guide.pitfall.length).toBeGreaterThan(35);
    expect(guide.evidence).toBe(topic.criteria);
    expect(guide.project).toContain("Livraria");
  }
  const text = track.modules.map((m) => m.title).join(" ");
  for (const required of [
    "JDBC",
    "Hibernate",
    "Spring",
    "segurança",
    "Kafka",
    "automação",
  ])
    expect(text).toContain(required);
});
it.each(["Spring Boot", "Spring Cloud", "Go"])(
  "a especialização %s tem roteiro próprio em cada tópico",
  (course) => {
    const track = createTrack(course, "auto");
    expect(
      track.modules
        .flatMap((m) => m.topics)
        .every((topic) => Boolean(lessonGuides[`${course}::${topic.title}`])),
    ).toBe(true);
    expect(() =>
      dataSchema.parse({ ...emptyData(), tracks: [track] }),
    ).not.toThrow();
  },
);
it("o vídeo de apoio usa capítulos conferidos e não é rotulado como documentação oficial", () => {
  const java = createTrack("Java e Spring Boot", "auto");
  expect(java.modules).toHaveLength(25);
  expect(
    java.modules
      .flatMap((m) => m.topics)
      .some((t) =>
        t.resources.some((r) => r.url.includes("q6z_UCBM5Ek&t=150032s")),
      ),
  ).toBe(true);
  expect(
    officialSources("Java").every((r) => !r.url.includes("youtube.com")),
  ).toBe(true);
});
it("atualiza ordem curricular preservando IDs, critérios próprios, revisões e módulos extras", () => {
  const track = createTrack("Java", "auto");
  const legacy = {
    ...track,
    modules: [
      {
        id: "meu-modulo",
        title: "Notas pessoais",
        topics: [
          {
            ...track.modules[3].topics[0],
            done: true,
            criteria: "Meu critério personalizado",
            reviewDate: "2026-11-10",
            reviewed: true,
          },
          {
            ...track.modules[3].topics[1],
            id: "assunto-extra",
            title: "Meu laboratório extra",
            done: true,
          },
        ],
      },
    ],
  };
  const expanded = expandTrack(legacy);
  const topics = expanded.modules.flatMap((m) => m.topics);
  expect(
    topics.find((t) => t.id === legacy.modules[0].topics[0].id),
  ).toMatchObject({
    done: true,
    criteria: "Meu critério personalizado",
    reviewDate: "2026-11-10",
    reviewed: true,
  });
  expect(topics.find((t) => t.id === "assunto-extra")).toEqual(
    legacy.modules[0].topics[1],
  );
  expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
  expect(trackProgress(expanded).done).toBe(2);
  expect(trackProgress(expandTrack(expanded))).toEqual(trackProgress(expanded));
  expect(() =>
    dataSchema.parse({ ...emptyData(), tracks: [expanded] }),
  ).not.toThrow();
});
it("Go recebe referências da linguagem e não capítulos Java por coincidência de título", () =>
  expect(
    createTrack("Go", "auto")
      .modules.flatMap((m) => m.topics)
      .every((t) => t.resources.every((r) => !r.url.includes("youtube.com"))),
  ).toBe(true));

it("o exemplo de Java conserva linhas de código executáveis", () => {
  const example = lessonGuides["Java::JDK, JVM e primeiro programa"].example!;
  expect(example).toContain("\n  public static void main");
  expect(example).not.toContain("\\n");
});
