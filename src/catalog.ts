import { uid, type Track } from "./model";
import { springCloudModules } from "./study-content";
type TopicSeed = {
  title: string;
  criteria: string;
  exercise: string;
  resources: { title: string; url: string; why: string }[];
};
const r = (title: string, url: string, why: string) => ({ title, url, why });
const seeds: Record<
  string,
  {
    objective: string;
    prerequisites: string;
    modules: { title: string; topics: TopicSeed[] }[];
  }
> = {
  Java: {
    objective:
      "Construir e testar uma aplicação Java com domínio, persistência e API.",
    prerequisites: "Lógica de programação e uso básico do terminal.",
    modules: [
      {
        title: "Linguagem e orientação a objetos",
        topics: [
          {
            title: "Tipos, coleções e objetos",
            criteria:
              "Explicar encapsulamento, escolher uma coleção e tratar entradas inválidas.",
            exercise:
              "Criar um cadastro de tarefas no terminal, com validação e busca.",
            resources: [
              r(
                "Dev.java — Learn Java",
                "https://dev.java/learn/",
                "Comece pela linguagem e pelo modelo de objetos antes de usar frameworks.",
              ),
            ],
          },
          {
            title: "Exceções, streams e testes",
            criteria:
              "Cobrir casos de sucesso, entrada inválida e coleção vazia com testes.",
            exercise: "Adicionar filtros e testes ao cadastro de tarefas.",
            resources: [
              r(
                "JUnit — User Guide",
                "https://docs.junit.org/current/user-guide/",
                "Use ao escrever os primeiros testes; consulte assertions e testes parametrizados.",
              ),
            ],
          },
        ],
      },
      {
        title: "API e projeto prático",
        topics: [
          {
            title: "Spring Boot e persistência",
            criteria: "Implementar CRUD com validação, códigos HTTP e testes.",
            exercise:
              "Transformar seu cadastro em API REST e documentar como executar.",
            resources: [
              r(
                "Spring — Building a RESTful Web Service",
                "https://spring.io/guides/gs/rest-service/",
                "Depois de dominar os objetos, veja o fluxo de uma API mínima.",
              ),
              r(
                "Spring — Accessing Data with JPA",
                "https://spring.io/guides/gs/accessing-data-jpa/",
                "Use na etapa de persistência do projeto.",
              ),
            ],
          },
        ],
      },
    ],
  },
  Docker: {
    objective:
      "Empacotar uma aplicação e executar seus serviços de forma reproduzível.",
    prerequisites:
      "Terminal, processos e uma aplicação simples que já funciona.",
    modules: [
      {
        title: "Fundamentos",
        topics: [
          {
            title: "Imagens e containers",
            criteria:
              "Explicar a diferença entre imagem e container e executar, inspecionar e parar um container.",
            exercise:
              "Executar uma imagem de servidor web e publicar uma porta local.",
            resources: [
              r(
                "Docker — Get started",
                "https://docs.docker.com/get-started/",
                "Primeiro contato oficial: ciclo de vida e conceitos sem abstrações extras.",
              ),
            ],
          },
          {
            title: "Dockerfile e construção",
            criteria:
              "Construir uma imagem própria sem incluir credenciais e executar com usuário sem privilégios.",
            exercise:
              "Criar um Dockerfile para uma aplicação, incluindo .dockerignore.",
            resources: [
              r(
                "Docker — Building best practices",
                "https://docs.docker.com/build/building/best-practices/",
                "Consulte após o primeiro build para revisar camadas, base e segurança.",
              ),
            ],
          },
        ],
      },
      {
        title: "Aplicação completa",
        topics: [
          {
            title: "Compose, volumes e configuração",
            criteria:
              "Subir aplicação e banco, preservar dados e explicar as variáveis necessárias.",
            exercise:
              "Criar um projeto com aplicação e banco no Compose; testar reinício e persistência.",
            resources: [
              r(
                "Docker Compose — Getting started",
                "https://docs.docker.com/compose/gettingstarted/",
                "Use quando a imagem da aplicação estiver pronta para coordenar os serviços.",
              ),
            ],
          },
        ],
      },
    ],
  },
  "Spring Cloud": {
    objective:
      "Construir um pequeno sistema de serviços com descoberta, gateway e resiliência.",
    prerequisites:
      "Java, Spring Boot, REST, testes e configuração de aplicações.",
    modules: [
      {
        title: "Fundamentos e compatibilidade",
        topics: [
          {
            title: "Configurar os serviços",
            criteria:
              "Selecionar versões compatíveis de Spring Boot e Spring Cloud e iniciar dois serviços.",
            exercise:
              "Criar dois serviços com endpoints e testes de integração.",
            resources: [
              r(
                "Spring Cloud — Overview",
                "https://spring.io/projects/spring-cloud",
                "Comece pela tabela de compatibilidade e pelos projetos oficiais; não copie versões antigas de tutoriais.",
              ),
            ],
          },
        ],
      },
      {
        title: "Descoberta de serviços",
        topics: [
          {
            title: "Service Discovery com Eureka",
            criteria:
              "Registrar um serviço, consultar o registro e demonstrar o comportamento quando ele para.",
            exercise: "Criar um servidor Eureka e registrar os dois serviços.",
            resources: [
              r(
                "Spring — Service Registration and Discovery",
                "https://spring.io/guides/gs/service-registration-and-discovery/",
                "Use depois que os serviços funcionarem isoladamente para entender o registro.",
              ),
            ],
          },
        ],
      },
      {
        title: "Gateway e resiliência",
        topics: [
          {
            title: "Roteamento, falhas e projeto final",
            criteria:
              "Rotear uma requisição, configurar timeout e testar uma falha com resposta controlada.",
            exercise:
              "Adicionar gateway ao projeto e documentar um teste de indisponibilidade.",
            resources: [
              r(
                "Spring Cloud Gateway",
                "https://docs.spring.io/spring-cloud-gateway/reference/",
                "Use ao configurar rotas e filtros do gateway.",
              ),
              r(
                "Spring Cloud CircuitBreaker",
                "https://docs.spring.io/spring-cloud-circuitbreaker/reference/",
                "Consulte após o roteamento para configurar e testar o comportamento de falhas.",
              ),
            ],
          },
        ],
      },
    ],
  },
  "Arquitetura de software": {
    objective:
      "Justificar decisões de arquitetura em um projeto pequeno, com requisitos e tradeoffs.",
    prerequisites: "Experiência criando e testando uma aplicação simples.",
    modules: [
      {
        title: "Requisitos e limites",
        topics: [
          {
            title: "Qualidades e componentes",
            criteria:
              "Descrever requisitos de qualidade e desenhar os limites do sistema.",
            exercise:
              "Documentar contexto, containers e um cenário de falha da sua aplicação.",
            resources: [
              r(
                "C4 Model",
                "https://c4model.com/",
                "Comece pelos diagramas de contexto e containers para comunicar a estrutura sem excesso de detalhe.",
              ),
            ],
          },
        ],
      },
      {
        title: "Decisões e prática",
        topics: [
          {
            title: "Registrar e validar decisões",
            criteria:
              "Registrar duas decisões com alternativas e consequências; validar uma delas no projeto.",
            exercise:
              "Criar dois ADRs: persistência e comunicação entre componentes.",
            resources: [
              r(
                "Architecture Decision Records",
                "https://adr.github.io/",
                "Use após identificar os requisitos para explicar por que cada escolha foi feita.",
              ),
              r(
                "roadmap.sh — Software Architect",
                "https://roadmap.sh/software-architect",
                "Referência visual externa para identificar lacunas; não é uma lista obrigatória de tecnologias.",
              ),
            ],
          },
        ],
      },
    ],
  },
};
seeds["Spring Cloud"].modules = springCloudModules;
export const templateNames = Object.keys(seeds);
export function createTrack(title: string, template: string): Track {
  const subject = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const suggested = /spring[\s-]*cloud/.test(subject)
    ? "Spring Cloud"
    : /\bdocker\b/.test(subject)
      ? "Docker"
      : /\bjava\b/.test(subject)
        ? "Java"
        : /arquitetura|software architect/.test(subject)
          ? "Arquitetura de software"
          : "manual";
  const seed = seeds[template === "auto" ? suggested : template];
  return {
    id: uid(),
    title,
    objective: seed?.objective || `Organizar o aprendizado de ${title}.`,
    prerequisites:
      seed?.prerequisites || "Informe os conhecimentos necessários.",
    modules: (
      seed?.modules || [
        {
          title: "Primeiro módulo",
          topics: [
            {
              title: "Definir fundamentos",
              criteria:
                "Defina o que você conseguirá fazer ao concluir este tópico.",
              exercise: "Adicione um exercício pequeno e verificável.",
              resources: [],
            },
          ],
        },
      ]
    ).map((m) => ({
      ...m,
      id: uid(),
      topics: m.topics.map((t) => ({
        ...t,
        id: uid(),
        done: false,
        reviewDate: null,
        reviewed: false,
      })),
    })),
  };
}

export function expandTrack(track: Track): Track {
  const full = createTrack(track.title, "auto");
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  const existingTopics = new Set(
    track.modules.flatMap((m) => m.topics.map((t) => normalize(t.title))),
  );
  const modules = full.modules
    .map((m) => ({
      ...m,
      topics: m.topics.filter((t) => !existingTopics.has(normalize(t.title))),
    }))
    .filter((m) => m.topics.length);
  return { ...track, modules: [...track.modules, ...modules] };
}
