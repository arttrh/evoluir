import type { Seed } from "./advanced-content.js";
export const readyTracks: Record<string, Seed> = {
  Python: {
    objective:
      "Construir uma aplicação Python testada, com persistência e uma API HTTP.",
    prerequisites: "Nenhum conhecimento de Python; lógica e terminal ajudam.",
    modules: [
      {
        title: "Básico · linguagem",
        topics: [
          {
            title: "Ambiente virtual, tipos e fluxo",
            criteria:
              "Criar um ambiente isolado e explicar tipos e estruturas de controle.",
            exercise:
              "Criar uma CLI de despesas com validação e totais por categoria.",
            resources: [
              {
                title: "Python — linguagem",
                url: "https://docs.python.org/3/tutorial/",
                why: "Use nesta etapa para criar um ambiente isolado e explicar tipos e estruturas de controle. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Funções, listas e dicionários",
            criteria:
              "Separar a lógica em funções e escolher coleções adequadas.",
            exercise: "Adicionar filtros e agrupar as despesas por mês.",
            resources: [
              {
                title: "Python — linguagem",
                url: "https://docs.python.org/3/tutorial/",
                why: "Use nesta etapa para separar a lógica em funções e escolher coleções adequadas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · modelagem e arquivos",
        topics: [
          {
            title: "Módulos, classes e composição",
            criteria:
              "Organizar imports e responsabilidades sem estado global.",
            exercise: "Separar CLI, regras e armazenamento em módulos.",
            resources: [
              {
                title: "Python — modelagem e arquivos",
                url: "https://docs.python.org/3/tutorial/classes.html",
                why: "Use nesta etapa para organizar imports e responsabilidades sem estado global. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Arquivos, JSON e exceções",
            criteria:
              "Ler e salvar dados e tratar um arquivo inválido sem perder o anterior.",
            exercise:
              "Persistir despesas em JSON e demonstrar recuperação de erro.",
            resources: [
              {
                title: "Python — modelagem e arquivos",
                url: "https://docs.python.org/3/tutorial/inputoutput.html",
                why: "Use nesta etapa para ler e salvar dados e tratar um arquivo inválido sem perder o anterior. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · testes e tipos",
        topics: [
          {
            title: "Testes parametrizados e fixtures",
            criteria:
              "Cobrir regras e casos extremos com testes reproduzíveis.",
            exercise:
              "Testar filtros, valores negativos e coleção vazia com pytest.",
            resources: [
              {
                title: "Python — testes e tipos",
                url: "https://docs.pytest.org/en/stable/",
                why: "Use nesta etapa para cobrir regras e casos extremos com testes reproduzíveis. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Type hints e desenho de interfaces",
            criteria:
              "Descrever entradas e saídas e reduzir acoplamento da persistência.",
            exercise: "Adicionar tipos e um contrato para o repositório.",
            resources: [
              {
                title: "Python — testes e tipos",
                url: "https://docs.python.org/3/library/typing.html",
                why: "Use nesta etapa para descrever entradas e saídas e reduzir acoplamento da persistência. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · dados e API",
        topics: [
          {
            title: "API HTTP e validação",
            criteria:
              "Expor endpoints com validação e respostas HTTP verificáveis.",
            exercise:
              "Criar uma API de despesas com FastAPI e testes de requisição.",
            resources: [
              {
                title: "Python — dados e API",
                url: "https://fastapi.tiangolo.com/tutorial/",
                why: "Use nesta etapa para expor endpoints com validação e respostas HTTP verificáveis. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "SQL e transações",
            criteria: "Executar consultas parametrizadas e validar rollback.",
            exercise:
              "Persistir despesas em SQLite e testar uma falha no meio da transação.",
            resources: [
              {
                title: "Python — dados e API",
                url: "https://docs.python.org/3/library/sqlite3.html",
                why: "Use nesta etapa para executar consultas parametrizadas e validar rollback. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · concorrência e entrega",
        topics: [
          {
            title: "Asyncio, timeout e tarefas",
            criteria:
              "Explicar quando usar I/O assíncrono e cancelar trabalho pendente.",
            exercise:
              "Consultar serviços simulados com limite de concorrência e timeout.",
            resources: [
              {
                title: "Python — concorrência e entrega",
                url: "https://docs.python.org/3/library/asyncio.html",
                why: "Use nesta etapa para explicar quando usar I/O assíncrono e cancelar trabalho pendente. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final Python",
            criteria:
              "Executar a aplicação de ponta a ponta em um ambiente novo.",
            exercise:
              "Entregar API, CLI, testes e documentação com dependências declaradas.",
            resources: [
              {
                title: "Python — concorrência e entrega",
                url: "https://packaging.python.org/en/latest/tutorials/packaging-projects/",
                why: "Use nesta etapa para executar a aplicação de ponta a ponta em um ambiente novo. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  JavaScript: {
    objective:
      "Dominar JavaScript da linguagem ao navegador e entregar uma aplicação acessível e testada.",
    prerequisites:
      "HTML e CSS básicos; não é necessário conhecer um framework.",
    modules: [
      {
        title: "Básico · linguagem",
        topics: [
          {
            title: "Tipos, funções, escopo e fluxo",
            criteria: "Explicar coerção, escopo e retornos de funções.",
            exercise:
              "Criar uma calculadora de despesas e cobrir entradas inválidas.",
            resources: [
              {
                title: "JavaScript — linguagem",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                why: "Use nesta etapa para explicar coerção, escopo e retornos de funções. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Arrays, objetos e imutabilidade",
            criteria:
              "Transformar coleções sem alterar dados usados por outra parte da aplicação.",
            exercise:
              "Implementar filtros, agrupamento e totais de uma lista de tarefas.",
            resources: [
              {
                title: "JavaScript — linguagem",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                why: "Use nesta etapa para transformar coleções sem alterar dados usados por outra parte da aplicação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · navegador",
        topics: [
          {
            title: "DOM, eventos e formulários",
            criteria:
              "Atualizar a interface sem HTML inseguro e validar um formulário.",
            exercise: "Criar uma lista de tarefas navegável por teclado.",
            resources: [
              {
                title: "JavaScript — navegador",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting",
                why: "Use nesta etapa para atualizar a interface sem HTML inseguro e validar um formulário. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Módulos e persistência local",
            criteria:
              "Separar responsabilidades e recuperar dados inválidos com segurança.",
            exercise: "Dividir a lista em módulos e salvar um backup local.",
            resources: [
              {
                title: "JavaScript — navegador",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
                why: "Use nesta etapa para separar responsabilidades e recuperar dados inválidos com segurança. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · assíncrono",
        topics: [
          {
            title: "Promises, async/await e fetch",
            criteria: "Distinguir erro HTTP, falha de rede e cancelamento.",
            exercise:
              "Consultar uma API com carregamento, erro e botão de tentar novamente.",
            resources: [
              {
                title: "JavaScript — assíncrono",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises",
                why: "Use nesta etapa para distinguir erro HTTP, falha de rede e cancelamento. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Event loop e concorrência",
            criteria:
              "Explicar a ordem de execução de tarefas e limitar requisições simultâneas.",
            exercise:
              "Comparar busca sequencial e paralela com AbortController.",
            resources: [
              {
                title: "JavaScript — assíncrono",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
                why: "Use nesta etapa para explicar a ordem de execução de tarefas e limitar requisições simultâneas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · qualidade e projeto",
        topics: [
          {
            title: "Testes, acessibilidade e segurança",
            criteria:
              "Cobrir lógica e fluxo do usuário sem expor conteúdo inseguro.",
            exercise:
              "Testar a aplicação e corrigir foco, labels e renderização de texto externo.",
            resources: [
              {
                title: "JavaScript — qualidade e projeto",
                url: "https://vitest.dev/guide/",
                why: "Use nesta etapa para cobrir lógica e fluxo do usuário sem expor conteúdo inseguro. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final JavaScript",
            criteria:
              "Entregar uma aplicação que funcione em tela pequena e trate falhas.",
            exercise:
              "Construir um leitor de notícias com busca, filtros, cache e testes.",
            resources: [
              {
                title: "JavaScript — qualidade e projeto",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
                why: "Use nesta etapa para entregar uma aplicação que funcione em tela pequena e trate falhas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  TypeScript: {
    objective:
      "Modelar dados e limites de uma aplicação com TypeScript sem depender de casts inseguros.",
    prerequisites: "JavaScript: funções, objetos, módulos, promises e npm.",
    modules: [
      {
        title: "Básico · sistema de tipos",
        topics: [
          {
            title: "Inferência, unions e objetos",
            criteria: "Descrever dados comuns sem substituir tipos por any.",
            exercise:
              "Tipar um cadastro e distinguir estados de carregamento com unions.",
            resources: [
              {
                title: "TypeScript — sistema de tipos",
                url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
                why: "Use nesta etapa para descrever dados comuns sem substituir tipos por any. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Funções, interfaces e narrowing",
            criteria: "Refinar unknown com verificações em tempo de execução.",
            exercise:
              "Validar uma entrada externa antes de usar suas propriedades.",
            resources: [
              {
                title: "TypeScript — sistema de tipos",
                url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
                why: "Use nesta etapa para refinar unknown com verificações em tempo de execução. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · modelagem",
        topics: [
          {
            title: "Generics e restrições",
            criteria:
              "Criar uma função genérica que preserve a relação entre entrada e saída.",
            exercise: "Implementar paginação tipada e testar usos inválidos.",
            resources: [
              {
                title: "TypeScript — modelagem",
                url: "https://www.typescriptlang.org/docs/handbook/2/generics.html",
                why: "Use nesta etapa para criar uma função genérica que preserve a relação entre entrada e saída. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Utility types e discriminated unions",
            criteria:
              "Representar sucesso e falha sem combinações impossíveis de propriedades.",
            exercise:
              "Modelar o resultado de uma API sem campos opcionais ambíguos.",
            resources: [
              {
                title: "TypeScript — modelagem",
                url: "https://www.typescriptlang.org/docs/handbook/utility-types.html",
                why: "Use nesta etapa para representar sucesso e falha sem combinações impossíveis de propriedades. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · projeto e integração",
        topics: [
          {
            title: "Strict, módulos e build",
            criteria:
              "Explicar as opções strict e executar a compilação fora da IDE.",
            exercise:
              "Configurar um projeto com build e checagem de tipos separados.",
            resources: [
              {
                title: "TypeScript — projeto e integração",
                url: "https://www.typescriptlang.org/tsconfig/",
                why: "Use nesta etapa para explicar as opções strict e executar a compilação fora da IDE. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Fronteiras e validação de dados",
            criteria: "Diferenciar tipo estático e dado recebido em execução.",
            exercise: "Validar resposta HTTP e recusar payload incompatível.",
            resources: [
              {
                title: "TypeScript — projeto e integração",
                url: "https://www.typescriptlang.org/docs/handbook/2/typeof-types.html",
                why: "Use nesta etapa para diferenciar tipo estático e dado recebido em execução. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · projeto final",
        topics: [
          {
            title: "Tipos derivados e APIs públicas",
            criteria:
              "Derivar tipos sem perder legibilidade ou esconder erros com casts.",
            exercise:
              "Criar um cliente de API com estados e parâmetros consistentes.",
            resources: [
              {
                title: "TypeScript — projeto final",
                url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
                why: "Use nesta etapa para derivar tipos sem perder legibilidade ou esconder erros com casts. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final TypeScript",
            criteria:
              "Entregar aplicação com strict, validação externa e testes.",
            exercise:
              "Migrar o leitor de notícias para TypeScript e justificar cada exceção de tipo.",
            resources: [
              {
                title: "TypeScript — projeto final",
                url: "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html",
                why: "Use nesta etapa para entregar aplicação com strict, validação externa e testes. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  React: {
    objective:
      "Criar uma interface React acessível, com estado consistente, formulários e comunicação com API.",
    prerequisites: "JavaScript, HTML, CSS, módulos e async/await.",
    modules: [
      {
        title: "Básico · componentes",
        topics: [
          {
            title: "JSX, props e composição",
            criteria:
              "Separar componentes por responsabilidade e usar chaves estáveis.",
            exercise:
              "Criar cards de livros e uma lista filtrável sem estado duplicado.",
            resources: [
              {
                title: "React — componentes",
                url: "https://react.dev/learn/describing-the-ui",
                why: "Use nesta etapa para separar componentes por responsabilidade e usar chaves estáveis. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Estado e eventos",
            criteria:
              "Atualizar estado sem mutações e explicar a origem de cada dado.",
            exercise:
              "Criar um formulário de cadastro e ações de editar e remover.",
            resources: [
              {
                title: "React — componentes",
                url: "https://react.dev/learn/adding-interactivity",
                why: "Use nesta etapa para atualizar estado sem mutações e explicar a origem de cada dado. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · dados e efeitos",
        topics: [
          {
            title: "Estado derivado, reducers e contexto",
            criteria:
              "Evitar sincronização desnecessária e localizar o estado no dono correto.",
            exercise:
              "Adicionar seleção, filtro e edição a uma lista usando reducer.",
            resources: [
              {
                title: "React — dados e efeitos",
                url: "https://react.dev/learn/managing-state",
                why: "Use nesta etapa para evitar sincronização desnecessária e localizar o estado no dono correto. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Effects, cancelamento e refs",
            criteria:
              "Sincronizar um recurso externo com limpeza e dependências corretas.",
            exercise:
              "Buscar dados com cancelamento e impedir resposta antiga de sobrescrever a busca.",
            resources: [
              {
                title: "React — dados e efeitos",
                url: "https://react.dev/learn/escape-hatches",
                why: "Use nesta etapa para sincronizar um recurso externo com limpeza e dependências corretas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · experiência e testes",
        topics: [
          {
            title: "Formulários, foco e acessibilidade",
            criteria:
              "Operar todos os controles por teclado com labels e foco previsível.",
            exercise:
              "Criar um modal de edição com validação e recuperação de erro.",
            resources: [
              {
                title: "React — experiência e testes",
                url: "https://react.dev/reference/react-dom/components/input",
                why: "Use nesta etapa para operar todos os controles por teclado com labels e foco previsível. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Testes orientados ao usuário",
            criteria:
              "Testar comportamentos observáveis em vez de detalhes do estado.",
            exercise: "Cobrir criação, edição, erro de rede e estado vazio.",
            resources: [
              {
                title: "React — experiência e testes",
                url: "https://testing-library.com/docs/react-testing-library/intro/",
                why: "Use nesta etapa para testar comportamentos observáveis em vez de detalhes do estado. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · desempenho e entrega",
        topics: [
          {
            title: "Profiling e renderizações",
            criteria: "Medir um problema antes de adicionar memoização.",
            exercise:
              "Investigar uma lista lenta e registrar a comparação antes e depois.",
            resources: [
              {
                title: "React — desempenho e entrega",
                url: "https://react.dev/learn/react-compiler",
                why: "Use nesta etapa para medir um problema antes de adicionar memoização. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final React",
            criteria:
              "Entregar uma interface responsiva com persistência e testes.",
            exercise:
              "Construir um painel de leitura com busca, favoritos, formulários e modo offline.",
            resources: [
              {
                title: "React — desempenho e entrega",
                url: "https://react.dev/learn",
                why: "Use nesta etapa para entregar uma interface responsiva com persistência e testes. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  "Node.js": {
    objective:
      "Construir uma API Node.js com validação, persistência, autenticação e testes de integração.",
    prerequisites: "JavaScript, promises, HTTP e terminal.",
    modules: [
      {
        title: "Básico · runtime e módulos",
        topics: [
          {
            title: "Runtime, npm e módulos",
            criteria:
              "Executar scripts, gerenciar dependências e separar módulos.",
            exercise: "Criar uma CLI que importa e valida um arquivo JSON.",
            resources: [
              {
                title: "Node.js — runtime e módulos",
                url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
                why: "Use nesta etapa para executar scripts, gerenciar dependências e separar módulos. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "HTTP e event loop",
            criteria:
              "Explicar I/O assíncrono e evitar trabalho bloqueante no servidor.",
            exercise:
              "Criar um servidor HTTP e medir o efeito de um cálculo pesado.",
            resources: [
              {
                title: "Node.js — runtime e módulos",
                url: "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick",
                why: "Use nesta etapa para explicar I/O assíncrono e evitar trabalho bloqueante no servidor. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · API e dados",
        topics: [
          {
            title: "Rotas, validação e tratamento de erros",
            criteria:
              "Retornar códigos HTTP consistentes e limitar entradas externas.",
            exercise:
              "Implementar cadastro de livros com paginação, validação e erros padronizados.",
            resources: [
              {
                title: "Node.js — API e dados",
                url: "https://nodejs.org/api/http.html",
                why: "Use nesta etapa para retornar códigos HTTP consistentes e limitar entradas externas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Persistência e transações",
            criteria:
              "Executar consultas parametrizadas e testar falha de persistência.",
            exercise: "Adicionar PostgreSQL e um teste de rollback.",
            resources: [
              {
                title: "Node.js — API e dados",
                url: "https://node-postgres.com/features/queries",
                why: "Use nesta etapa para executar consultas parametrizadas e testar falha de persistência. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · testes e segurança",
        topics: [
          {
            title: "Testes de unidade e integração",
            criteria:
              "Separar regra e infraestrutura e testar uma requisição real.",
            exercise: "Cobrir cadastro válido, duplicado e payload inválido.",
            resources: [
              {
                title: "Node.js — testes e segurança",
                url: "https://nodejs.org/api/test.html",
                why: "Use nesta etapa para separar regra e infraestrutura e testar uma requisição real. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Autenticação, cookies e limites",
            criteria:
              "Proteger segredos no servidor e diferenciar autenticação de autorização.",
            exercise:
              "Proteger uma rota e testar sessão ausente e permissão insuficiente.",
            resources: [
              {
                title: "Node.js — testes e segurança",
                url: "https://nodejs.org/en/learn/getting-started/security-best-practices",
                why: "Use nesta etapa para proteger segredos no servidor e diferenciar autenticação de autorização. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · streams e operação",
        topics: [
          {
            title: "Streams, backpressure e cancelamento",
            criteria: "Processar dados grandes sem carregar tudo na memória.",
            exercise:
              "Importar um CSV de teste com tamanho limitado e cancelamento.",
            resources: [
              {
                title: "Node.js — streams e operação",
                url: "https://nodejs.org/api/stream.html",
                why: "Use nesta etapa para processar dados grandes sem carregar tudo na memória. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final Node.js",
            criteria:
              "Entregar API reproduzível com logs, health check e encerramento seguro.",
            exercise:
              "Entregar a API com banco, testes de integração e instruções de deploy.",
            resources: [
              {
                title: "Node.js — streams e operação",
                url: "https://nodejs.org/en/learn",
                why: "Use nesta etapa para entregar API reproduzível com logs, health check e encerramento seguro. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  Rust: {
    objective:
      "Construir uma aplicação Rust segura, com erros explícitos, testes e concorrência.",
    prerequisites: "Lógica, terminal e noções de compilação.",
    modules: [
      {
        title: "Básico · linguagem e Cargo",
        topics: [
          {
            title: "Cargo, tipos e controle de fluxo",
            criteria: "Criar um pacote e explicar tipos e expressões.",
            exercise:
              "Criar uma CLI de conversão de unidades com argumentos validados.",
            resources: [
              {
                title: "Rust — linguagem e Cargo",
                url: "https://doc.rust-lang.org/book/",
                why: "Use nesta etapa para criar um pacote e explicar tipos e expressões. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Ownership, borrowing e lifetimes",
            criteria:
              "Explicar por que uma referência é válida sem contornar o compilador.",
            exercise:
              "Implementar busca em uma coleção sem cópias desnecessárias.",
            resources: [
              {
                title: "Rust — linguagem e Cargo",
                url: "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html",
                why: "Use nesta etapa para explicar por que uma referência é válida sem contornar o compilador. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · modelagem",
        topics: [
          {
            title: "Structs, enums, Option e Result",
            criteria: "Representar ausência e falha explicitamente.",
            exercise:
              "Modelar estados de uma tarefa e tratar entrada inválida sem panic.",
            resources: [
              {
                title: "Rust — modelagem",
                url: "https://doc.rust-lang.org/book/ch06-00-enums.html",
                why: "Use nesta etapa para representar ausência e falha explicitamente. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Traits, generics e iteradores",
            criteria:
              "Separar comportamento com traits e transformar coleções com iteradores.",
            exercise:
              "Implementar duas formas de armazenamento para a mesma regra.",
            resources: [
              {
                title: "Rust — modelagem",
                url: "https://doc.rust-lang.org/book/ch10-00-generics.html",
                why: "Use nesta etapa para separar comportamento com traits e transformar coleções com iteradores. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · testes e módulos",
        topics: [
          {
            title: "Testes, módulos e documentação",
            criteria:
              "Cobrir a biblioteca e executar testes de exemplos públicos.",
            exercise:
              "Separar CLI e biblioteca e testar resultados válidos e erros.",
            resources: [
              {
                title: "Rust — testes e módulos",
                url: "https://doc.rust-lang.org/book/ch11-00-testing.html",
                why: "Use nesta etapa para cobrir a biblioteca e executar testes de exemplos públicos. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Arquivos e propagação de erros",
            criteria:
              "Propagar erros preservando contexto e fechar recursos corretamente.",
            exercise:
              "Adicionar leitura de arquivo com linha inválida e mensagem útil.",
            resources: [
              {
                title: "Rust — testes e módulos",
                url: "https://doc.rust-lang.org/book/ch09-00-error-handling.html",
                why: "Use nesta etapa para propagar erros preservando contexto e fechar recursos corretamente. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · concorrência e entrega",
        topics: [
          {
            title: "Threads, channels e estado compartilhado",
            criteria:
              "Escolher entre troca de mensagens e sincronização explícita.",
            exercise: "Processar arquivos com um conjunto limitado de workers.",
            resources: [
              {
                title: "Rust — concorrência e entrega",
                url: "https://doc.rust-lang.org/book/ch16-00-concurrency.html",
                why: "Use nesta etapa para escolher entre troca de mensagens e sincronização explícita. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final Rust",
            criteria:
              "Entregar binário e biblioteca com testes e documentação.",
            exercise:
              "Criar uma ferramenta de busca em arquivos com cancelamento e benchmark.",
            resources: [
              {
                title: "Rust — concorrência e entrega",
                url: "https://doc.rust-lang.org/cargo/",
                why: "Use nesta etapa para entregar binário e biblioteca com testes e documentação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  "C# / .NET": {
    objective:
      "Construir uma API .NET com domínio testável, persistência e autorização.",
    prerequisites: "Lógica de programação e terminal.",
    modules: [
      {
        title: "Básico · linguagem",
        topics: [
          {
            title: "SDK, tipos e funções",
            criteria:
              "Criar um projeto e explicar tipos de valor e referência.",
            exercise: "Construir uma CLI de tarefas com validação.",
            resources: [
              {
                title: "C# / .NET — linguagem",
                url: "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/",
                why: "Use nesta etapa para criar um projeto e explicar tipos de valor e referência. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Classes, interfaces e coleções",
            criteria: "Compor objetos e escolher uma coleção adequada.",
            exercise:
              "Separar regras do cadastro da implementação de armazenamento.",
            resources: [
              {
                title: "C# / .NET — linguagem",
                url: "https://learn.microsoft.com/en-us/dotnet/csharp/tour-of-csharp/",
                why: "Use nesta etapa para compor objetos e escolher uma coleção adequada. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · dados e assíncrono",
        topics: [
          {
            title: "LINQ, exceptions e nullable",
            criteria: "Consultar coleções e tratar ausência sem ocultar erros.",
            exercise: "Adicionar filtros e agrupamentos ao cadastro.",
            resources: [
              {
                title: "C# / .NET — dados e assíncrono",
                url: "https://learn.microsoft.com/en-us/dotnet/csharp/linq/",
                why: "Use nesta etapa para consultar coleções e tratar ausência sem ocultar erros. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Async, await e cancelamento",
            criteria:
              "Propagar cancelamento e evitar bloqueio de tarefas assíncronas.",
            exercise: "Consultar um serviço com timeout e CancellationToken.",
            resources: [
              {
                title: "C# / .NET — dados e assíncrono",
                url: "https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/",
                why: "Use nesta etapa para propagar cancelamento e evitar bloqueio de tarefas assíncronas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · API e persistência",
        topics: [
          {
            title: "ASP.NET Core e validação",
            criteria:
              "Implementar endpoints com contrato de erros e validação.",
            exercise: "Expor API de tarefas e testar códigos HTTP.",
            resources: [
              {
                title: "C# / .NET — API e persistência",
                url: "https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api",
                why: "Use nesta etapa para implementar endpoints com contrato de erros e validação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "EF Core e transações",
            criteria: "Persistir dados e observar consultas e migrações.",
            exercise: "Adicionar banco e testar uma atualização concorrente.",
            resources: [
              {
                title: "C# / .NET — API e persistência",
                url: "https://learn.microsoft.com/en-us/ef/core/",
                why: "Use nesta etapa para persistir dados e observar consultas e migrações. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · segurança e projeto",
        topics: [
          {
            title: "Autorização e testes de integração",
            criteria:
              "Testar sessão ausente, acesso negado e fluxo autorizado.",
            exercise: "Proteger rotas e testar políticas de acesso.",
            resources: [
              {
                title: "C# / .NET — segurança e projeto",
                url: "https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests",
                why: "Use nesta etapa para testar sessão ausente, acesso negado e fluxo autorizado. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final .NET",
            criteria:
              "Entregar API com banco, testes, configuração segura e documentação.",
            exercise: "Construir API de biblioteca com logs e health checks.",
            resources: [
              {
                title: "C# / .NET — segurança e projeto",
                url: "https://learn.microsoft.com/en-us/aspnet/core/security/",
                why: "Use nesta etapa para entregar API com banco, testes, configuração segura e documentação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  "SQL / PostgreSQL": {
    objective:
      "Modelar, consultar e otimizar um banco relacional com transações e migrações.",
    prerequisites:
      "Lógica e noções de dados; nenhuma experiência em SQL é necessária.",
    modules: [
      {
        title: "Básico · modelo relacional",
        topics: [
          {
            title: "Tabelas, tipos e restrições",
            criteria:
              "Representar relações e impedir registros inválidos no banco.",
            exercise:
              "Modelar livros, autores e empréstimos com chaves e restrições.",
            resources: [
              {
                title: "SQL / PostgreSQL — modelo relacional",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Use nesta etapa para representar relações e impedir registros inválidos no banco. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "SELECT, filtros e joins",
            criteria:
              "Consultar relações sem produzir duplicidades acidentais.",
            exercise: "Consultar empréstimos ativos e livros sem empréstimo.",
            resources: [
              {
                title: "SQL / PostgreSQL — modelo relacional",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Use nesta etapa para consultar relações sem produzir duplicidades acidentais. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · consultas",
        topics: [
          {
            title: "Agregações, CTEs e funções de janela",
            criteria:
              "Explicar agrupamento e calcular resultados preservando a granularidade.",
            exercise:
              "Gerar ranking mensal e totais acumulados de empréstimos.",
            resources: [
              {
                title: "SQL / PostgreSQL — consultas",
                url: "https://www.postgresql.org/docs/current/queries.html",
                why: "Use nesta etapa para explicar agrupamento e calcular resultados preservando a granularidade. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Transações e isolamento",
            criteria:
              "Demonstrar commit, rollback e uma anomalia de concorrência.",
            exercise:
              "Simular dois usuários tentando reservar o mesmo exemplar.",
            resources: [
              {
                title: "SQL / PostgreSQL — consultas",
                url: "https://www.postgresql.org/docs/current/transaction-iso.html",
                why: "Use nesta etapa para demonstrar commit, rollback e uma anomalia de concorrência. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · desempenho e operação",
        topics: [
          {
            title: "Índices e planos de execução",
            criteria: "Comparar o plano antes e depois de criar um índice.",
            exercise:
              "Medir uma consulta e justificar o índice com EXPLAIN ANALYZE.",
            resources: [
              {
                title: "SQL / PostgreSQL — desempenho e operação",
                url: "https://www.postgresql.org/docs/current/using-explain.html",
                why: "Use nesta etapa para comparar o plano antes e depois de criar um índice. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Backup, privilégios e projeto final",
            criteria:
              "Restaurar um backup e restringir permissões ao necessário.",
            exercise:
              "Entregar schema, migrações, consultas, testes e uma restauração validada.",
            resources: [
              {
                title: "SQL / PostgreSQL — desempenho e operação",
                url: "https://www.postgresql.org/docs/current/backup.html",
                why: "Use nesta etapa para restaurar um backup e restringir permissões ao necessário. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  Git: {
    objective:
      "Trabalhar com histórico, branches e colaboração com segurança e recuperação.",
    prerequisites: "Uso básico do terminal e arquivos.",
    modules: [
      {
        title: "Básico · histórico e commits",
        topics: [
          {
            title: "Working tree, staging e commits",
            criteria:
              "Explicar o que está preparado e revisar um diff antes de registrar.",
            exercise:
              "Criar um repositório e fazer três commits com mudanças pequenas.",
            resources: [
              {
                title: "Git — histórico e commits",
                url: "https://git-scm.com/book/en/v2",
                why: "Use nesta etapa para explicar o que está preparado e revisar um diff antes de registrar. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Logs, diffs e .gitignore",
            criteria:
              "Localizar uma alteração e impedir inclusão de arquivos sensíveis.",
            exercise:
              "Investigar quando uma regra foi modificada e ignorar arquivos locais.",
            resources: [
              {
                title: "Git — histórico e commits",
                url: "https://git-scm.com/book/en/v2",
                why: "Use nesta etapa para localizar uma alteração e impedir inclusão de arquivos sensíveis. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · branches e colaboração",
        topics: [
          {
            title: "Branches, merges e conflitos",
            criteria:
              "Resolver um conflito preservando o comportamento desejado.",
            exercise:
              "Simular duas branches alterando a mesma função e validar o merge.",
            resources: [
              {
                title: "Git — branches e colaboração",
                url: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
                why: "Use nesta etapa para resolver um conflito preservando o comportamento desejado. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Remotos e revisão",
            criteria:
              "Distinguir fetch, pull e push e revisar a mudança antes de compartilhar.",
            exercise:
              "Criar uma branch e preparar um pedido de revisão com diff pequeno.",
            resources: [
              {
                title: "Git — branches e colaboração",
                url: "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes",
                why: "Use nesta etapa para distinguir fetch, pull e push e revisar a mudança antes de compartilhar. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · recuperação e diagnóstico",
        topics: [
          {
            title: "Revert, restore e reflog",
            criteria:
              "Escolher uma recuperação preservando mudanças não relacionadas.",
            exercise:
              "Recuperar um commit em um repositório descartável e registrar os passos.",
            resources: [
              {
                title: "Git — recuperação e diagnóstico",
                url: "https://git-scm.com/docs/git-reflog",
                why: "Use nesta etapa para escolher uma recuperação preservando mudanças não relacionadas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Bisect e fluxo completo",
            criteria:
              "Encontrar a introdução de um defeito e justificar o fluxo de branches.",
            exercise:
              "Criar um histórico de teste, localizar a regressão com bisect e revertê-la.",
            resources: [
              {
                title: "Git — recuperação e diagnóstico",
                url: "https://git-scm.com/docs/git-bisect",
                why: "Use nesta etapa para encontrar a introdução de um defeito e justificar o fluxo de branches. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  Linux: {
    objective:
      "Usar Linux para desenvolver e operar serviços com permissões, processos e diagnóstico.",
    prerequisites:
      "Um ambiente de laboratório; execute exercícios sem alterar o sistema principal.",
    modules: [
      {
        title: "Básico · terminal e arquivos",
        topics: [
          {
            title: "Caminhos, arquivos e pipelines",
            criteria:
              "Navegar, filtrar texto e compor comandos entendendo suas entradas.",
            exercise:
              "Organizar uma pasta de laboratório e gerar um relatório de arquivos.",
            resources: [
              {
                title: "Linux — terminal e arquivos",
                url: "https://ubuntu.com/tutorials/command-line-for-beginners",
                why: "Use nesta etapa para navegar, filtrar texto e compor comandos entendendo suas entradas. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Usuários e permissões",
            criteria:
              "Explicar leitura, escrita e execução e aplicar o menor privilégio.",
            exercise:
              "Criar arquivos de teste e comparar permissões sem usar 777.",
            resources: [
              {
                title: "Linux — terminal e arquivos",
                url: "https://man7.org/linux/man-pages/man1/chmod.1.html",
                why: "Use nesta etapa para explicar leitura, escrita e execução e aplicar o menor privilégio. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · processos e rede",
        topics: [
          {
            title: "Processos, sinais e serviços",
            criteria:
              "Identificar um processo e encerrar um serviço de teste de forma controlada.",
            exercise:
              "Executar um servidor local e observar PID, logs e encerramento.",
            resources: [
              {
                title: "Linux — processos e rede",
                url: "https://www.freedesktop.org/software/systemd/man/latest/",
                why: "Use nesta etapa para identificar um processo e encerrar um serviço de teste de forma controlada. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "HTTP, DNS e portas",
            criteria: "Distinguir falha de nome, conexão e resposta HTTP.",
            exercise:
              "Diagnosticar um servidor de laboratório usando curl e ferramentas de rede.",
            resources: [
              {
                title: "Linux — processos e rede",
                url: "https://curl.se/docs/manual.html",
                why: "Use nesta etapa para distinguir falha de nome, conexão e resposta HTTP. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · automação e diagnóstico",
        topics: [
          {
            title: "Scripts, saída e tratamento de erros",
            criteria: "Validar parâmetros e propagar um código de saída útil.",
            exercise:
              "Criar um script de backup de uma pasta de teste e simular uma falha.",
            resources: [
              {
                title: "Linux — automação e diagnóstico",
                url: "https://man7.org/linux/man-pages/man1/bash.1.html",
                why: "Use nesta etapa para validar parâmetros e propagar um código de saída útil. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final Linux",
            criteria:
              "Reproduzir a operação de um serviço e documentar recuperação.",
            exercise:
              "Preparar serviço de laboratório com logs, usuário limitado e restauração testada.",
            resources: [
              {
                title: "Linux — automação e diagnóstico",
                url: "https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html",
                why: "Use nesta etapa para reproduzir a operação de um serviço e documentar recuperação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  Kubernetes: {
    objective:
      "Executar e diagnosticar uma aplicação em um cluster local, com configuração e entrega controlada.",
    prerequisites: "Docker, HTTP, terminal e fundamentos de rede.",
    modules: [
      {
        title: "Básico · cluster e workloads",
        topics: [
          {
            title: "Cluster, pods e deployments",
            criteria: "Distinguir pod e deployment e observar reconciliação.",
            exercise:
              "Executar uma API em um cluster local e acompanhar reinício de um pod.",
            resources: [
              {
                title: "Kubernetes — cluster e workloads",
                url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
                why: "Use nesta etapa para distinguir pod e deployment e observar reconciliação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Services e descoberta",
            criteria: "Explicar acesso interno e externo a um serviço.",
            exercise: "Conectar duas aplicações e validar DNS e portas.",
            resources: [
              {
                title: "Kubernetes — cluster e workloads",
                url: "https://kubernetes.io/docs/concepts/services-networking/service/",
                why: "Use nesta etapa para explicar acesso interno e externo a um serviço. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · configuração e dados",
        topics: [
          {
            title: "ConfigMaps, Secrets e probes",
            criteria:
              "Separar configuração de imagem e distinguir readiness e liveness.",
            exercise:
              "Configurar a API sem segredos no manifesto público e testar uma probe.",
            resources: [
              {
                title: "Kubernetes — configuração e dados",
                url: "https://kubernetes.io/docs/concepts/configuration/",
                why: "Use nesta etapa para separar configuração de imagem e distinguir readiness e liveness. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Volumes e recursos",
            criteria: "Explicar persistência e limites de CPU e memória.",
            exercise:
              "Montar um volume e observar o comportamento ao recriar o pod.",
            resources: [
              {
                title: "Kubernetes — configuração e dados",
                url: "https://kubernetes.io/docs/concepts/storage/volumes/",
                why: "Use nesta etapa para explicar persistência e limites de CPU e memória. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · segurança e operação",
        topics: [
          {
            title: "RBAC e políticas de acesso",
            criteria:
              "Reduzir permissões de uma identidade de serviço e testar acesso negado.",
            exercise:
              "Criar uma service account e permitir apenas a operação necessária.",
            resources: [
              {
                title: "Kubernetes — segurança e operação",
                url: "https://kubernetes.io/docs/concepts/security/",
                why: "Use nesta etapa para reduzir permissões de uma identidade de serviço e testar acesso negado. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Rollouts, diagnóstico e projeto final",
            criteria:
              "Investigar um deployment falho e executar rollback verificável.",
            exercise:
              "Entregar manifests para uma API com probes, limites, configuração e roteiro de rollback.",
            resources: [
              {
                title: "Kubernetes — segurança e operação",
                url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/",
                why: "Use nesta etapa para investigar um deployment falho e executar rollback verificável. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  "Segurança de aplicações": {
    objective:
      "Construir e verificar controles de segurança em uma aplicação própria de laboratório.",
    prerequisites:
      "HTTP, programação e uma aplicação de teste sob seu controle.",
    modules: [
      {
        title: "Básico · ameaças e confiança",
        topics: [
          {
            title: "Ativos, fronteiras e modelo de ameaças",
            criteria:
              "Identificar dados sensíveis, entradas e fronteiras de confiança.",
            exercise:
              "Desenhar o fluxo de dados de uma API de laboratório e listar três ameaças.",
            resources: [
              {
                title: "Segurança de aplicações — ameaças e confiança",
                url: "https://owasp.org/www-project-top-ten/",
                why: "Use nesta etapa para identificar dados sensíveis, entradas e fronteiras de confiança. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Validação e injeções",
            criteria:
              "Distinguir validação de entrada, parametrização e escape de saída.",
            exercise:
              "Corrigir uma consulta montada por concatenação e testar payload inválido.",
            resources: [
              {
                title: "Segurança de aplicações — ameaças e confiança",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
                why: "Use nesta etapa para distinguir validação de entrada, parametrização e escape de saída. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · identidade e navegador",
        topics: [
          {
            title: "Autenticação, autorização e sessões",
            criteria:
              "Distinguir identidade de permissão e recusar acesso a recurso de outro usuário.",
            exercise:
              "Testar login, expiração, logout e tentativa de acessar um objeto de outro usuário.",
            resources: [
              {
                title: "Segurança de aplicações — identidade e navegador",
                url: "https://cheatsheetseries.owasp.org/",
                why: "Use nesta etapa para distinguir identidade de permissão e recusar acesso a recurso de outro usuário. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "XSS, CSRF e cookies",
            criteria: "Explicar a fronteira protegida por cada controle.",
            exercise:
              "Validar renderização de texto externo e testar origem em uma ação autenticada.",
            resources: [
              {
                title: "Segurança de aplicações — identidade e navegador",
                url: "https://cheatsheetseries.owasp.org/",
                why: "Use nesta etapa para explicar a fronteira protegida por cada controle. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · verificação e resposta",
        topics: [
          {
            title: "Dependências, segredos e configuração",
            criteria:
              "Identificar dependência vulnerável sem expor credenciais em logs.",
            exercise:
              "Revisar o laboratório e corrigir um segredo fictício e um pacote vulnerável.",
            resources: [
              {
                title: "Segurança de aplicações — verificação e resposta",
                url: "https://owasp.org/www-project-application-security-verification-standard/",
                why: "Use nesta etapa para identificar dependência vulnerável sem expor credenciais em logs. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final de segurança",
            criteria:
              "Entregar uma verificação reproduzível com evidência e prioridades.",
            exercise:
              "Revisar a própria API com um recorte do ASVS, corrigir achados e testar regressões.",
            resources: [
              {
                title: "Segurança de aplicações — verificação e resposta",
                url: "https://owasp.org/www-project-application-security-verification-standard/",
                why: "Use nesta etapa para entregar uma verificação reproduzível com evidência e prioridades. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
  "AWS / Cloud": {
    objective:
      "Desenhar e operar uma aplicação em nuvem entendendo identidade, redes, confiabilidade e custos.",
    prerequisites:
      "HTTP, Linux e noções de rede. Comece com estudo e laboratório local; não é necessário contratar recursos.",
    modules: [
      {
        title: "Básico · fundamentos e identidade",
        topics: [
          {
            title: "Regiões, serviços e responsabilidade",
            criteria:
              "Distinguir responsabilidades do provedor e da aplicação.",
            exercise:
              "Desenhar uma aplicação simples e identificar dados, computação e rede.",
            resources: [
              {
                title: "AWS / Cloud — fundamentos e identidade",
                url: "https://docs.aws.amazon.com/whitepapers/latest/aws-overview/introduction.html",
                why: "Use nesta etapa para distinguir responsabilidades do provedor e da aplicação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "IAM e menor privilégio",
            criteria: "Explicar principal, ação e recurso de uma política.",
            exercise:
              "Revisar uma política fictícia e reduzir permissões sem usar credenciais reais.",
            resources: [
              {
                title: "AWS / Cloud — fundamentos e identidade",
                url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html",
                why: "Use nesta etapa para explicar principal, ação e recurso de uma política. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · rede e arquitetura",
        topics: [
          {
            title: "VPC, sub-redes e acesso",
            criteria:
              "Explicar a diferença entre rota, security group e exposição pública.",
            exercise:
              "Desenhar a rede de uma API e justificar os caminhos permitidos.",
            resources: [
              {
                title: "AWS / Cloud — rede e arquitetura",
                url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html",
                why: "Use nesta etapa para explicar a diferença entre rota, security group e exposição pública. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Computação, armazenamento e banco",
            criteria:
              "Comparar serviços gerenciados usando requisitos de carga e operação.",
            exercise:
              "Escolher uma arquitetura para API de biblioteca e estimar os componentes.",
            resources: [
              {
                title: "AWS / Cloud — rede e arquitetura",
                url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
                why: "Use nesta etapa para comparar serviços gerenciados usando requisitos de carga e operação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · confiabilidade e custos",
        topics: [
          {
            title: "Métricas, recuperação e disponibilidade",
            criteria:
              "Definir um objetivo de disponibilidade e um procedimento de recuperação.",
            exercise:
              "Projetar monitoramento e simular uma falha com componentes locais.",
            resources: [
              {
                title: "AWS / Cloud — confiabilidade e custos",
                url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
                why: "Use nesta etapa para definir um objetivo de disponibilidade e um procedimento de recuperação. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
          {
            title: "Projeto final Cloud",
            criteria:
              "Justificar segurança, custo e recuperação antes de provisionar.",
            exercise:
              "Entregar diagrama, estimativa de custo, modelo de ameaças e roteiro de rollback sem contratar recursos.",
            resources: [
              {
                title: "AWS / Cloud — confiabilidade e custos",
                url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
                why: "Use nesta etapa para justificar segurança, custo e recuperação antes de provisionar. A referência acompanha a prática deste módulo; avance depois de executar o exercício.",
              },
            ],
          },
        ],
      },
    ],
  },
};
