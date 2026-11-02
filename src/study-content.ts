const source = (title: string, url: string, why: string) => ({
  title,
  url,
  why,
});
const topic = (
  title: string,
  criteria: string,
  exercise: string,
  resources: ReturnType<typeof source>[],
) => ({ title, criteria, exercise, resources });
const docs = {
  overview: "https://spring.io/projects/spring-cloud",
  config: "https://docs.spring.io/spring-cloud-config/reference/",
  eureka:
    "https://docs.spring.io/spring-cloud-netflix/reference/spring-cloud-netflix.html",
  gateway: "https://docs.spring.io/spring-cloud-gateway/reference/",
  loadbalancer:
    "https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/loadbalancer.html",
  circuit: "https://docs.spring.io/spring-cloud-circuitbreaker/reference/",
  stream: "https://docs.spring.io/spring-cloud-stream/reference/",
  security: "https://docs.spring.io/spring-security/reference/",
  actuator: "https://docs.spring.io/spring-boot/reference/actuator/",
  testing: "https://docs.spring.io/spring-boot/reference/testing/",
  docker: "https://docs.docker.com/compose/",
};
export const springCloudModules = [
  {
    title: "Fundamentos e compatibilidade",
    topics: [
      topic(
        "Configurar os serviços",
        "Selecionar versões compatíveis e iniciar dois serviços de forma independente.",
        "Criar os serviços catálogo e pedidos com um endpoint e um teste cada.",
        [
          source(
            "Spring Cloud — Overview",
            docs.overview,
            "Comece pela compatibilidade entre Spring Boot e Spring Cloud antes de escolher as dependências.",
          ),
        ],
      ),
      topic(
        "Limites dos serviços e comunicação HTTP",
        "Explicar um limite de domínio, um contrato HTTP e a diferença entre falha de rede e erro de negócio.",
        "Desenhar o fluxo de criação de pedido e documentar respostas HTTP de sucesso e erro.",
        [
          source(
            "Spring — RESTful Web Service",
            "https://spring.io/guides/gs/rest-service/",
            "Use antes de distribuir a aplicação: primeiro estabeleça contratos simples e testáveis.",
          ),
        ],
      ),
      topic(
        "Configuração por ambiente",
        "Executar o mesmo serviço com dois perfis sem incluir senhas no repositório.",
        "Criar configurações locais e de teste; validar uma propriedade obrigatória na inicialização.",
        [
          source(
            "Spring Boot — Externalized Configuration",
            "https://docs.spring.io/spring-boot/reference/features/external-config.html",
            "Estude perfis e ordem de precedência antes de centralizar a configuração.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Descoberta de serviços",
    topics: [
      topic(
        "Service Discovery com Eureka",
        "Registrar os dois serviços, consultar o registro e verificar o que ocorre quando uma instância para.",
        "Criar o servidor Eureka, registrar catálogo e pedidos e observar o painel durante uma reinicialização.",
        [
          source(
            "Spring — Service Registration and Discovery",
            "https://spring.io/guides/gs/service-registration-and-discovery/",
            "Siga o guia para a primeira integração. Depois investigue registro, heartbeat e remoção de instâncias.",
          ),
          source(
            "Spring Cloud Netflix — referência",
            docs.eureka,
            "Consulte as propriedades quando configurar nomes, instâncias e ambientes.",
          ),
        ],
      ),
      topic(
        "Balanceamento entre instâncias",
        "Mostrar requisições chegando a duas instâncias sem fixar uma URL no código.",
        "Subir duas instâncias do catálogo e adicionar um identificador de instância na resposta.",
        [
          source(
            "Spring Cloud LoadBalancer",
            docs.loadbalancer,
            "Use após o registro funcionar; compare resolução do serviço e seleção da instância.",
          ),
        ],
      ),
      topic(
        "Falhas de descoberta e alternativas",
        "Explicar quando a descoberta da plataforma já é suficiente e quando Eureka acrescenta valor.",
        "Documentar o comportamento com registro indisponível e comparar com descoberta via DNS.",
        [
          source(
            "Spring Cloud Commons",
            "https://docs.spring.io/spring-cloud-commons/reference/",
            "Revisão de conceitos para separar a interface de descoberta de sua implementação.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Configuração centralizada",
    topics: [
      topic(
        "Config Server e cliente",
        "Entregar uma propriedade versionada pelo servidor e consumi-la no cliente.",
        "Criar um repositório de configuração sem segredos e conectar um dos serviços ao Config Server.",
        [
          source(
            "Spring Cloud Config",
            docs.config,
            "Depois dos perfis locais, use esta referência para organizar a configuração compartilhada.",
          ),
        ],
      ),
      topic(
        "Disponibilidade e proteção da configuração",
        "Demonstrar comportamento controlado quando a configuração remota não responde.",
        "Testar inicialização sem Config Server e documentar a escolha entre falhar e usar configuração local.",
        [
          source(
            "Spring Cloud Config — referência",
            docs.config,
            "Consulte disponibilidade, segurança e configuração do cliente ao testar o cenário de falha.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Gateway e contratos externos",
    topics: [
      topic(
        "Rotas e filtros do Gateway",
        "Encaminhar uma chamada para cada serviço e preservar os códigos de resposta.",
        "Criar rotas /catalogo e /pedidos e testar caminhos válidos e inexistentes.",
        [
          source(
            "Spring Cloud Gateway",
            docs.gateway,
            "Comece por rotas, predicados e filtros. Escolha explicitamente a variante compatível com seu projeto.",
          ),
        ],
      ),
      topic(
        "Validação, CORS e limites da borda",
        "Distinguir autenticação, autorização e CORS; rejeitar entrada inválida sem vazar detalhes.",
        "Definir o contrato de erro e testar uma origem não permitida e um identificador inválido.",
        [
          source(
            "Spring Security — referência",
            docs.security,
            "Use para segurança real; um filtro de gateway sozinho não substitui autorização nos serviços.",
          ),
        ],
      ),
      topic(
        "Timeouts e rastreabilidade das chamadas",
        "Impedir espera indefinida e identificar uma requisição ao atravessar os serviços.",
        "Atrasar uma resposta do catálogo e observar o timeout do chamador com um identificador de correlação.",
        [
          source(
            "Spring Cloud Gateway — configuração",
            docs.gateway,
            "Consulte timeouts e observabilidade quando as rotas básicas estiverem funcionando.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Resiliência e testes de falha",
    topics: [
      topic(
        "Circuit breaker e fallback",
        "Abrir e recuperar o circuito em teste e explicar o que um fallback pode ou não esconder.",
        "Simular indisponibilidade do catálogo e retornar uma resposta controlada ao cliente.",
        [
          source(
            "Spring Cloud CircuitBreaker",
            docs.circuit,
            "Introduza resiliência depois de definir timeouts; valide o comportamento com falhas reproduzíveis.",
          ),
        ],
      ),
      topic(
        "Retries e idempotência",
        "Explicar por que repetir uma escrita pode duplicar um pedido e estabelecer uma estratégia segura.",
        "Simular duas solicitações com a mesma chave e garantir um único resultado de negócio.",
        [
          source(
            "Spring Framework — REST clients",
            "https://docs.spring.io/spring-framework/reference/integration/rest-clients.html",
            "Use para revisar os clientes e o tratamento de erros antes de acrescentar repetição automática.",
          ),
        ],
      ),
      topic(
        "Testes de contrato",
        "Detectar uma alteração incompatível entre produtor e consumidor sem subir o sistema inteiro.",
        "Definir um contrato do catálogo e provocar uma quebra deliberada em um campo.",
        [
          source(
            "Spring Cloud Contract",
            "https://docs.spring.io/spring-cloud-contract/reference/",
            "Use depois de ter um contrato HTTP estável; teste a fronteira, não apenas o controller.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Mensageria e consistência",
    topics: [
      topic(
        "Eventos com Spring Cloud Stream",
        "Publicar e consumir um evento e explicar o papel do broker e do binder.",
        "Emitir pedido criado e registrar o processamento em outro serviço.",
        [
          source(
            "Spring Cloud Stream",
            docs.stream,
            "Estude após a comunicação síncrona para comparar acoplamento, latência e tratamento de falhas.",
          ),
        ],
      ),
      topic(
        "Duplicidade e mensagens com erro",
        "Processar uma mensagem repetida sem duplicar o efeito e inspecionar uma mensagem inválida.",
        "Reenviar o mesmo evento e testar um cenário de dead-letter ou tratamento de erro do binder escolhido.",
        [
          source(
            "Spring Cloud Stream — referência",
            docs.stream,
            "Consulte o binder realmente usado; os detalhes de erro e redelivery variam entre brokers.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Observabilidade e segurança",
    topics: [
      topic(
        "Health checks, métricas e traces",
        "Diferenciar logs, métricas e traces e limitar a exposição dos endpoints administrativos.",
        "Habilitar health e uma métrica de negócio; correlacionar uma chamada entre os serviços.",
        [
          source(
            "Spring Boot Actuator",
            docs.actuator,
            "Use para observar o sistema antes de tentar otimizar ou escalar os serviços.",
          ),
        ],
      ),
      topic(
        "Autorização com tokens",
        "Validar assinatura, expiração e permissão; não aceitar apenas a presença de um token.",
        "Proteger um endpoint e testar token ausente, expirado e sem a permissão necessária.",
        [
          source(
            "Spring Security — OAuth2 Resource Server",
            "https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html",
            "Estude antes de disponibilizar o projeto fora do ambiente local; mantenha validação no serviço.",
          ),
        ],
      ),
    ],
  },
  {
    title: "Projeto integrado e revisão",
    topics: [
      topic(
        "Executar o sistema com Docker Compose",
        "Subir o sistema com comandos documentados e preservar somente os dados necessários.",
        "Criar o Compose para serviços e dependências; verificar reinício e ordem de disponibilidade.",
        [
          source(
            "Docker Compose",
            docs.docker,
            "Use no final, quando cada serviço funcionar isoladamente; empacotar não corrige contratos quebrados.",
          ),
        ],
      ),
      topic(
        "Teste ponta a ponta e documentação das decisões",
        "Reproduzir um pedido do gateway até o evento e explicar três decisões com alternativas.",
        "Escrever um teste de fluxo, um teste de indisponibilidade e um README que outra pessoa consiga executar.",
        [
          source(
            "Spring Boot — Testing",
            docs.testing,
            "Consolide testes de unidade e integração em uma validação do fluxo essencial.",
          ),
          source(
            "Architecture Decision Records",
            "https://adr.github.io/",
            "Registre razões e consequências das escolhas, sem transformar a documentação em um catálogo de tecnologias.",
          ),
        ],
      ),
    ],
  },
];
export const roadmapReferences: Record<string, { title: string; url: string }> =
  {
    "Spring Cloud": {
      title: "Backend — referência de fundamentos",
      url: "https://roadmap.sh/backend",
    },
    "System Design": {
      title: "System Design — referência visual",
      url: "https://roadmap.sh/system-design",
    },
    Backend: {
      title: "Backend — referência visual",
      url: "https://roadmap.sh/backend",
    },
    Java: { title: "Java — referência visual", url: "https://roadmap.sh/java" },
    Docker: {
      title: "Docker — referência visual",
      url: "https://roadmap.sh/docker",
    },
    "Arquitetura de software": {
      title: "Software Architect — referência visual",
      url: "https://roadmap.sh/software-architect",
    },
  };
