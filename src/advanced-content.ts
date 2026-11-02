import type { Track } from "./model.js";
type Seed = {
  objective: string;
  prerequisites: string;
  modules: {
    title: string;
    topics: Omit<
      Track["modules"][number]["topics"][number],
      "id" | "done" | "reviewDate" | "reviewed"
    >[];
  }[];
};
const t = (
  title: string,
  criteria: string,
  exercise: string,
  label: string,
  url: string,
) => ({
  title,
  criteria,
  exercise,
  resources: [
    {
      title: label,
      url,
      why: `Estude nesta etapa para ${criteria.charAt(0).toLowerCase() + criteria.slice(1)} Use a documentação para resolver o exercício e confira a versão utilizada.`,
    },
  ],
});
export const advancedTracks: Record<string, Seed> = {
  Java: {
    objective:
      "Evoluir da linguagem e orientação a objetos a uma API Java testada, segura e observável.",
    prerequisites:
      "Comece por lógica e terminal. Os módulos seguem do básico ao avançado.",
    modules: [
      {
        title: "Básico · linguagem e objetos",
        topics: [
          t(
            "Tipos, coleções e objetos",
            "Explicar tipos, encapsulamento e escolher uma coleção.",
            "Criar um cadastro de tarefas no terminal com validação e busca.",
            "Dev.java — aprender Java",
            "https://dev.java/learn/",
          ),
          t(
            "Exceções, streams e testes",
            "Tratar entrada inválida e cobrir a coleção vazia com testes.",
            "Adicionar filtros e testes ao cadastro de tarefas.",
            "JUnit — User Guide",
            "https://docs.junit.org/current/user-guide/",
          ),
          t(
            "Generics, records e imutabilidade",
            "Evitar casts desnecessários e justificar quais objetos podem ser imutáveis.",
            "Criar um record para os dados de uma tarefa e uma coleção tipada.",
            "Dev.java — linguagem",
            "https://dev.java/learn/",
          ),
        ],
      },
      {
        title: "Básico · algoritmos e estruturas",
        topics: [
          t(
            "Listas, conjuntos, mapas e complexidade",
            "Comparar busca linear e indexação, explicando custo e duplicidade.",
            "Implementar busca e contagem de tarefas por status com listas e mapas.",
            "Dev.java — Collections",
            "https://dev.java/learn/api/collections-framework/",
          ),
          t(
            "Arquivos e entrada e saída",
            "Ler dados com fechamento correto dos recursos e tratar arquivo inválido.",
            "Salvar e recuperar um cadastro em um arquivo local de teste.",
            "Dev.java — I/O",
            "https://dev.java/learn/java-io/",
          ),
        ],
      },
      {
        title: "Intermediário · testes e build",
        topics: [
          t(
            "Testes de unidade e parametrizados",
            "Separar regra de negócio de infraestrutura e cobrir limites relevantes.",
            "Testar uma calculadora de orçamento com valores válidos e inválidos.",
            "JUnit — referência",
            "https://docs.junit.org/current/user-guide/",
          ),
          t(
            "Maven e dependências",
            "Executar build e testes fora da IDE sem depender de arquivos pessoais.",
            "Criar um projeto Maven e documentar o comando de teste.",
            "Maven — Getting Started",
            "https://maven.apache.org/guides/getting-started/",
          ),
        ],
      },
      {
        title: "Intermediário · dados e API",
        topics: [
          t(
            "SQL, índices e transações",
            "Explicar uma transação e observar um plano de execução.",
            "Criar tabelas de tarefas e etiquetas e comparar consultas com e sem índice.",
            "PostgreSQL — documentação",
            "https://www.postgresql.org/docs/current/",
          ),
          t(
            "Spring Boot e persistência",
            "Implementar CRUD com validação, códigos HTTP e testes.",
            "Transformar o cadastro em API REST com persistência e contrato de erros.",
            "Spring — RESTful Web Service",
            "https://spring.io/guides/gs/rest-service/",
          ),
          t(
            "JPA e consultas eficientes",
            "Identificar N+1 e escolher o carregamento adequado.",
            "Medir as consultas da listagem e corrigir uma busca que faz chamadas repetidas.",
            "Hibernate — documentação",
            "https://hibernate.org/orm/documentation/",
          ),
        ],
      },
      {
        title: "Avançado · segurança e concorrência",
        topics: [
          t(
            "Autenticação e autorização",
            "Diferenciar identidade e permissão e rejeitar acesso sem privilégio.",
            "Proteger uma rota e testar token ausente, expirado e sem permissão.",
            "Spring Security — referência",
            "https://docs.spring.io/spring-security/reference/",
          ),
          t(
            "Threads, virtual threads e sincronização",
            "Explicar uma condição de corrida e avaliar uma solução com teste.",
            "Reproduzir um contador concorrente incorreto e corrigir o acesso ao estado.",
            "Dev.java — virtual threads",
            "https://dev.java/learn/new-features/virtual-threads/",
          ),
          t(
            "JVM, memória e profiling",
            "Observar uso de memória antes de alterar o código por desempenho.",
            "Analisar uma carga pequena e registrar a hipótese e a medição.",
            "JDK Mission Control",
            "https://openjdk.org/projects/jmc/",
          ),
        ],
      },
      {
        title: "Avançado · projeto e entrega",
        topics: [
          t(
            "Observabilidade e integração",
            "Investigar uma falha com logs e métricas sem expor dados sensíveis.",
            "Adicionar health checks e testes de integração à API.",
            "Spring Boot Actuator",
            "https://docs.spring.io/spring-boot/reference/actuator/",
          ),
          t(
            "Projeto final Java",
            "Executar um fluxo completo com testes e justificar decisões de estrutura.",
            "Entregar API de tarefas com banco, autenticação, testes e README reproduzível.",
            "Spring Boot — Testing",
            "https://docs.spring.io/spring-boot/reference/testing/",
          ),
        ],
      },
    ],
  },
  Docker: {
    objective:
      "Aprender containers do básico à entrega segura e reproduzível de uma aplicação.",
    prerequisites:
      "Uso básico do terminal e uma aplicação que já execute localmente.",
    modules: [
      {
        title: "Básico · containers e imagens",
        topics: [
          t(
            "Imagens e containers",
            "Explicar o ciclo de vida e a diferença entre imagem e container.",
            "Executar, inspecionar e parar um servidor web local.",
            "Docker — Get started",
            "https://docs.docker.com/get-started/",
          ),
          t(
            "Dockerfile e construção",
            "Construir uma imagem própria sem incluir segredos.",
            "Criar Dockerfile e .dockerignore para uma aplicação pequena.",
            "Docker — Build",
            "https://docs.docker.com/build/",
          ),
        ],
      },
      {
        title: "Básico · persistência e rede",
        topics: [
          t(
            "Volumes e dados",
            "Reiniciar um serviço sem perder os dados esperados.",
            "Criar um volume de teste e verificar a persistência após recriar o container.",
            "Docker — Storage",
            "https://docs.docker.com/engine/storage/",
          ),
          t(
            "Redes, portas e DNS",
            "Distinguir porta publicada de comunicação interna.",
            "Conectar dois serviços pela rede interna sem expor o banco ao host.",
            "Docker — Networking",
            "https://docs.docker.com/engine/network/",
          ),
        ],
      },
      {
        title: "Intermediário · Compose",
        topics: [
          t(
            "Compose e configuração",
            "Subir aplicação e banco com configuração reproduzível.",
            "Criar Compose com variáveis documentadas e health check.",
            "Docker Compose",
            "https://docs.docker.com/compose/",
          ),
          t(
            "Debug e logs",
            "Investigar uma falha de inicialização sem reconstruir tudo ao acaso.",
            "Provocar uma variável inválida e localizar a causa nos logs.",
            "Docker — Logs",
            "https://docs.docker.com/engine/logging/",
          ),
        ],
      },
      {
        title: "Avançado · imagens seguras",
        topics: [
          t(
            "Multi-stage builds e cache",
            "Comparar tamanho e tempo de build antes e depois da otimização.",
            "Separar build e runtime e registrar as medidas obtidas.",
            "Docker — Multi-stage builds",
            "https://docs.docker.com/build/building/multi-stage/",
          ),
          t(
            "Usuário, secrets e supply chain",
            "Executar com privilégios mínimos e manter credenciais fora das camadas.",
            "Usar usuário não root e revisar o contexto enviado ao build.",
            "Docker — Building best practices",
            "https://docs.docker.com/build/building/best-practices/",
          ),
        ],
      },
      {
        title: "Avançado · entrega e operação",
        topics: [
          t(
            "CI, tags e rollback",
            "Publicar uma versão identificável e voltar à versão anterior.",
            "Criar pipeline que testa, constrói e identifica a imagem por commit.",
            "Docker — CI",
            "https://docs.docker.com/build/ci/",
          ),
          t(
            "Projeto final com containers",
            "Outra pessoa consegue iniciar o projeto e recuperar os dados de teste.",
            "Entregar aplicação e banco com documentação, health checks e procedimento de backup.",
            "Docker — Production with Compose",
            "https://docs.docker.com/compose/how-tos/production/",
          ),
        ],
      },
    ],
  },
  "System Design": {
    objective:
      "Projetar sistemas do básico ao avançado, justificando capacidade, dados, consistência, falhas e operação.",
    prerequisites:
      "HTTP, uma linguagem de backend e SQL básico. Revise esses fundamentos antes dos módulos avançados.",
    modules: [
      {
        title: "Básico · requisitos e comunicação",
        topics: [
          t(
            "Requisitos e atributos de qualidade",
            "Separar requisitos funcionais, disponibilidade, latência e consistência.",
            "Definir os requisitos de um encurtador de URLs, com números explicitamente estimados.",
            "Azure Architecture Center",
            "https://learn.microsoft.com/en-us/azure/architecture/",
          ),
          t(
            "HTTP, DNS e latência",
            "Explicar o caminho de uma requisição e identificar onde medir o tempo.",
            "Desenhar navegador, DNS, proxy, aplicação e banco de uma API simples.",
            "MDN — HTTP",
            "https://developer.mozilla.org/en-US/docs/Web/HTTP",
          ),
        ],
      },
      {
        title: "Básico · capacidade e limites",
        topics: [
          t(
            "Estimativas de capacidade",
            "Declarar hipóteses e estimar requisições, armazenamento e tráfego.",
            "Calcular uma faixa de carga para o encurtador e explicar quais medidas faltam.",
            "AWS Builders Library",
            "https://aws.amazon.com/builders-library/",
          ),
          t(
            "Contratos de API e paginação",
            "Projetar um contrato previsível e limitar o custo de uma listagem.",
            "Descrever endpoints de criação, leitura e paginação com casos de erro.",
            "Microsoft — API design",
            "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design",
          ),
        ],
      },
      {
        title: "Intermediário · armazenamento",
        topics: [
          t(
            "Modelagem, índices e transações",
            "Escolher chaves e demonstrar o impacto de um índice.",
            "Modelar URLs e acessos, comparar o plano de duas consultas.",
            "PostgreSQL — documentação",
            "https://www.postgresql.org/docs/current/",
          ),
          t(
            "Replicação, particionamento e consistência",
            "Explicar uma leitura desatualizada e as consequências da partição.",
            "Comparar replicação e particionamento para o cenário estimado, sem escalar antes de medir.",
            "PostgreSQL — High Availability",
            "https://www.postgresql.org/docs/current/high-availability.html",
          ),
        ],
      },
      {
        title: "Intermediário · cache e concorrência",
        topics: [
          t(
            "Caching e invalidação",
            "Definir TTL e explicar quando o cache serve uma resposta incorreta.",
            "Adicionar cache às URLs e testar atualização e expiração.",
            "Redis — documentação",
            "https://redis.io/docs/latest/",
          ),
          t(
            "Idempotência e duplicidade",
            "Impedir efeitos duplicados após uma repetição de requisição.",
            "Simular duas criações com a mesma chave e garantir um único resultado.",
            "AWS — Making retries safe",
            "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
          ),
        ],
      },
      {
        title: "Avançado · processamento assíncrono",
        topics: [
          t(
            "Filas, eventos e backpressure",
            "Explicar entrega repetida, ordem e comportamento de um consumidor lento.",
            "Criar um fluxo de eventos de acesso com um consumidor idempotente.",
            "Apache Kafka — documentação",
            "https://kafka.apache.org/documentation/",
          ),
          t(
            "Outbox e consistência entre serviços",
            "Demonstrar a falha entre gravar no banco e publicar um evento.",
            "Desenhar uma outbox transacional e testar recuperação após interrupção.",
            "Microsoft — Transactional Outbox",
            "https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-outbox-cosmos",
          ),
        ],
      },
      {
        title: "Avançado · confiabilidade",
        topics: [
          t(
            "Timeouts, retries e circuit breaker",
            "Definir limites de espera e evitar amplificar uma falha.",
            "Simular indisponibilidade e comparar retry ilimitado com uma política limitada.",
            "AWS — Timeouts, retries and backoff",
            "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
          ),
          t(
            "SLO, observabilidade e incidentes",
            "Escolher sinais úteis e explicar o que um alerta deve exigir.",
            "Definir um SLO do encurtador e documentar um incidente simulado.",
            "Google SRE Book",
            "https://sre.google/sre-book/table-of-contents/",
          ),
        ],
      },
      {
        title: "Avançado · segurança e evolução",
        topics: [
          t(
            "Autorização e proteção de dados",
            "Definir quem acessa cada dado e evitar exposição por identificadores.",
            "Desenhar ameaças e testar o acesso indevido a um recurso de outro usuário.",
            "OWASP — API Security",
            "https://owasp.org/www-project-api-security/",
          ),
          t(
            "Migrações e compatibilidade",
            "Evoluir um contrato ou esquema sem quebrar o consumidor anterior.",
            "Planejar uma mudança com versão anterior, nova versão e rollback.",
            "Martin Fowler — Evolutionary Database Design",
            "https://martinfowler.com/articles/evodb.html",
          ),
        ],
      },
      {
        title: "Projeto final · justificar escolhas",
        topics: [
          t(
            "Projetar e revisar um sistema completo",
            "Comunicar requisitos, hipóteses, gargalos e alternativas com clareza.",
            "Entregar o desenho do encurtador, três ADRs e um teste de carga pequeno e reproduzível.",
            "C4 Model",
            "https://c4model.com/",
          ),
          t(
            "Comparar cenários de projeto",
            "Adaptar decisões ao problema em vez de repetir uma arquitetura pronta.",
            "Comparar encurtador, sistema de notificações e feed de publicações.",
            "AWS Architecture Center",
            "https://aws.amazon.com/architecture/",
          ),
        ],
      },
    ],
  },
  "Arquitetura de software": {
    objective:
      "Organizar projetos do básico ao avançado, com limites claros, testes e decisões justificadas.",
    prerequisites:
      "Saber implementar e testar uma aplicação pequena. Comece pelos módulos básicos.",
    modules: [
      {
        title: "Básico · estrutura e responsabilidades",
        topics: [
          t(
            "Qualidades e componentes",
            "Descrever requisitos de qualidade e os limites dos componentes.",
            "Desenhar contexto e containers de uma aplicação que você já conhece.",
            "C4 Model",
            "https://c4model.com/",
          ),
          t(
            "Coesão, acoplamento e dependências",
            "Identificar uma responsabilidade misturada e explicar o custo da separação.",
            "Separar regra de negócio de acesso a dados em um caso de uso pequeno.",
            "Martin Fowler — arquitetura",
            "https://martinfowler.com/architecture/",
          ),
        ],
      },
      {
        title: "Básico · camadas e testes",
        topics: [
          t(
            "Arquitetura em camadas",
            "Distinguir interface, aplicação, domínio e infraestrutura.",
            "Organizar um cadastro com dependências explícitas e testes de regras.",
            "Microsoft — Common architectures",
            "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures",
          ),
          t(
            "Testabilidade e contratos",
            "Testar uma regra sem subir banco e testar a integração real separadamente.",
            "Criar teste de unidade de um caso de uso e teste de integração do repositório.",
            "Spring Boot — Testing",
            "https://docs.spring.io/spring-boot/reference/testing/",
          ),
        ],
      },
      {
        title: "Intermediário · estilos e fronteiras",
        topics: [
          t(
            "Arquitetura hexagonal e portas",
            "Substituir uma dependência externa sem alterar a regra de negócio.",
            "Criar uma porta de persistência e adaptar banco e implementação em memória.",
            "Alistair Cockburn — Hexagonal Architecture",
            "https://alistair.cockburn.us/hexagonal-architecture/",
          ),
          t(
            "Monólito modular",
            "Definir limites internos antes de distribuir a aplicação.",
            "Separar pedidos e catálogo em módulos e testar dependências permitidas.",
            "Spring Modulith",
            "https://spring.io/projects/spring-modulith",
          ),
        ],
      },
      {
        title: "Intermediário · domínio e decisões",
        topics: [
          t(
            "DDD, entidades e value objects",
            "Distinguir identidade, valor e invariantes em um caso concreto.",
            "Modelar um pedido com regras de domínio e testar suas invariantes.",
            "Microsoft — Domain model",
            "https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model",
          ),
          t(
            "Registrar e validar decisões",
            "Registrar alternativas, contexto e consequências de uma escolha.",
            "Escrever ADRs sobre persistência e comunicação e validar uma decisão no código.",
            "Architecture Decision Records",
            "https://adr.github.io/",
          ),
        ],
      },
      {
        title: "Avançado · distribuição e dados",
        topics: [
          t(
            "Microserviços e custos operacionais",
            "Justificar uma fronteira distribuída considerando falhas, entrega e operação.",
            "Comparar o monólito modular com a separação de um único serviço.",
            "Microsoft — Microservices architecture",
            "https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices",
          ),
          t(
            "CQRS, eventos e consistência",
            "Explicar quando separar leituras e escritas é útil e o custo de sincronização.",
            "Projetar uma leitura especializada e um fluxo de atualização com idempotência.",
            "Microsoft — CQRS pattern",
            "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs",
          ),
        ],
      },
      {
        title: "Avançado · governança e evolução",
        topics: [
          t(
            "Testes de arquitetura e dependências",
            "Detectar uma violação de camadas automaticamente.",
            "Adicionar uma regra ArchUnit e provocar uma dependência proibida.",
            "ArchUnit — User Guide",
            "https://www.archunit.org/userguide/html/000_Index.html",
          ),
          t(
            "Segurança e observabilidade por desenho",
            "Definir fronteiras de confiança e sinais de operação de cada componente.",
            "Desenhar ameaças, logs seguros e um cenário de falha controlada.",
            "OWASP — Threat Modeling",
            "https://owasp.org/www-community/Threat_Modeling",
          ),
        ],
      },
      {
        title: "Projeto final · evolução de uma aplicação",
        topics: [
          t(
            "Refatorar com validação e rollback",
            "Melhorar um limite sem alterar o comportamento observado pelos usuários.",
            "Refatorar uma fronteira, executar os testes e documentar como reverter.",
            "Martin Fowler — Refactoring",
            "https://refactoring.com/",
          ),
          t(
            "Apresentar uma arquitetura com tradeoffs",
            "Defender escolhas com requisitos e evidências em vez de nomes de padrões.",
            "Entregar diagramas, ADRs, testes de arquitetura e um roteiro de execução.",
            "C4 Model — diagramas",
            "https://c4model.com/",
          ),
        ],
      },
    ],
  },
  Backend: {
    objective:
      "Construir fundamentos de backend e evoluir para entrega, segurança e sistemas distribuídos.",
    prerequisites:
      "Lógica de programação. Use Java se ainda não tiver escolhido uma linguagem.",
    modules: [
      {
        title: "Básico · web e linguagem",
        topics: [
          t(
            "HTTP e ciclo de uma requisição",
            "Explicar métodos, status, headers e formato da resposta.",
            "Inspecionar requisições de uma API de teste e descrever sucesso e erro.",
            "MDN — HTTP",
            "https://developer.mozilla.org/en-US/docs/Web/HTTP",
          ),
          t(
            "Linguagem e estruturas de dados",
            "Implementar regras simples e tratar entradas inválidas.",
            "Criar um cadastro no terminal com busca e testes.",
            "Dev.java — Learn",
            "https://dev.java/learn/",
          ),
        ],
      },
      {
        title: "Intermediário · APIs e dados",
        topics: [
          t(
            "REST, validação e paginação",
            "Construir um contrato consistente e limitar o tamanho das consultas.",
            "Criar uma API de tarefas com paginação e contrato de erros.",
            "Microsoft — API design",
            "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design",
          ),
          t(
            "SQL, transações e migrações",
            "Persistir dados e explicar uma transação e uma alteração de esquema.",
            "Modelar tarefas e usuários e testar uma migração em uma base de teste.",
            "PostgreSQL — documentação",
            "https://www.postgresql.org/docs/current/",
          ),
        ],
      },
      {
        title: "Intermediário · qualidade e segurança",
        topics: [
          t(
            "Autorização e testes de integração",
            "Impedir acesso a dados de outro usuário e testar a fronteira.",
            "Criar testes de autenticação, autorização e validação da API.",
            "OWASP — API Security",
            "https://owasp.org/www-project-api-security/",
          ),
          t(
            "Containers e CI",
            "Reproduzir o build e testar automaticamente cada alteração.",
            "Criar Dockerfile e pipeline de build e testes.",
            "Docker — Get started",
            "https://docs.docker.com/get-started/",
          ),
        ],
      },
      {
        title: "Avançado · performance e operação",
        topics: [
          t(
            "Cache, mensageria e idempotência",
            "Escolher uma otimização com base em um gargalo medido.",
            "Medir uma rota lenta, aplicar uma mudança e comparar os resultados.",
            "AWS Builders Library",
            "https://aws.amazon.com/builders-library/",
          ),
          t(
            "Observabilidade e projeto final",
            "Diagnosticar falhas com sinais e comunicar decisões de arquitetura.",
            "Entregar API com banco, testes, métricas e um teste de indisponibilidade.",
            "Google SRE — fundamentos",
            "https://sre.google/sre-book/table-of-contents/",
          ),
        ],
      },
    ],
  },
};
