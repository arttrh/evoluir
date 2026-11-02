export type LessonGuideData = {
  explanation: string[];
  practice: string[];
  pitfall: string;
  evidence: string;
  minutes: number;
  project: string;
  example: string | null;
};
export const lessonGuides: Record<string, LessonGuideData> = {
  "Java::JDK, JVM e primeiro programa": {
    explanation: [
      "O arquivo .java é compilado em bytecode; a JVM executa esse bytecode. O JDK reúne ferramentas como javac, java e depuradores.",
      "Distinguir essas peças ajuda a localizar erros de compilação e execução antes de alterar o código por tentativa. Use um JDK suportado pela linha do framework que escolher.",
    ],
    practice: [
      "Crie uma pasta de laboratório e um Main.java que imprima o nome da livraria.",
      "Compile pelo terminal, execute e compare com a execução pela IDE.",
      "Remova um ponto e vírgula, leia a mensagem e restaure o programa.",
    ],
    pitfall:
      "Confundir o nome da classe com o caminho do arquivo ou corrigir um erro de sintaxe alterando a versão do Java.",
    evidence:
      "Executar o mesmo programa pelo terminal e pela IDE e explicar onde surge cada arquivo de saída.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example:
      'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Livraria");\n  }\n}',
  },
  "Java::Variáveis, entrada e saída": {
    explanation: [
      "Uma variável tem tipo e valor. Dados digitados pelo usuário são texto até serem convertidos e validados; uma exceção de conversão precisa de uma mensagem útil.",
      "Não confunda concatenação com soma: o contexto de String muda o significado de +.",
    ],
    practice: [
      "Leia título e quantidade de um livro pelo terminal.",
      "Converta a quantidade e rejeite texto, zero e números negativos.",
      "Mostre um resumo sem encerrar abruptamente o programa.",
    ],
    pitfall:
      "Aceitar entrada inválida e descobrir o problema apenas na gravação dos dados.",
    evidence:
      "Demonstrar entradas válida, vazia, não numérica e negativa com resultados previsíveis.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Fluxo, métodos e diagnóstico de uma falha": {
    explanation: [
      "Condicionais escolhem caminhos; laços repetem trabalho. Métodos pequenos deixam explícitas as entradas e saídas de cada regra.",
      "Um breakpoint permite observar estado e pilha de chamadas. Depurar é seguir uma hipótese, não executar passos aleatórios.",
    ],
    practice: [
      "Implemente um menu cadastrar, listar e sair.",
      "Extraia a validação de quantidade para um método.",
      "Coloque um breakpoint, observe duas iterações e corrija um laço que não termina.",
    ],
    pitfall:
      "Usar estado global para fazer os métodos se comunicarem ou esquecer de atualizar a condição do laço.",
    evidence:
      "Percorrer cada opção do menu e explicar com o depurador por que o laço termina.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Tipos primitivos, conversões e precisão": {
    explanation: [
      "int, long, double, boolean e char representam valores diferentes e têm limites. Uma conversão pode perder informação; um inteiro não comporta qualquer quantidade.",
      "Para valores decimais que exigem exatidão, estude a representação antes de escolher o tipo. Arredondamento é uma decisão de domínio.",
    ],
    practice: [
      "Compare divisão inteira e decimal em exemplos pequenos.",
      "Leia um preço como texto, converta com BigDecimal e calcule o total de três unidades.",
      "Teste uma quantidade além do limite escolhido.",
    ],
    pitfall:
      "Construir BigDecimal a partir de um double e supor que o valor original era decimal exato.",
    evidence:
      "Explicar a diferença entre 5 / 2 e 5.0 / 2 e testar o cálculo decimal do total.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Strings, igualdade e validação": {
    explanation: [
      "String é imutável; operações de transformação produzem novos valores. == compara referências de objetos, enquanto equals expressa a comparação de conteúdo definida pela classe.",
      "Um contrato de entrada precisa decidir como tratar espaços, ausência e limites de tamanho.",
    ],
    practice: [
      "Normalize o título removendo espaços externos.",
      "Recuse um título vazio e estabeleça um limite de tamanho.",
      "Compare dois títulos criados de formas diferentes e escreva o resultado esperado.",
    ],
    pitfall: "Usar == para decidir se dois títulos têm o mesmo conteúdo.",
    evidence:
      "Cobrir texto vazio, espaços, caracteres acentuados e duas instâncias com o mesmo conteúdo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Arrays, loops e decomposição": {
    explanation: [
      "Um array tem tamanho fixo e índices iniciados em zero. Processar uma coleção exige pensar no caso vazio e no último elemento.",
      "Separar leitura, regra e apresentação permite testar regras sem abrir o terminal.",
    ],
    practice: [
      "Armazene três livros em um array e liste com índice.",
      "Extraia busca por título para uma função.",
      "Teste um array vazio, um item e uma busca sem resultado.",
    ],
    pitfall:
      "Acessar índice igual ao tamanho ou usar um valor nulo como se fosse um livro válido.",
    evidence:
      "Executar os três limites e explicar a condição que impede acesso fora do array.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Classes, encapsulamento e invariantes": {
    explanation: [
      "Uma classe de domínio combina dados com regras que devem valer após qualquer operação. Encapsular não é apenas criar getters e setters: é impedir estados inválidos.",
      "O objeto Livro deve proteger sua quantidade, identificador e título, inclusive quando a alteração não veio do formulário.",
    ],
    practice: [
      "Modele Livro com identificador, título e estoque.",
      "Crie operações repor e reservar que validem a quantidade.",
      "Tente violar a regra chamando o objeto diretamente, sem usar o menu.",
    ],
    pitfall:
      "Deixar setters públicos que permitem estoque negativo e validar apenas na interface.",
    evidence:
      "Demonstrar que nenhuma operação pública permite título vazio ou estoque negativo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Herança, interfaces e composição": {
    explanation: [
      "Herança estabelece uma relação de substituição; composição combina comportamentos sem obrigar essa relação. Interfaces pequenas descrevem o que um consumidor precisa fazer.",
      "A regra de reserva não deve depender de um arquivo específico ou de um banco concreto.",
    ],
    practice: [
      "Defina uma interface de repositório com salvar e buscar.",
      "Implemente uma versão em memória.",
      "Injete o repositório no serviço de reservas e troque a implementação em um teste.",
    ],
    pitfall:
      "Criar uma hierarquia de classes só para reutilizar um método ou espalhar instanceof no serviço.",
    evidence:
      "Trocar a persistência por uma implementação de teste sem alterar a regra de reserva.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Equals, hashCode, records e imutabilidade": {
    explanation: [
      "Igualdade de valor e identidade são decisões diferentes. Objetos usados como chaves de hash precisam manter o contrato entre equals e hashCode.",
      "Records ajudam a representar dados, mas não tornam automaticamente imutável o conteúdo de uma coleção recebida.",
    ],
    practice: [
      "Crie um record para o identificador do livro.",
      "Use-o como chave de um mapa e teste a busca com uma instância equivalente.",
      "Experimente receber uma lista mutável em um record e proteja o estado.",
    ],
    pitfall:
      "Alterar um campo que participa do hash depois de inserir a chave em um mapa.",
    evidence:
      "Explicar o contrato de igualdade e testar recuperação por uma chave equivalente.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Tipos, coleções e objetos": {
    explanation: [
      "List preserva uma sequência, Set expressa ausência de duplicidade e Map associa chave e valor. A escolha da coleção faz parte da regra, não apenas da sintaxe.",
      "A referência retornada ao chamador não deve permitir modificar o catálogo por fora das validações.",
    ],
    practice: [
      "Substitua o array do catálogo por uma coleção apropriada.",
      "Impeça identificadores duplicados.",
      "Retorne uma visão segura da listagem e teste tentativa de alteração externa.",
    ],
    pitfall:
      "Escolher sempre ArrayList ou devolver a lista interna mutável do serviço.",
    evidence:
      "Justificar cada coleção e provar que uma referência retornada não altera o estoque interno.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Generics, comparadores e ordenação": {
    explanation: [
      "Generics preservam relações de tipo em tempo de compilação e reduzem casts. Um Comparator define uma ordem que precisa ser consistente para o caso de uso.",
      "Ordenar por título é diferente de decidir que dois livros são iguais.",
    ],
    practice: [
      "Crie uma função genérica de paginação de listas.",
      "Ordene livros por título e, em empate, por identificador.",
      "Teste página vazia, última página e tamanho inválido.",
    ],
    pitfall:
      "Usar coleções sem parâmetro de tipo ou confundir compare == 0 com a identidade de domínio.",
    evidence:
      "Compilar sem tipos crus e demonstrar ordenação estável em empates.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Complexidade e estruturas de dados": {
    explanation: [
      "Um algoritmo de busca linear examina elementos até encontrar um resultado; uma estrutura indexada mantém informação adicional para acelerar determinadas buscas.",
      "O custo inclui tempo, memória e atualização do índice. Big-O descreve crescimento, não promete tempo absoluto.",
    ],
    practice: [
      "Implemente busca por identificador com lista e com mapa.",
      "Conte comparações para tamanhos diferentes.",
      "Explique o custo de atualizar e manter as duas representações.",
    ],
    pitfall:
      "Escolher uma estrutura apenas porque um teste pequeno pareceu mais rápido.",
    evidence:
      "Comparar crescimento e custo de atualização sem confundir uma medição isolada com garantia de desempenho.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Exceções, streams e testes": {
    explanation: [
      "Exceções comunicam falhas que precisam ser tratadas na fronteira adequada. Streams descrevem transformações de coleções e não substituem toda regra de negócio.",
      "Uma pipeline deve definir o comportamento de entrada vazia e evitar efeitos colaterais escondidos em map ou filter.",
    ],
    practice: [
      "Calcule totais por categoria com streams.",
      "Mantenha uma versão simples equivalente com laços.",
      "Teste coleção vazia e erro de dados e compare os resultados.",
    ],
    pitfall:
      "Capturar Exception e retornar um resultado aparentemente válido, escondendo a falha.",
    evidence:
      "Explicar onde a exceção é convertida em mensagem e provar equivalência das duas implementações.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Arquivos, recursos e persistência segura": {
    explanation: [
      "Um recurso aberto deve ser fechado mesmo se a leitura falhar. try-with-resources expressa essa obrigação no fluxo do programa.",
      "Persistir dados exige distinguir arquivo ausente, conteúdo inválido e falha durante a escrita.",
    ],
    practice: [
      "Salve o catálogo em um arquivo de laboratório.",
      "Leia linha a linha e informe o número de uma linha inválida.",
      "Simule uma falha e garanta que o arquivo anterior permaneça recuperável.",
    ],
    pitfall:
      "Sobrescrever o arquivo original antes de validar toda a nova representação.",
    evidence:
      "Reproduzir arquivo ausente, inválido e erro de escrita sem perder a cópia anterior.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Datas, Optional e fronteiras de entrada": {
    explanation: [
      "Uma data civil e um instante são conceitos diferentes; o fuso é necessário ao converter um no outro. Optional representa ausência no retorno, não substitui validação.",
      "Datas recebidas de fora precisam de formato e regra de domínio explícitos.",
    ],
    practice: [
      "Adicione prazo de uma reserva usando LocalDate.",
      "Injete um relógio ou data de referência para testar vencimento.",
      "Retorne ausência quando o identificador não existir.",
    ],
    pitfall:
      "Usar o relógio real no teste ou assumir que todo dia tem exatamente 24 horas em qualquer fuso.",
    evidence:
      "Testar dia anterior, dia do prazo e dia seguinte sem depender da data atual.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Maven: estrutura, ciclo e dependências": {
    explanation: [
      "O build deve ser reproduzível fora da IDE. Maven organiza fontes, testes e artefatos e resolve dependências segundo o projeto e seus repositórios.",
      "compile, test e package têm propósitos diferentes; um JAR existir não prova que todos os testes foram executados.",
    ],
    practice: [
      "Crie um pom para a livraria e execute compile, test e package.",
      "Inspecione a árvore de dependências.",
      "Introduza e remova um conflito transitivo em um projeto descartável.",
    ],
    pitfall:
      "Confiar apenas no botão da IDE ou adicionar versões conflitantes por tentativa.",
    evidence:
      "Construir o projeto em uma pasta limpa e explicar de onde veio cada dependência principal.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Gradle e wrappers de build": {
    explanation: [
      "Um wrapper fixa a ferramenta esperada pelo projeto. Gradle e Maven oferecem modelos diferentes para tarefas, dependências e configuração.",
      "Comparar ferramentas exige construir o mesmo comportamento, em vez de apenas copiar comandos.",
    ],
    practice: [
      "Monte uma variante mínima com Gradle Wrapper.",
      "Execute testes e empacotamento e compare com Maven.",
      "Registre qual ferramenta você manterá no projeto e por quê.",
    ],
    pitfall:
      "Misturar dois builds de produção sem necessidade ou depender da versão instalada globalmente.",
    evidence:
      "Executar os dois exemplos com wrapper e explicar a escolha do build principal.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Configuração, ambientes e segredos": {
    explanation: [
      "Configuração do ambiente não deve virar regra fixa no código. Um segredo não pertence ao repositório, ao artefato público ou a mensagens de erro.",
      "Falhas de configuração precisam ser explícitas antes de aceitar trabalho.",
    ],
    practice: [
      "Leia uma configuração de caminho do catálogo pelo ambiente.",
      "Defina um exemplo sem valores pessoais.",
      "Teste variável ausente e arquivo inacessível.",
    ],
    pitfall:
      "Usar um segredo real em arquivo de exemplo ou ocultar a configuração inválida com um valor perigoso.",
    evidence:
      "Iniciar com ambiente válido e recusar ambiente inválido com uma mensagem sem credenciais.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::JUnit, parametrização e desenho testável": {
    explanation: [
      "Um teste útil observa um contrato: entradas, resultado e efeitos relevantes. Casos parametrizados tornam limites explícitos sem repetir preparação inteira.",
      "O código fica mais testável quando relógio, persistência e comunicação não estão presos à regra de domínio.",
    ],
    practice: [
      "Teste reserva válida, livro ausente e estoque insuficiente.",
      "Parametrize quantidade zero, negativa e acima do estoque.",
      "Mostre uma falha real quando a regra for alterada incorretamente.",
    ],
    pitfall:
      "Testar apenas getters ou reproduzir a implementação dentro da asserção.",
    evidence:
      "Fazer um teste falhar ao introduzir uma regressão e explicar o contrato protegido.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Mocks, fakes e integração": {
    explanation: [
      "Um fake implementa um contrato simplificado; um mock verifica interações específicas. Nenhum dos dois substitui um teste que exercita a fronteira real quando o risco está nessa fronteira.",
      "Evite verificar chamadas internas que não fazem parte do comportamento prometido.",
    ],
    practice: [
      "Use um repositório em memória nos testes de regra.",
      "Escreva um teste de integração da persistência em arquivo.",
      "Provoque uma falha de escrita e confira a mensagem e os dados preservados.",
    ],
    pitfall:
      "Uma suíte passar porque o mock devolve exatamente o que a aplicação espera, sem validar o formato real.",
    evidence:
      "Distinguir o risco coberto por cada tipo de teste e demonstrar a falha de persistência.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Git e revisão de uma mudança": {
    explanation: [
      "Um commit deve representar uma alteração revisável com propósito. A revisão começa pelo diff e inclui código, teste e instrução de execução.",
      "Recuperar uma mudança é diferente de apagar trabalho não relacionado.",
    ],
    practice: [
      "Crie uma branch de laboratório e adicione uma regra com teste.",
      "Revise o diff e escreva a intenção do commit.",
      "Simule um conflito e recupere um commit em um repositório descartável.",
    ],
    pitfall:
      "Usar comandos destrutivos no repositório real para experimentar recuperação.",
    evidence:
      "Entregar uma mudança pequena, validada e com histórico compreensível.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Modelo relacional, joins e restrições": {
    explanation: [
      "A modelagem define quais estados o banco aceita. Chaves, unicidade e restrições protegem invariantes mesmo quando outro cliente grava dados.",
      "Um join pode multiplicar linhas; a consulta deve preservar a granularidade esperada.",
    ],
    practice: [
      "Modele livro, pedido e item de pedido.",
      "Adicione restrições e consultas de pedidos com seus itens.",
      "Teste identificador duplicado e referência inexistente.",
    ],
    pitfall:
      "Validar relações apenas na aplicação e deixar o banco aceitar registros órfãos.",
    evidence:
      "Explicar a cardinalidade das consultas e provar que o banco rejeita dados inconsistentes.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::JDBC, consultas parametrizadas e transações": {
    explanation: [
      "JDBC permite enviar comandos e ler resultados de um banco. Parâmetros separam dados de SQL e recursos precisam de fechamento correto.",
      "Uma transação agrupa alterações que devem confirmar juntas; rollback precisa ser testado, não apenas declarado.",
    ],
    practice: [
      "Implemente um repositório JDBC para o catálogo.",
      "Use parâmetros em busca e atualização.",
      "Crie um pedido e simule falha após inserir o cabeçalho para validar rollback.",
    ],
    pitfall:
      "Concatenar entrada em SQL ou deixar uma transação parcial confirmada.",
    evidence:
      "Provar que uma falha no item não deixa um pedido incompleto persistido.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Índices, concorrência e custo de consulta": {
    explanation: [
      "Um índice acelera alguns acessos e cobra custo em escrita e espaço. Concorrência muda o raciocínio: duas requisições podem observar o mesmo estoque antes de atualizar.",
      "Uma solução deve proteger a regra sob disputa, não apenas no fluxo sequencial.",
    ],
    practice: [
      "Analise uma consulta com EXPLAIN.",
      "Compare um índice adequado com o plano anterior.",
      "Simule duas reservas concorrentes e registre a estratégia que mantém o estoque correto.",
    ],
    pitfall:
      "Supor que ler e depois atualizar sem proteção equivale a uma operação atômica.",
    evidence:
      "Reproduzir a disputa e demonstrar que o estoque não fica negativo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::HTTP: métodos, status e contratos": {
    explanation: [
      "HTTP diferencia recurso, representação, método e código de resposta. O cliente precisa distinguir falha de entrada, ausência de recurso e erro interno.",
      "Defina o contrato antes de escolher anotações de um framework.",
    ],
    practice: [
      "Escreva exemplos de GET, POST e DELETE para livros.",
      "Defina respostas de sucesso e falha em JSON.",
      "Teste a diferença entre uma URL inexistente e um identificador ausente.",
    ],
    pitfall:
      "Devolver 200 para qualquer situação e obrigar o cliente a adivinhar o resultado.",
    evidence:
      "Documentar e demonstrar códigos e corpos de resposta para os principais caminhos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Servlets, filtros e ciclo de requisição": {
    explanation: [
      "O container recebe conexões e chama componentes que tratam a requisição. Uma instância pode atender múltiplas requisições; campos mutáveis compartilhados exigem cuidado.",
      "Filtros tratam preocupações de fronteira, não devem substituir regras de domínio.",
    ],
    practice: [
      "Crie um exemplo pequeno de Servlet em laboratório.",
      "Adicione um filtro que mede tempo sem registrar dados pessoais.",
      "Envie requisições simultâneas e observe um contador compartilhado.",
    ],
    pitfall:
      "Guardar dados de uma requisição em um campo do Servlet e misturar usuários.",
    evidence:
      "Explicar o ciclo de uma requisição e remover estado compartilhado incorreto.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::JSP e separação de apresentação": {
    explanation: [
      "JSP representa uma etapa do ecossistema Java web e ajuda a entender a separação entre modelo e apresentação. Regras de estoque continuam no domínio.",
      "Ao renderizar entrada, o contexto de saída importa para evitar execução de conteúdo externo.",
    ],
    practice: [
      "Monte uma página simples de listagem de livros no laboratório.",
      "Separe preparação de dados da renderização.",
      "Mostre um título com caracteres especiais sem interpretá-lo como marcação executável.",
    ],
    pitfall: "Escrever consultas e regras de negócio dentro da página.",
    evidence:
      "Demonstrar separação de responsabilidades e renderização segura de texto.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Entidades, estados e mapeamentos": {
    explanation: [
      "ORM conecta modelos orientados a objetos a tabelas, mas não elimina SQL, transações ou desenho relacional. Uma entidade tem ciclo de vida e identidade.",
      "Conhecer os estados de uma entidade ajuda a explicar quando uma alteração será gravada.",
    ],
    practice: [
      "Mapeie Livro e Categoria em um projeto de laboratório.",
      "Observe SQL de inserção e atualização.",
      "Compare uma entidade gerenciada e um objeto fora do contexto de persistência.",
    ],
    pitfall:
      "Tratar toda instância Java como se estivesse automaticamente sincronizada com o banco.",
    evidence:
      "Explicar o SQL produzido e o momento em que a alteração se torna persistente.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Relacionamentos, N+1 e limites de carregamento": {
    explanation: [
      "Carregamento preguiçoso e antecipado têm custos diferentes. N+1 aparece quando a listagem dispara consultas adicionais por elemento.",
      "A resposta HTTP não deve expor acidentalmente todo o grafo de entidades.",
    ],
    practice: [
      "Liste pedidos com itens e conte consultas.",
      "Reproduza N+1 e corrija a consulta com uma estratégia justificada.",
      "Crie DTOs para a resposta, sem depender da sessão aberta na serialização.",
    ],
    pitfall:
      "Resolver toda consulta com EAGER ou devolver entidades diretamente sem observar o grafo.",
    evidence:
      "Medir o número de consultas e manter o contrato da API sem consultas inesperadas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Migrações, locking e evolução de schema": {
    explanation: [
      "O esquema evolui junto da aplicação. Uma migração deve ser revisável e considerar compatibilidade e recuperação.",
      "Controle otimista detecta conflitos; a aplicação precisa tratar e comunicar a disputa.",
    ],
    practice: [
      "Adicione versão à entidade que controla estoque.",
      "Simule duas atualizações concorrentes.",
      "Escreva uma migração que adicione um campo sem apagar registros existentes.",
    ],
    pitfall:
      "Usar geração automática destrutiva de schema como estratégia de produção.",
    evidence:
      "Demonstrar conflito controlado e uma migração que preserva dados.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::IoC, beans e injeção por construtor": {
    explanation: [
      "O container cria e conecta objetos segundo a configuração. Injeção por construtor explicita dependências e permite testar a regra sem inicializar toda a aplicação.",
      "Anotações são uma forma de declarar configuração; o efeito precisa ser compreendido.",
    ],
    practice: [
      "Transforme o serviço de reservas em um bean.",
      "Injete a interface de repositório pelo construtor.",
      "Execute um teste de regra instanciando o serviço diretamente com um fake.",
    ],
    pitfall:
      "Espalhar acesso estático ao container ou usar injeção como forma de esconder dependências.",
    evidence:
      "Explicar quem cria cada objeto e testar a regra sem contexto Spring.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Configuração, perfis e ciclo de vida": {
    explanation: [
      "Configurações diferentes podem escolher implementações e valores para ambientes distintos. Um perfil não deve transformar segredo real em arquivo versionado.",
      "Validação de configuração reduz falhas tardias e comportamentos silenciosos.",
    ],
    practice: [
      "Separe configuração local e de teste.",
      "Faça a aplicação recusar uma propriedade obrigatória ausente.",
      "Registre inicialização e encerramento de um recurso de laboratório.",
    ],
    pitfall:
      "Ativar perfis que mudam regras de negócio ou usar valores pessoais em application.yml público.",
    evidence:
      "Mostrar qual configuração está ativa e uma falha de inicialização legível e sem segredos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Proxy, transações e fronteiras do serviço": {
    explanation: [
      "Alguns recursos do Spring são aplicados por proxies. Uma chamada interna no mesmo objeto pode não atravessar o proxy esperado.",
      "A fronteira de transação precisa coincidir com uma operação coerente de negócio, sem manter conexões presas durante chamadas lentas externas.",
    ],
    practice: [
      "Coloque criação de pedido e itens numa operação transacional.",
      "Teste uma falha entre as gravações.",
      "Compare chamada externa ao bean e chamada interna a um método anotado.",
    ],
    pitfall:
      "Supor que uma anotação produz o mesmo efeito em qualquer caminho de chamada.",
    evidence:
      "Explicar a fronteira real e demonstrar rollback por um teste de integração.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Spring Boot e persistência": {
    explanation: [
      "Spring Boot organiza configuração e inicialização; ainda é necessário definir dependências, fronteiras e contratos. Um CRUD precisa de validação e caminhos de falha para ser útil.",
      "Comece com um único serviço e um banco antes de distribuir o sistema.",
    ],
    practice: [
      "Exponha CRUD de livros com controller, serviço e repositório.",
      "Valide entrada e defina códigos HTTP.",
      "Adicione testes de criação, busca e atualização inválida.",
    ],
    pitfall:
      "Amontoar regras no controller ou considerar o endpoint pronto após o primeiro 200.",
    evidence:
      "Demonstrar CRUD, validação e testes em uma execução reproduzível.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::DTOs, validação e tratamento global de erros": {
    explanation: [
      "DTOs representam o contrato da API; entidades representam persistência. Separar esses papéis reduz vazamentos e mudanças acidentais de contrato.",
      "A resposta de erro deve ser consistente e não revelar stack traces ou credenciais.",
    ],
    practice: [
      "Crie DTOs de entrada e saída.",
      "Implemente respostas de erro para validação, ausência e conflito.",
      "Teste o formato dos erros e a ausência de detalhes internos.",
    ],
    pitfall: "Retornar mensagens técnicas do banco diretamente ao cliente.",
    evidence:
      "Cobrir três classes de falha e manter um formato de erro documentado.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Spring Data, paginação e consultas eficientes": {
    explanation: [
      "Repositórios reduzem código repetido, mas o contrato de paginação e as consultas continuam sendo responsabilidade da aplicação.",
      "Limites, ordenação estável e projeções precisam ser definidos para evitar respostas caras ou inconsistentes.",
    ],
    practice: [
      "Implemente busca paginada por título e categoria.",
      "Limite tamanho de página e use ordenação com desempate.",
      "Conte consultas e evite N+1 em uma listagem de pedidos.",
    ],
    pitfall:
      "Aceitar tamanho de página ilimitado ou uma ordenação sem desempate.",
    evidence:
      "Provar limites de entrada e estabilidade da paginação com dados repetidos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Autenticação e autorização": {
    explanation: [
      "Autenticação identifica quem faz a requisição; autorização decide o que essa identidade pode fazer com um recurso. Uma rota protegida ainda pode permitir acesso indevido a um objeto de outro usuário.",
      "Modele o dono do pedido e teste autorização no recurso, não apenas no menu da interface.",
    ],
    practice: [
      "Proteja o endpoint de criação de pedidos.",
      "Adicione verificação de proprietário na consulta de pedido.",
      "Teste visitante, usuário sem permissão, dono e outro usuário.",
    ],
    pitfall:
      "Confiar em um identificador enviado pelo cliente para decidir a identidade do dono.",
    evidence:
      "Demonstrar 401 e 403 nos cenários adequados e impedir acesso cruzado entre usuários.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::JWT, validade e resource server": {
    explanation: [
      "Um token assinado precisa ser validado quanto a assinatura, emissor, audiência e tempo. Decodificar Base64 não comprova autenticidade.",
      "A aplicação deve tratar expiração e nunca registrar o token completo em logs.",
    ],
    practice: [
      "Configure um resource server em um laboratório controlado.",
      "Teste token ausente, alterado, expirado e com audiência incorreta.",
      "Documente como a renovação será tratada pelo cliente autorizado.",
    ],
    pitfall:
      "Implementar validação criptográfica artesanal ou aceitar o payload sem verificar a assinatura.",
    evidence:
      "Provar rejeição das quatro entradas inválidas e não expor tokens nas respostas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::OAuth2, OIDC, sessões e CSRF": {
    explanation: [
      "OAuth2 modela autorização delegada; OIDC acrescenta informações de identidade. Sessões e cookies exigem pensar em origem, expiração e revogação.",
      "O fluxo escolhido deve corresponder ao cliente e ser implementado por bibliotecas adequadas, sem expor client secrets no frontend.",
    ],
    practice: [
      "Desenhe o fluxo entre navegador, aplicação e provedor.",
      "Use um provedor de laboratório ou mocks para testar callback, state e negação de acesso.",
      "Teste uma ação autenticada com origem não permitida.",
    ],
    pitfall:
      "Confundir consentimento OAuth com validação de permissão na sua aplicação.",
    evidence:
      "Explicar state, sessão e autorização local e demonstrar rejeição de callback ou origem inválidos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Logs estruturados, contexto e dados sensíveis": {
    explanation: [
      "Um log útil permite reconstruir uma falha sem despejar o estado completo da aplicação. Correlação liga as mensagens de uma operação entre componentes.",
      "O formato, o nível e os campos devem responder a perguntas operacionais claras.",
    ],
    practice: [
      "Adicione um identificador de correlação à criação de pedido.",
      "Registre sucesso, conflito e falha de dependência com campos definidos.",
      "Verifique que senhas, tokens e dados pessoais não aparecem.",
    ],
    pitfall:
      "Usar um nível de log para tudo ou registrar o corpo inteiro de cada requisição.",
    evidence:
      "Investigar um pedido falho pelos logs sem depender do depurador nem de credenciais expostas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Métricas, Actuator e health checks": {
    explanation: [
      "Métricas resumem comportamento; logs explicam eventos específicos. Readiness e liveness têm finalidades diferentes e não devem expor detalhes internos publicamente.",
      "Um alerta precisa de uma ação: observar uma taxa de erro sem saber como investigar não fecha o ciclo de operação.",
    ],
    practice: [
      "Adicione métricas de latência e falhas de pedidos.",
      "Defina health checks com exposição restrita.",
      "Simule banco indisponível e explique a resposta de cada verificação.",
    ],
    pitfall:
      "Transformar uma dependência temporariamente lenta em reinício contínuo do serviço.",
    evidence:
      "Distinguir saúde, prontidão e desempenho e reproduzir uma falha observável.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Testes de fronteira e diagnóstico": {
    explanation: [
      "A suíte precisa exercitar validação HTTP, autorização, transação e serialização. Uma falha de integração não deve ser atribuída à rede sem evidência.",
      "Testes reproduzíveis têm dados isolados e dependências controladas.",
    ],
    practice: [
      "Crie testes de API para o fluxo de pedido.",
      "Teste conflito de estoque e indisponibilidade do banco em ambiente isolado.",
      "Registre uma falha e mostre o teste que impede sua regressão.",
    ],
    pitfall:
      "Uma suíte passar apenas porque todos os adaptadores foram substituídos por mocks.",
    evidence:
      "Executar o fluxo completo e explicar quais fronteiras reais foram verificadas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::MongoDB e agregados de documentos": {
    explanation: [
      "Um documento modela dados que costumam ser lidos e alterados juntos. A escolha entre documentos e relações depende de acesso, consistência e operação.",
      "Não migre o banco apenas porque a aplicação usa JSON no transporte.",
    ],
    practice: [
      "Modele uma projeção de catálogo como documento.",
      "Compare consulta e atualização com o modelo relacional.",
      "Explique como manter referências e duplicações consistentes.",
    ],
    pitfall:
      "Tratar MongoDB como solução automática para ausência de schema e deixar contratos implícitos.",
    evidence:
      "Justificar o agregado e documentar os custos de duplicação e atualização.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Índices, paginação e consistência da projeção": {
    explanation: [
      "Projeções podem favorecer leitura, mas precisam de uma origem e uma política de atualização. A paginação deve ter uma ordem estável e limites claros.",
      "A aplicação deve distinguir um dado inexistente de uma projeção temporariamente atrasada.",
    ],
    practice: [
      "Crie um índice para uma consulta real do catálogo.",
      "Implemente uma projeção reconstruível a partir dos eventos de laboratório.",
      "Simule atraso e duplicação de atualização.",
    ],
    pitfall:
      "Confundir projeção de leitura com fonte única de verdade sem definir recuperação.",
    evidence:
      "Reconstruir a projeção e demonstrar tratamento de uma atualização duplicada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Threads, virtual threads e sincronização": {
    explanation: [
      "Concorrência exige proteger invariantes quando operações se intercalam. Virtual threads podem facilitar I/O concorrente, mas não tornam estado compartilhado seguro nem aceleram cálculo por si só.",
      "Escolha a estratégia depois de identificar se o limite está em I/O, CPU ou sincronização.",
    ],
    practice: [
      "Reproduza uma condição de corrida no estoque em um laboratório.",
      "Corrija com uma estratégia explícita e compare alternativas.",
      "Teste carga pequena com limites de recursos definidos.",
    ],
    pitfall:
      "Achar que trocar o executor remove condições de corrida ou dispensa limites no banco.",
    evidence:
      "Reproduzir e corrigir a disputa e justificar o limite de concorrência.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::JVM, memória e profiling": {
    explanation: [
      "Alocação, retenção e coleta são fenômenos diferentes. Uma medição de heap ou CPU precisa ser associada a uma carga e uma hipótese.",
      "Observe uma evidência antes de adicionar cache ou alterar estruturas de dados.",
    ],
    practice: [
      "Defina uma carga pequena e reproduzível.",
      "Observe JFR ou outra ferramenta do JDK e identifique uma retenção ou gargalo.",
      "Aplique uma mudança e repita a mesma medição.",
    ],
    pitfall:
      "Otimizar a parte mais visível do código sem comprovar que ela domina o custo.",
    evidence:
      "Apresentar hipótese, medição antes/depois e limites da conclusão.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Cache, limites e degradação controlada": {
    explanation: [
      "Um cache troca custo de consulta por problemas de validade, invalidação e memória. O sistema deve continuar correto quando o cache está vazio ou indisponível.",
      "Limites de tamanho e tempo impedem crescimento descontrolado e trabalho infinito.",
    ],
    practice: [
      "Adicione cache a uma consulta de catálogo com validade definida.",
      "Teste atualização de livro, expiração e falha do cache.",
      "Documente que dados podem ficar temporariamente desatualizados.",
    ],
    pitfall:
      "Usar cache para esconder uma consulta incorreta ou guardar dados privados sem separação adequada.",
    evidence:
      "Demonstrar invalidação, limite de memória e comportamento sem o cache.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Dockerfile, build reproduzível e Compose": {
    explanation: [
      "A imagem deve conter o necessário para executar a aplicação, com configuração externa e sem credenciais. Estágios de build reduzem o conteúdo do artefato final.",
      "Compose ajuda a descrever um laboratório de aplicação e banco; persistência e health checks precisam ser explícitos.",
    ],
    practice: [
      "Crie uma imagem da livraria com build separado da execução.",
      "Defina aplicação e banco em Compose com volume de laboratório.",
      "Suba a aplicação a partir de um ambiente limpo e execute o fluxo de pedido.",
    ],
    pitfall: "Copiar o diretório pessoal ou arquivos .env reais para a imagem.",
    evidence:
      "Construir e executar sem dependências da IDE e demonstrar que a imagem não contém segredos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Linux, sinais, rede e encerramento seguro": {
    explanation: [
      "Um serviço precisa responder a sinais e encerrar trabalho sem abandonar alterações incoerentes. Logs, portas e nomes de host permitem separar falhas de processo e rede.",
      "Experimente apenas em um laboratório; o sistema principal não é um alvo de teste.",
    ],
    practice: [
      "Observe PID, porta e logs da aplicação em ambiente isolado.",
      "Envie um sinal de encerramento e acompanhe uma requisição em andamento.",
      "Reproduza um endereço de banco errado e uma porta indisponível.",
    ],
    pitfall:
      "Reiniciar serviços ao acaso sem distinguir falha de DNS, conexão e resposta HTTP.",
    evidence:
      "Diagnosticar as duas falhas e demonstrar encerramento controlado.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Deploy, rollback e orçamento operacional": {
    explanation: [
      "Uma entrega precisa de configuração, critérios de saúde e procedimento de volta. Disponibilidade e custo dependem da arquitetura e da operação, não apenas do comando de deploy.",
      "O estudo pode ser concluído com um ambiente local; contratar nuvem não é um requisito.",
    ],
    practice: [
      "Prepare um plano de entrega com configuração por ambiente.",
      "Simule uma versão defeituosa e execute rollback local.",
      "Documente backup, recuperação e uma estimativa de custo sem contratar recursos.",
    ],
    pitfall: "Chamar de pronto um deploy que não tem caminho de recuperação.",
    evidence:
      "Executar um rollback verificável e explicar como detectar uma entrega com falha.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Limites de serviço e contratos": {
    explanation: [
      "Separar processos introduz falhas de rede, latência e consistência entre dados. A divisão deve acompanhar responsabilidades e propriedade dos dados.",
      "Um monólito modular é uma referência útil para comparar o custo real de distribuir a aplicação.",
    ],
    practice: [
      "Extraia catálogo e pedidos como serviços de laboratório.",
      "Documente seus contratos e donos dos dados.",
      "Compare o fluxo local com o fluxo de dois processos e descreva as novas falhas.",
    ],
    pitfall:
      "Criar serviços por tabela e manter um banco compartilhado como acoplamento oculto.",
    evidence:
      "Justificar o limite e demonstrar o comportamento quando o catálogo está indisponível.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Descoberta, gateway e configuração": {
    explanation: [
      "Descoberta liga nomes lógicos a instâncias; o gateway oferece uma fronteira de entrada. Configuração centralizada organiza valores, mas exige considerar indisponibilidade e segredos.",
      "Essas peças têm responsabilidades distintas e não substituem autorização no serviço.",
    ],
    practice: [
      "Registre duas instâncias de catálogo em um laboratório.",
      "Roteie uma chamada pelo gateway e observe qual instância respondeu.",
      "Troque uma configuração pública e registre quando ela passa a valer.",
    ],
    pitfall:
      "Tratar o gateway como única fronteira de segurança ou misturar segredo com configuração pública.",
    evidence:
      "Explicar o caminho da chamada e localizar falhas em descoberta, rota e serviço separadamente.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Resiliência, idempotência e consistência": {
    explanation: [
      "Timeout limita espera; retry repete uma tentativa; circuit breaker interrompe chamadas a uma dependência instável. Combinar esses mecanismos sem limite pode amplificar a falha.",
      "Uma operação repetida só é segura se seu efeito de negócio estiver protegido contra duplicação.",
    ],
    practice: [
      "Defina um orçamento de timeout para criar pedido.",
      "Simule resposta lenta e repetição da requisição.",
      "Adicione uma chave de idempotência e prove que apenas um pedido foi criado.",
    ],
    pitfall:
      "Repetir indiscriminadamente uma operação de escrita ou multiplicar retries em várias camadas.",
    evidence:
      "Medir o tempo máximo e provar ausência de duplicação sob repetição.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Tópicos, partições, chaves e consumidores": {
    explanation: [
      "A ordem é definida dentro de uma partição, não globalmente em qualquer configuração. A escolha da chave determina que eventos serão relacionados nessa ordem.",
      "Um grupo de consumidores distribui partições, e o reequilíbrio faz parte da operação normal.",
    ],
    practice: [
      "Publique eventos de pedido com uma chave definida.",
      "Observe partições e consumidores em um laboratório.",
      "Explique quais eventos mantêm ordem e o que muda ao adicionar um consumidor.",
    ],
    pitfall:
      "Assumir que aumentar consumidores sempre aumenta paralelismo ou preserva qualquer ordem desejada.",
    evidence: "Demonstrar a relação entre chave, partição e paralelismo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Retries, duplicação, DLQ e outbox": {
    explanation: [
      "Mensagens podem ser entregues novamente. Uma escrita no banco e uma publicação no broker não são uma única transação por serem chamadas no mesmo método.",
      "Outbox registra o evento junto da alteração de negócio e permite uma publicação posterior verificável.",
    ],
    practice: [
      "Registre um evento de pedido em outbox na mesma transação.",
      "Simule falha do broker e retome a publicação.",
      "Reentregue a mensagem e teste um consumidor idempotente.",
    ],
    pitfall:
      "Prometer exactly-once para todo o sistema sem delimitar a garantia real.",
    evidence:
      "Provar que a falha do broker não perde o evento e que a reentrega não duplica o efeito.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Pipeline: teste, build, imagem e promoção": {
    explanation: [
      "Uma pipeline liga evidências à versão entregue. As credenciais do ambiente pertencem à plataforma de execução e a promoção deve usar o artefato já validado.",
      "Evite reconstruir uma versão diferente depois de testar.",
    ],
    practice: [
      "Descreva etapas de teste, build e imagem para a livraria.",
      "Simule uma falha de teste e interrompa a promoção.",
      "Registre o identificador do artefato que será entregue.",
    ],
    pitfall:
      "Usar um resultado verde de um commit para promover outro artefato.",
    evidence:
      "Demonstrar interrupção na falha e rastrear a entrega até o commit e o artefato corretos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Ansible: estado desejado e idempotência": {
    explanation: [
      "Automação de configuração deve produzir o estado pretendido e poder ser executada de novo com efeito controlado. Diferenças e falhas precisam ser observáveis.",
      "O laboratório não deve alterar o computador principal ou credenciais reais.",
    ],
    practice: [
      "Escreva um playbook de exemplo para um ambiente descartável.",
      "Execute ou revise uma primeira e uma segunda aplicação.",
      "Explique quais mudanças ocorreriam e como recuperar uma falha.",
    ],
    pitfall:
      "Usar comandos imperativos sem verificar estado e chamar isso de idempotência.",
    evidence:
      "Explicar o resultado da segunda aplicação e um procedimento de recuperação.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Terraform: plano, estado e responsabilidade": {
    explanation: [
      "Infraestrutura declarativa descreve recursos e dependências. O estado é sensível e o plano deve ser revisado antes de aplicar alterações.",
      "Aprender o fluxo não exige criar recursos pagos; exemplos e validação local são suficientes para a etapa.",
    ],
    practice: [
      "Modele uma arquitetura de exemplo em arquivos de laboratório.",
      "Revise um plano fictício com criação, alteração e remoção.",
      "Defina proteção de estado e procedimento de mudança sem contratar recursos.",
    ],
    pitfall:
      "Versionar um estado com dados sensíveis ou aplicar uma remoção sem revisar o plano.",
    evidence:
      "Explicar estado, plano e risco de cada tipo de alteração proposta.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Modelo, prompt, resposta e teste de contrato": {
    explanation: [
      "Uma integração de modelo é uma dependência externa com latência, limites e saída que precisa de validação. O resultado gerado não deve ganhar permissão para executar operações arbitrárias.",
      "Separe o adaptador do restante da aplicação para testar sem consumir uma API paga.",
    ],
    practice: [
      "Defina um contrato para sugerir uma descrição curta de um livro.",
      "Implemente um fake que retorna sucesso, formato inválido e timeout.",
      "Valide o formato e mantenha a operação principal disponível quando a sugestão falhar.",
    ],
    pitfall:
      "Enviar dados privados desnecessários ou interpretar uma resposta livre como uma instrução confiável.",
    evidence:
      "Demonstrar o comportamento sob três respostas simuladas sem contratar um serviço.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Contexto, busca e limites de uma resposta": {
    explanation: [
      "Fornecer documentos relevantes melhora o contexto disponível, mas não garante uma resposta correta. Citações e limites do conhecimento precisam ser verificáveis.",
      "Esta etapa é opcional e pode usar dados fictícios e respostas simuladas; não exige instalar modelos pesados.",
    ],
    practice: [
      "Monte um pequeno conjunto de descrições fictícias de livros.",
      "Selecione o contexto e teste uma pergunta com e sem resposta no conjunto.",
      "Defina quando o adaptador deve informar ausência de base suficiente.",
    ],
    pitfall:
      "Apresentar uma resposta inventada como se tivesse sido sustentada por um documento.",
    evidence:
      "Rastrear a resposta até o contexto e demonstrar recusa quando não há base adequada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Projeto final Java": {
    explanation: [
      "A entrega reúne contratos, domínio, persistência, testes, segurança e operação. A documentação deve permitir que outra pessoa execute e avalie as decisões.",
      "Uma conclusão honesta inclui limites conhecidos e evidência do que foi verificado.",
    ],
    practice: [
      "Entregue a livraria com catálogo, pedidos e estoque.",
      "Inclua autenticação, testes de integração, logs, imagem e instruções de execução.",
      "Demonstre conflito de estoque, falha de dependência e rollback de uma versão.",
    ],
    pitfall:
      "Considerar concluído apenas porque a demonstração feliz funciona na máquina do autor.",
    evidence:
      "Executar em ambiente limpo, passar os testes e explicar as decisões e limites em uma revisão.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Revisão espaçada e defesa de decisões": {
    explanation: [
      "Revisar exige recuperar uma ideia sem copiar o material e explicar um caso de falha. A memória do caminho feliz não comprova domínio da decisão.",
      "Use o projeto como evidência: altere um requisito e observe que fronteiras precisam mudar.",
    ],
    practice: [
      "Sem consultar o guia, desenhe o fluxo de criação de pedido.",
      "Explique autorização, transação e entrega do evento.",
      "Mude um requisito pequeno, adapte o teste e registre o motivo da decisão.",
    ],
    pitfall:
      "Confundir assistir novamente ao vídeo com conseguir aplicar a ideia em um cenário diferente.",
    evidence:
      "Explicar o fluxo completo e adaptar uma regra com teste sem depender de um tutorial passo a passo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::IoC, beans e injeção por construtor": {
    explanation: [
      "O container cria e conecta objetos segundo a configuração. Injeção por construtor explicita dependências e permite testar a regra sem inicializar toda a aplicação.",
      "Anotações são uma forma de declarar configuração; o efeito precisa ser compreendido.",
    ],
    practice: [
      "Transforme o serviço de reservas em um bean.",
      "Injete a interface de repositório pelo construtor.",
      "Execute um teste de regra instanciando o serviço diretamente com um fake.",
    ],
    pitfall:
      "Espalhar acesso estático ao container ou usar injeção como forma de esconder dependências.",
    evidence:
      "Explicar quem cria cada objeto e testar a regra sem contexto Spring.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Configuração, perfis e ciclo de vida": {
    explanation: [
      "Configurações diferentes podem escolher implementações e valores para ambientes distintos. Um perfil não deve transformar segredo real em arquivo versionado.",
      "Validação de configuração reduz falhas tardias e comportamentos silenciosos.",
    ],
    practice: [
      "Separe configuração local e de teste.",
      "Faça a aplicação recusar uma propriedade obrigatória ausente.",
      "Registre inicialização e encerramento de um recurso de laboratório.",
    ],
    pitfall:
      "Ativar perfis que mudam regras de negócio ou usar valores pessoais em application.yml público.",
    evidence:
      "Mostrar qual configuração está ativa e uma falha de inicialização legível e sem segredos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Proxy, transações e fronteiras do serviço": {
    explanation: [
      "Alguns recursos do Spring são aplicados por proxies. Uma chamada interna no mesmo objeto pode não atravessar o proxy esperado.",
      "A fronteira de transação precisa coincidir com uma operação coerente de negócio, sem manter conexões presas durante chamadas lentas externas.",
    ],
    practice: [
      "Coloque criação de pedido e itens numa operação transacional.",
      "Teste uma falha entre as gravações.",
      "Compare chamada externa ao bean e chamada interna a um método anotado.",
    ],
    pitfall:
      "Supor que uma anotação produz o mesmo efeito em qualquer caminho de chamada.",
    evidence:
      "Explicar a fronteira real e demonstrar rollback por um teste de integração.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Modelo relacional, joins e restrições": {
    explanation: [
      "A modelagem define quais estados o banco aceita. Chaves, unicidade e restrições protegem invariantes mesmo quando outro cliente grava dados.",
      "Um join pode multiplicar linhas; a consulta deve preservar a granularidade esperada.",
    ],
    practice: [
      "Modele livro, pedido e item de pedido.",
      "Adicione restrições e consultas de pedidos com seus itens.",
      "Teste identificador duplicado e referência inexistente.",
    ],
    pitfall:
      "Validar relações apenas na aplicação e deixar o banco aceitar registros órfãos.",
    evidence:
      "Explicar a cardinalidade das consultas e provar que o banco rejeita dados inconsistentes.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::JDBC, consultas parametrizadas e transações": {
    explanation: [
      "JDBC permite enviar comandos e ler resultados de um banco. Parâmetros separam dados de SQL e recursos precisam de fechamento correto.",
      "Uma transação agrupa alterações que devem confirmar juntas; rollback precisa ser testado, não apenas declarado.",
    ],
    practice: [
      "Implemente um repositório JDBC para o catálogo.",
      "Use parâmetros em busca e atualização.",
      "Crie um pedido e simule falha após inserir o cabeçalho para validar rollback.",
    ],
    pitfall:
      "Concatenar entrada em SQL ou deixar uma transação parcial confirmada.",
    evidence:
      "Provar que uma falha no item não deixa um pedido incompleto persistido.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Índices, concorrência e custo de consulta": {
    explanation: [
      "Um índice acelera alguns acessos e cobra custo em escrita e espaço. Concorrência muda o raciocínio: duas requisições podem observar o mesmo estoque antes de atualizar.",
      "Uma solução deve proteger a regra sob disputa, não apenas no fluxo sequencial.",
    ],
    practice: [
      "Analise uma consulta com EXPLAIN.",
      "Compare um índice adequado com o plano anterior.",
      "Simule duas reservas concorrentes e registre a estratégia que mantém o estoque correto.",
    ],
    pitfall:
      "Supor que ler e depois atualizar sem proteção equivale a uma operação atômica.",
    evidence:
      "Reproduzir a disputa e demonstrar que o estoque não fica negativo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Entidades, estados e mapeamentos": {
    explanation: [
      "ORM conecta modelos orientados a objetos a tabelas, mas não elimina SQL, transações ou desenho relacional. Uma entidade tem ciclo de vida e identidade.",
      "Conhecer os estados de uma entidade ajuda a explicar quando uma alteração será gravada.",
    ],
    practice: [
      "Mapeie Livro e Categoria em um projeto de laboratório.",
      "Observe SQL de inserção e atualização.",
      "Compare uma entidade gerenciada e um objeto fora do contexto de persistência.",
    ],
    pitfall:
      "Tratar toda instância Java como se estivesse automaticamente sincronizada com o banco.",
    evidence:
      "Explicar o SQL produzido e o momento em que a alteração se torna persistente.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Relacionamentos, N+1 e limites de carregamento": {
    explanation: [
      "Carregamento preguiçoso e antecipado têm custos diferentes. N+1 aparece quando a listagem dispara consultas adicionais por elemento.",
      "A resposta HTTP não deve expor acidentalmente todo o grafo de entidades.",
    ],
    practice: [
      "Liste pedidos com itens e conte consultas.",
      "Reproduza N+1 e corrija a consulta com uma estratégia justificada.",
      "Crie DTOs para a resposta, sem depender da sessão aberta na serialização.",
    ],
    pitfall:
      "Resolver toda consulta com EAGER ou devolver entidades diretamente sem observar o grafo.",
    evidence:
      "Medir o número de consultas e manter o contrato da API sem consultas inesperadas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Migrações, locking e evolução de schema": {
    explanation: [
      "O esquema evolui junto da aplicação. Uma migração deve ser revisável e considerar compatibilidade e recuperação.",
      "Controle otimista detecta conflitos; a aplicação precisa tratar e comunicar a disputa.",
    ],
    practice: [
      "Adicione versão à entidade que controla estoque.",
      "Simule duas atualizações concorrentes.",
      "Escreva uma migração que adicione um campo sem apagar registros existentes.",
    ],
    pitfall:
      "Usar geração automática destrutiva de schema como estratégia de produção.",
    evidence:
      "Demonstrar conflito controlado e uma migração que preserva dados.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Spring Boot e persistência": {
    explanation: [
      "Spring Boot organiza configuração e inicialização; ainda é necessário definir dependências, fronteiras e contratos. Um CRUD precisa de validação e caminhos de falha para ser útil.",
      "Comece com um único serviço e um banco antes de distribuir o sistema.",
    ],
    practice: [
      "Exponha CRUD de livros com controller, serviço e repositório.",
      "Valide entrada e defina códigos HTTP.",
      "Adicione testes de criação, busca e atualização inválida.",
    ],
    pitfall:
      "Amontoar regras no controller ou considerar o endpoint pronto após o primeiro 200.",
    evidence:
      "Demonstrar CRUD, validação e testes em uma execução reproduzível.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::DTOs, validação e tratamento global de erros": {
    explanation: [
      "DTOs representam o contrato da API; entidades representam persistência. Separar esses papéis reduz vazamentos e mudanças acidentais de contrato.",
      "A resposta de erro deve ser consistente e não revelar stack traces ou credenciais.",
    ],
    practice: [
      "Crie DTOs de entrada e saída.",
      "Implemente respostas de erro para validação, ausência e conflito.",
      "Teste o formato dos erros e a ausência de detalhes internos.",
    ],
    pitfall: "Retornar mensagens técnicas do banco diretamente ao cliente.",
    evidence:
      "Cobrir três classes de falha e manter um formato de erro documentado.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Spring Data, paginação e consultas eficientes": {
    explanation: [
      "Repositórios reduzem código repetido, mas o contrato de paginação e as consultas continuam sendo responsabilidade da aplicação.",
      "Limites, ordenação estável e projeções precisam ser definidos para evitar respostas caras ou inconsistentes.",
    ],
    practice: [
      "Implemente busca paginada por título e categoria.",
      "Limite tamanho de página e use ordenação com desempate.",
      "Conte consultas e evite N+1 em uma listagem de pedidos.",
    ],
    pitfall:
      "Aceitar tamanho de página ilimitado ou uma ordenação sem desempate.",
    evidence:
      "Provar limites de entrada e estabilidade da paginação com dados repetidos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Autenticação e autorização": {
    explanation: [
      "Autenticação identifica quem faz a requisição; autorização decide o que essa identidade pode fazer com um recurso. Uma rota protegida ainda pode permitir acesso indevido a um objeto de outro usuário.",
      "Modele o dono do pedido e teste autorização no recurso, não apenas no menu da interface.",
    ],
    practice: [
      "Proteja o endpoint de criação de pedidos.",
      "Adicione verificação de proprietário na consulta de pedido.",
      "Teste visitante, usuário sem permissão, dono e outro usuário.",
    ],
    pitfall:
      "Confiar em um identificador enviado pelo cliente para decidir a identidade do dono.",
    evidence:
      "Demonstrar 401 e 403 nos cenários adequados e impedir acesso cruzado entre usuários.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::JWT, validade e resource server": {
    explanation: [
      "Um token assinado precisa ser validado quanto a assinatura, emissor, audiência e tempo. Decodificar Base64 não comprova autenticidade.",
      "A aplicação deve tratar expiração e nunca registrar o token completo em logs.",
    ],
    practice: [
      "Configure um resource server em um laboratório controlado.",
      "Teste token ausente, alterado, expirado e com audiência incorreta.",
      "Documente como a renovação será tratada pelo cliente autorizado.",
    ],
    pitfall:
      "Implementar validação criptográfica artesanal ou aceitar o payload sem verificar a assinatura.",
    evidence:
      "Provar rejeição das quatro entradas inválidas e não expor tokens nas respostas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::OAuth2, OIDC, sessões e CSRF": {
    explanation: [
      "OAuth2 modela autorização delegada; OIDC acrescenta informações de identidade. Sessões e cookies exigem pensar em origem, expiração e revogação.",
      "O fluxo escolhido deve corresponder ao cliente e ser implementado por bibliotecas adequadas, sem expor client secrets no frontend.",
    ],
    practice: [
      "Desenhe o fluxo entre navegador, aplicação e provedor.",
      "Use um provedor de laboratório ou mocks para testar callback, state e negação de acesso.",
      "Teste uma ação autenticada com origem não permitida.",
    ],
    pitfall:
      "Confundir consentimento OAuth com validação de permissão na sua aplicação.",
    evidence:
      "Explicar state, sessão e autorização local e demonstrar rejeição de callback ou origem inválidos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Logs estruturados, contexto e dados sensíveis": {
    explanation: [
      "Um log útil permite reconstruir uma falha sem despejar o estado completo da aplicação. Correlação liga as mensagens de uma operação entre componentes.",
      "O formato, o nível e os campos devem responder a perguntas operacionais claras.",
    ],
    practice: [
      "Adicione um identificador de correlação à criação de pedido.",
      "Registre sucesso, conflito e falha de dependência com campos definidos.",
      "Verifique que senhas, tokens e dados pessoais não aparecem.",
    ],
    pitfall:
      "Usar um nível de log para tudo ou registrar o corpo inteiro de cada requisição.",
    evidence:
      "Investigar um pedido falho pelos logs sem depender do depurador nem de credenciais expostas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Métricas, Actuator e health checks": {
    explanation: [
      "Métricas resumem comportamento; logs explicam eventos específicos. Readiness e liveness têm finalidades diferentes e não devem expor detalhes internos publicamente.",
      "Um alerta precisa de uma ação: observar uma taxa de erro sem saber como investigar não fecha o ciclo de operação.",
    ],
    practice: [
      "Adicione métricas de latência e falhas de pedidos.",
      "Defina health checks com exposição restrita.",
      "Simule banco indisponível e explique a resposta de cada verificação.",
    ],
    pitfall:
      "Transformar uma dependência temporariamente lenta em reinício contínuo do serviço.",
    evidence:
      "Distinguir saúde, prontidão e desempenho e reproduzir uma falha observável.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Testes de fronteira e diagnóstico": {
    explanation: [
      "A suíte precisa exercitar validação HTTP, autorização, transação e serialização. Uma falha de integração não deve ser atribuída à rede sem evidência.",
      "Testes reproduzíveis têm dados isolados e dependências controladas.",
    ],
    practice: [
      "Crie testes de API para o fluxo de pedido.",
      "Teste conflito de estoque e indisponibilidade do banco em ambiente isolado.",
      "Registre uma falha e mostre o teste que impede sua regressão.",
    ],
    pitfall:
      "Uma suíte passar apenas porque todos os adaptadores foram substituídos por mocks.",
    evidence:
      "Executar o fluxo completo e explicar quais fronteiras reais foram verificadas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::MongoDB e agregados de documentos": {
    explanation: [
      "Um documento modela dados que costumam ser lidos e alterados juntos. A escolha entre documentos e relações depende de acesso, consistência e operação.",
      "Não migre o banco apenas porque a aplicação usa JSON no transporte.",
    ],
    practice: [
      "Modele uma projeção de catálogo como documento.",
      "Compare consulta e atualização com o modelo relacional.",
      "Explique como manter referências e duplicações consistentes.",
    ],
    pitfall:
      "Tratar MongoDB como solução automática para ausência de schema e deixar contratos implícitos.",
    evidence:
      "Justificar o agregado e documentar os custos de duplicação e atualização.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Índices, paginação e consistência da projeção": {
    explanation: [
      "Projeções podem favorecer leitura, mas precisam de uma origem e uma política de atualização. A paginação deve ter uma ordem estável e limites claros.",
      "A aplicação deve distinguir um dado inexistente de uma projeção temporariamente atrasada.",
    ],
    practice: [
      "Crie um índice para uma consulta real do catálogo.",
      "Implemente uma projeção reconstruível a partir dos eventos de laboratório.",
      "Simule atraso e duplicação de atualização.",
    ],
    pitfall:
      "Confundir projeção de leitura com fonte única de verdade sem definir recuperação.",
    evidence:
      "Reconstruir a projeção e demonstrar tratamento de uma atualização duplicada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Dockerfile, build reproduzível e Compose": {
    explanation: [
      "A imagem deve conter o necessário para executar a aplicação, com configuração externa e sem credenciais. Estágios de build reduzem o conteúdo do artefato final.",
      "Compose ajuda a descrever um laboratório de aplicação e banco; persistência e health checks precisam ser explícitos.",
    ],
    practice: [
      "Crie uma imagem da livraria com build separado da execução.",
      "Defina aplicação e banco em Compose com volume de laboratório.",
      "Suba a aplicação a partir de um ambiente limpo e execute o fluxo de pedido.",
    ],
    pitfall: "Copiar o diretório pessoal ou arquivos .env reais para a imagem.",
    evidence:
      "Construir e executar sem dependências da IDE e demonstrar que a imagem não contém segredos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Linux, sinais, rede e encerramento seguro": {
    explanation: [
      "Um serviço precisa responder a sinais e encerrar trabalho sem abandonar alterações incoerentes. Logs, portas e nomes de host permitem separar falhas de processo e rede.",
      "Experimente apenas em um laboratório; o sistema principal não é um alvo de teste.",
    ],
    practice: [
      "Observe PID, porta e logs da aplicação em ambiente isolado.",
      "Envie um sinal de encerramento e acompanhe uma requisição em andamento.",
      "Reproduza um endereço de banco errado e uma porta indisponível.",
    ],
    pitfall:
      "Reiniciar serviços ao acaso sem distinguir falha de DNS, conexão e resposta HTTP.",
    evidence:
      "Diagnosticar as duas falhas e demonstrar encerramento controlado.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Deploy, rollback e orçamento operacional": {
    explanation: [
      "Uma entrega precisa de configuração, critérios de saúde e procedimento de volta. Disponibilidade e custo dependem da arquitetura e da operação, não apenas do comando de deploy.",
      "O estudo pode ser concluído com um ambiente local; contratar nuvem não é um requisito.",
    ],
    practice: [
      "Prepare um plano de entrega com configuração por ambiente.",
      "Simule uma versão defeituosa e execute rollback local.",
      "Documente backup, recuperação e uma estimativa de custo sem contratar recursos.",
    ],
    pitfall: "Chamar de pronto um deploy que não tem caminho de recuperação.",
    evidence:
      "Executar um rollback verificável e explicar como detectar uma entrega com falha.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Limites de serviço e contratos": {
    explanation: [
      "Separar processos introduz falhas de rede, latência e consistência entre dados. A divisão deve acompanhar responsabilidades e propriedade dos dados.",
      "Um monólito modular é uma referência útil para comparar o custo real de distribuir a aplicação.",
    ],
    practice: [
      "Extraia catálogo e pedidos como serviços de laboratório.",
      "Documente seus contratos e donos dos dados.",
      "Compare o fluxo local com o fluxo de dois processos e descreva as novas falhas.",
    ],
    pitfall:
      "Criar serviços por tabela e manter um banco compartilhado como acoplamento oculto.",
    evidence:
      "Justificar o limite e demonstrar o comportamento quando o catálogo está indisponível.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Descoberta, gateway e configuração": {
    explanation: [
      "Descoberta liga nomes lógicos a instâncias; o gateway oferece uma fronteira de entrada. Configuração centralizada organiza valores, mas exige considerar indisponibilidade e segredos.",
      "Essas peças têm responsabilidades distintas e não substituem autorização no serviço.",
    ],
    practice: [
      "Registre duas instâncias de catálogo em um laboratório.",
      "Roteie uma chamada pelo gateway e observe qual instância respondeu.",
      "Troque uma configuração pública e registre quando ela passa a valer.",
    ],
    pitfall:
      "Tratar o gateway como única fronteira de segurança ou misturar segredo com configuração pública.",
    evidence:
      "Explicar o caminho da chamada e localizar falhas em descoberta, rota e serviço separadamente.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Resiliência, idempotência e consistência": {
    explanation: [
      "Timeout limita espera; retry repete uma tentativa; circuit breaker interrompe chamadas a uma dependência instável. Combinar esses mecanismos sem limite pode amplificar a falha.",
      "Uma operação repetida só é segura se seu efeito de negócio estiver protegido contra duplicação.",
    ],
    practice: [
      "Defina um orçamento de timeout para criar pedido.",
      "Simule resposta lenta e repetição da requisição.",
      "Adicione uma chave de idempotência e prove que apenas um pedido foi criado.",
    ],
    pitfall:
      "Repetir indiscriminadamente uma operação de escrita ou multiplicar retries em várias camadas.",
    evidence:
      "Medir o tempo máximo e provar ausência de duplicação sob repetição.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Tópicos, partições, chaves e consumidores": {
    explanation: [
      "A ordem é definida dentro de uma partição, não globalmente em qualquer configuração. A escolha da chave determina que eventos serão relacionados nessa ordem.",
      "Um grupo de consumidores distribui partições, e o reequilíbrio faz parte da operação normal.",
    ],
    practice: [
      "Publique eventos de pedido com uma chave definida.",
      "Observe partições e consumidores em um laboratório.",
      "Explique quais eventos mantêm ordem e o que muda ao adicionar um consumidor.",
    ],
    pitfall:
      "Assumir que aumentar consumidores sempre aumenta paralelismo ou preserva qualquer ordem desejada.",
    evidence: "Demonstrar a relação entre chave, partição e paralelismo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Retries, duplicação, DLQ e outbox": {
    explanation: [
      "Mensagens podem ser entregues novamente. Uma escrita no banco e uma publicação no broker não são uma única transação por serem chamadas no mesmo método.",
      "Outbox registra o evento junto da alteração de negócio e permite uma publicação posterior verificável.",
    ],
    practice: [
      "Registre um evento de pedido em outbox na mesma transação.",
      "Simule falha do broker e retome a publicação.",
      "Reentregue a mensagem e teste um consumidor idempotente.",
    ],
    pitfall:
      "Prometer exactly-once para todo o sistema sem delimitar a garantia real.",
    evidence:
      "Provar que a falha do broker não perde o evento e que a reentrega não duplica o efeito.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Modelo, prompt, resposta e teste de contrato": {
    explanation: [
      "Uma integração de modelo é uma dependência externa com latência, limites e saída que precisa de validação. O resultado gerado não deve ganhar permissão para executar operações arbitrárias.",
      "Separe o adaptador do restante da aplicação para testar sem consumir uma API paga.",
    ],
    practice: [
      "Defina um contrato para sugerir uma descrição curta de um livro.",
      "Implemente um fake que retorna sucesso, formato inválido e timeout.",
      "Valide o formato e mantenha a operação principal disponível quando a sugestão falhar.",
    ],
    pitfall:
      "Enviar dados privados desnecessários ou interpretar uma resposta livre como uma instrução confiável.",
    evidence:
      "Demonstrar o comportamento sob três respostas simuladas sem contratar um serviço.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Contexto, busca e limites de uma resposta": {
    explanation: [
      "Fornecer documentos relevantes melhora o contexto disponível, mas não garante uma resposta correta. Citações e limites do conhecimento precisam ser verificáveis.",
      "Esta etapa é opcional e pode usar dados fictícios e respostas simuladas; não exige instalar modelos pesados.",
    ],
    practice: [
      "Monte um pequeno conjunto de descrições fictícias de livros.",
      "Selecione o contexto e teste uma pergunta com e sem resposta no conjunto.",
      "Defina quando o adaptador deve informar ausência de base suficiente.",
    ],
    pitfall:
      "Apresentar uma resposta inventada como se tivesse sido sustentada por um documento.",
    evidence:
      "Rastrear a resposta até o contexto e demonstrar recusa quando não há base adequada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Projeto final Java": {
    explanation: [
      "A entrega reúne contratos, domínio, persistência, testes, segurança e operação. A documentação deve permitir que outra pessoa execute e avalie as decisões.",
      "Uma conclusão honesta inclui limites conhecidos e evidência do que foi verificado.",
    ],
    practice: [
      "Entregue a livraria com catálogo, pedidos e estoque.",
      "Inclua autenticação, testes de integração, logs, imagem e instruções de execução.",
      "Demonstre conflito de estoque, falha de dependência e rollback de uma versão.",
    ],
    pitfall:
      "Considerar concluído apenas porque a demonstração feliz funciona na máquina do autor.",
    evidence:
      "Executar em ambiente limpo, passar os testes e explicar as decisões e limites em uma revisão.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Boot::Revisão espaçada e defesa de decisões": {
    explanation: [
      "Revisar exige recuperar uma ideia sem copiar o material e explicar um caso de falha. A memória do caminho feliz não comprova domínio da decisão.",
      "Use o projeto como evidência: altere um requisito e observe que fronteiras precisam mudar.",
    ],
    practice: [
      "Sem consultar o guia, desenhe o fluxo de criação de pedido.",
      "Explique autorização, transação e entrega do evento.",
      "Mude um requisito pequeno, adapte o teste e registre o motivo da decisão.",
    ],
    pitfall:
      "Confundir assistir novamente ao vídeo com conseguir aplicar a ideia em um cenário diferente.",
    evidence:
      "Explicar o fluxo completo e adaptar uma regra com teste sem depender de um tutorial passo a passo.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Recursão, busca e ordenação": {
    explanation: [
      "Recursão precisa de um caso base e de uma medida que se aproxime dele. Uma busca binária só é correta quando a coleção satisfaz a ordem esperada.",
      "Escolher um algoritmo exige considerar invariantes e tamanho da entrada, não decorar nomes.",
    ],
    practice: [
      "Implemente busca linear e binária em identificadores ordenados.",
      "Teste coleção vazia, um item, primeiro e último elemento.",
      "Ordene um conjunto pequeno e explique o custo de cada abordagem.",
    ],
    pitfall:
      "Aplicar busca binária a uma sequência não ordenada ou criar recursão que não reduz o problema.",
    evidence:
      "Demonstrar casos de fronteira e justificar a pré-condição da busca binária.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Pilhas, filas e prioridades": {
    explanation: [
      "Uma pilha retira o último elemento inserido; uma fila mantém a ordem de entrada. Uma fila de prioridade usa um critério diferente e precisa de desempate.",
      "A estrutura escolhida deve refletir uma regra observável do domínio.",
    ],
    practice: [
      "Modele uma fila de espera para um livro.",
      "Adicione uma operação de desfazer em um histórico descartável.",
      "Compare ordem de chegada e prioridade com casos de empate.",
    ],
    pitfall:
      "Usar uma fila de prioridade e prometer ordem de chegada entre elementos equivalentes sem definir desempate.",
    evidence:
      "Testar as ordens esperadas e explicar por que cada estrutura atende ao caso de uso.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Árvores, grafos e travessia": {
    explanation: [
      "Uma árvore representa hierarquia; um grafo permite conexões mais gerais. Uma travessia precisa controlar nós visitados quando há ciclos.",
      "A forma dos dados determina como você percorre e atualiza a estrutura.",
    ],
    practice: [
      "Modele categorias de livros em árvore.",
      "Crie recomendações fictícias em um grafo e faça uma busca com controle de visitados.",
      "Introduza um ciclo e prove que o algoritmo termina.",
    ],
    pitfall:
      "Assumir que um grafo não tem ciclos porque o exemplo pequeno parecia uma árvore.",
    evidence:
      "Demonstrar uma travessia correta e explicar seu custo em nós e conexões.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Configurar os serviços": {
    explanation: [
      "Uma release train do Spring Cloud suporta linhas específicas do Spring Boot. O BOM coordena versões de componentes, evitando combinações escolhidas por tentativa.",
      "Antes de adicionar descoberta e gateway, dois processos independentes precisam compilar, iniciar e responder com testes mínimos.",
    ],
    practice: [
      "Consulte a matriz oficial de compatibilidade e registre a combinação escolhida.",
      "Crie catálogo e pedidos com um endpoint e um teste cada.",
      "Execute ambos com portas e configurações distintas e registre os comandos de build.",
    ],
    pitfall:
      "Misturar versões de tutoriais de anos diferentes ou forçar uma biblioteca isolada sem observar o BOM.",
    evidence:
      "Executar os dois serviços e justificar as versões com a matriz oficial.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Limites dos serviços e comunicação HTTP": {
    explanation: [
      "Cada serviço deve ter responsabilidade, contrato e propriedade de dados. Chamar outro processo acrescenta latência, indisponibilidade e respostas que podem não chegar.",
      "Não use o banco de outro serviço como atalho para evitar desenhar o contrato.",
    ],
    practice: [
      "Desenhe a criação de pedido com consulta ao catálogo.",
      "Defina sucesso, ausência, conflito e indisponibilidade no contrato.",
      "Simule catálogo fora do ar e observe a diferença entre erro de rede e erro de negócio.",
    ],
    pitfall:
      "Separar processos, mas manter todos os serviços alterando as mesmas tabelas.",
    evidence:
      "Explicar o dono de cada dado e reproduzir uma falha de rede controlada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Configuração por ambiente": {
    explanation: [
      "O mesmo artefato deve receber valores adequados ao ambiente. Configuração pública, segredo e regra de negócio são categorias distintas.",
      "A aplicação precisa falhar de forma legível quando faltar uma configuração obrigatória.",
    ],
    practice: [
      "Separe portas, nomes e endereços por ambiente de laboratório.",
      "Mantenha exemplos sem credenciais reais.",
      "Teste variável ausente e endereço inválido e documente a mensagem esperada.",
    ],
    pitfall:
      "Versionar segredos ou esconder uma configuração inválida com um fallback perigoso.",
    evidence:
      "Demonstrar configuração válida e falha explícita sem imprimir credenciais.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Service Discovery com Eureka": {
    explanation: [
      "O registry mantém informações sobre instâncias; o cliente consulta esse registro para resolver um nome lógico. Heartbeats e cache tornam a descoberta um processo com atraso, não uma lista instantânea perfeita.",
      "Conhecer esse atraso é necessário para interpretar uma instância que já caiu, mas ainda aparece no cliente.",
    ],
    practice: [
      "Suba um servidor Eureka e registre duas instâncias de catálogo.",
      "Registre identificador, porta e informações de saúde de cada instância.",
      "Derrube uma instância e observe o tempo até os clientes deixarem de usá-la.",
    ],
    pitfall:
      "Supor que aparecer no dashboard prova que a instância está pronta para receber tráfego.",
    evidence:
      "Explicar registro e resolução e medir o efeito de uma instância indisponível.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Balanceamento entre instâncias": {
    explanation: [
      "O balanceador do cliente escolhe um destino a partir das instâncias conhecidas. A política de escolha e os limites de conexão influenciam a distribuição real.",
      "Uma chamada repetida não precisa cair sempre em uma instância diferente para que haja balanceamento correto.",
    ],
    practice: [
      "Identifique a instância que responde a cada requisição.",
      "Faça chamadas por nome lógico com duas instâncias ativas.",
      "Compare distribuição, falha de uma instância e retomada após recuperação.",
    ],
    pitfall:
      "Chamar uma porta fixa e acreditar que o registry está balanceando a requisição.",
    evidence:
      "Comprovar resolução por nome e explicar o destino observado nas chamadas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Falhas de descoberta e alternativas": {
    explanation: [
      "O serviço de descoberta também pode falhar. O comportamento depende de cache, configuração e do ambiente onde o sistema executa.",
      "DNS e descoberta da plataforma podem ser alternativas; adicionar um registry extra exige uma necessidade clara.",
    ],
    practice: [
      "Interrompa o registry em um laboratório e faça novas chamadas.",
      "Compare instâncias previamente conhecidas e uma instância recém-criada.",
      "Escreva uma decisão sobre registry ou descoberta da plataforma para dois cenários.",
    ],
    pitfall:
      "Adicionar componentes de descoberta redundantes sem entender qual nome o cliente realmente resolve.",
    evidence:
      "Descrever o comportamento com registry indisponível e justificar uma alternativa.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Config Server e cliente": {
    explanation: [
      "O servidor de configuração disponibiliza versões de valores para os clientes. A ordem entre configuração local, ambiente e remota influencia o resultado final.",
      "Atualizar um repositório não significa que todo bean do cliente automaticamente adotou o novo valor.",
    ],
    practice: [
      "Use um repositório de laboratório sem dados pessoais como origem.",
      "Configure um cliente e observe a origem de uma propriedade.",
      "Altere a propriedade, teste o mecanismo escolhido de atualização e registre quais valores exigem reinício.",
    ],
    pitfall:
      "Supor que toda propriedade pode ser atualizada em tempo de execução sem consequências.",
    evidence:
      "Rastrear a origem e a atualização de uma propriedade com evidência observável.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Disponibilidade e proteção da configuração": {
    explanation: [
      "Centralizar configuração cria uma dependência que precisa de acesso, recuperação e uma política de inicialização. Segredos exigem proteção além de um repositório privado.",
      "A aplicação deve distinguir indisponibilidade remota de configuração inválida.",
    ],
    practice: [
      "Restrinja acesso ao servidor de configuração no laboratório.",
      "Simule indisponibilidade na inicialização de um cliente.",
      "Documente a estratégia de recuperação e teste a ausência de uma propriedade obrigatória.",
    ],
    pitfall:
      "Tratar configuração centralizada como cofre de segredos por padrão.",
    evidence:
      "Demonstrar acesso negado e comportamento definido quando a configuração remota falha.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Versionamento e mudança compatível": {
    explanation: [
      "Serviços podem usar versões diferentes do mesmo contrato de configuração durante uma entrega. Uma alteração precisa considerar consumidores antigos e novos.",
      "Rastrear uma versão facilita voltar a um estado conhecido.",
    ],
    practice: [
      "Crie duas versões de uma propriedade de negócio fictícia.",
      "Execute clientes com configurações diferentes.",
      "Faça rollback da configuração e verifique o valor efetivamente utilizado.",
    ],
    pitfall:
      "Remover uma propriedade exigida por um cliente antigo durante uma implantação gradual.",
    evidence:
      "Executar mudança e retorno sem deixar um consumidor em estado indefinido.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Rotas e filtros do Gateway": {
    explanation: [
      "Predicados selecionam rotas; filtros alteram ou observam a requisição e a resposta. A ordem de filtros é parte do comportamento.",
      "O gateway oferece uma entrada consistente, mas cada serviço continua responsável por suas regras e permissões.",
    ],
    practice: [
      "Roteie catálogo e pedidos por caminhos distintos.",
      "Propague um identificador de correlação.",
      "Teste rota inexistente, serviço indisponível e uma alteração de cabeçalho.",
    ],
    pitfall:
      "Escrever regras de negócio no filtro ou remover sem intenção um cabeçalho necessário.",
    evidence:
      "Explicar predicados e ordem dos filtros e demonstrar cada resposta de falha.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Validação, CORS e limites da borda": {
    explanation: [
      "CORS controla permissões do navegador entre origens; não autentica o cliente. Limites de tamanho e taxa protegem recursos, mas precisam considerar o ambiente e a identidade usada.",
      "Uma exceção muito ampla pode anular o controle que você queria aplicar.",
    ],
    practice: [
      "Defina origem permitida para um frontend de laboratório.",
      "Teste preflight permitido e origem recusada.",
      "Limite payload e uma taxa de chamadas simuladas com resposta clara.",
    ],
    pitfall:
      "Usar CORS como substituto de autorização ou combinar credenciais com política de origem indiscriminada.",
    evidence:
      "Distinguir CORS, autenticação e limitação de recursos com testes separados.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Timeouts e rastreabilidade das chamadas": {
    explanation: [
      "A chamada completa passa por cliente, gateway e serviço; cada etapa pode impor um limite. Se os limites não forem coordenados, uma camada pode continuar trabalhando depois que o cliente desistiu.",
      "Propagar contexto e observar tempos permite localizar a etapa lenta.",
    ],
    practice: [
      "Defina um orçamento total de tempo para uma consulta.",
      "Simule lentidão no catálogo e meça a resposta no gateway.",
      "Correlacione os logs das duas camadas e verifique cancelamento quando disponível.",
    ],
    pitfall:
      "Configurar timeouts independentes sem observar o limite total percebido pelo usuário.",
    evidence: "Localizar a etapa lenta e explicar o tempo máximo da operação.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Circuit breaker e fallback": {
    explanation: [
      "Um circuit breaker observa falhas e muda de estado para reduzir chamadas a uma dependência instável. Um fallback deve representar um resultado válido ou uma indisponibilidade explícita.",
      "Não transforme uma falha em dado inventado para apresentar sucesso.",
    ],
    practice: [
      "Simule sucessos, erros e respostas lentas do catálogo.",
      "Observe abertura, espera e tentativas de recuperação do circuito.",
      "Implemente fallback que preserve a distinção entre dado conhecido e indisponibilidade.",
    ],
    pitfall:
      "Devolver estoque fictício no fallback ou tratar ausência de livro como falha de infraestrutura.",
    evidence:
      "Explicar os estados e demonstrar uma recuperação sem fabricar dados de negócio.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Retries e idempotência": {
    explanation: [
      "Repetir uma requisição aumenta carga e pode repetir um efeito. Retry precisa de limite, condição de uso e distribuição temporal.",
      "Escritas exigem uma chave de idempotência e tratamento consistente de repetição concorrente.",
    ],
    practice: [
      "Crie o mesmo pedido duas vezes com a mesma chave.",
      "Simule uma resposta perdida depois da gravação.",
      "Adicione limite de tentativas e teste que uma falha permanente não causa repetição infinita.",
    ],
    pitfall:
      "Ativar retries em todas as camadas e multiplicar o número real de chamadas.",
    evidence:
      "Provar um único efeito para a mesma chave e um número máximo de tentativas.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Isolamento, carga e degradação": {
    explanation: [
      "Limitar trabalho concorrente impede que uma dependência lenta consuma todos os recursos. Um orçamento precisa considerar pool de conexões, fila, tempo e capacidade dos serviços.",
      "A capacidade deve ser medida em laboratório antes de escolher números de produção.",
    ],
    practice: [
      "Defina limites pequenos em um laboratório e gere uma carga controlada.",
      "Observe fila, tempo de resposta e recusas.",
      "Interrompa a dependência e demonstre que uma rota independente continua atendendo.",
    ],
    pitfall:
      "Aumentar todos os pools sem medir e transferir a sobrecarga para o banco.",
    evidence:
      "Mostrar isolamento entre rotas e explicar o limite observado sob falha.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Testes de contrato": {
    explanation: [
      "Um contrato verifica expectativas entre consumidor e provedor sem depender apenas de um ambiente ponta a ponta compartilhado. Ele não substitui autorização, regra de negócio ou teste de operação.",
      "Escolha exemplos que representem campos, códigos e erros realmente consumidos.",
    ],
    practice: [
      "Defina o contrato da consulta de livro usada por pedidos.",
      "Valide o provedor e um consumidor contra esses exemplos.",
      "Remova ou altere um campo necessário e mostre o teste falhando.",
    ],
    pitfall:
      "Usar um stub desatualizado e considerar que o contrato está protegido.",
    evidence:
      "Demonstrar detecção de uma alteração incompatível antes da entrega.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Evolução de contrato e compatibilidade": {
    explanation: [
      "Uma entrega gradual pode manter versões diferentes de produtores e consumidores ao mesmo tempo. Adição, remoção e mudança de significado têm riscos diferentes.",
      "Uma migração segura precisa de ordem, observação e critério para remover compatibilidade temporária.",
    ],
    practice: [
      "Desenhe a adição de um campo opcional ao contrato.",
      "Teste consumidor antigo com provedor novo e o cenário inverso relevante.",
      "Registre a ordem de uma mudança incompatível em etapas.",
    ],
    pitfall:
      "Trocar o significado de um campo mantendo o mesmo nome e supor compatibilidade.",
    evidence:
      "Explicar e testar uma sequência de evolução que mantenha consumidores atendidos.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Eventos com Spring Cloud Stream": {
    explanation: [
      "Um evento comunica um fato ocorrido, com schema e identidade. O binder conecta o modelo de aplicação ao broker escolhido, cujas garantias continuam importando.",
      "O domínio não deve confundir receber uma mensagem com concluir o processamento de negócio.",
    ],
    practice: [
      "Publique pedido criado com identificador e versão de schema.",
      "Implemente um consumidor de reserva de estoque.",
      "Observe sucesso, erro de processamento e reentrega num broker de laboratório.",
    ],
    pitfall:
      "Depender de detalhes de um broker sem registrar essa dependência no contrato.",
    evidence:
      "Rastrear um evento do produtor ao efeito e explicar a confirmação do processamento.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Duplicidade e mensagens com erro": {
    explanation: [
      "Consumidores devem suportar reentrega, e uma mensagem inválida precisa de um caminho de investigação. DLQ organiza falhas, mas não as resolve sozinha.",
      "A recuperação precisa evitar que um reprocessamento duplique o efeito de negócio.",
    ],
    practice: [
      "Reentregue uma mensagem já processada.",
      "Envie uma mensagem com schema inválido e observe o destino de erro.",
      "Corrija a causa em laboratório e reprocese com proteção de idempotência.",
    ],
    pitfall:
      "Mover tudo para DLQ sem identificar a causa nem definir recuperação.",
    evidence:
      "Demonstrar reentrega sem duplicação e um procedimento de recuperação verificável.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Outbox, saga e compensação": {
    explanation: [
      "Uma alteração local e uma publicação externa podem falhar em momentos diferentes. Outbox e processos com compensação tratam partes desse problema com garantias específicas.",
      "Uma compensação é outra operação de negócio e também pode falhar.",
    ],
    practice: [
      "Registre a intenção de evento junto do pedido.",
      "Simule falha de publicação e retome a entrega.",
      "Desenhe reserva, confirmação e cancelamento com um caminho de compensação e teste a falha de um passo.",
    ],
    pitfall:
      "Chamar uma sequência de métodos distribuídos de transação atômica.",
    evidence:
      "Explicar a garantia de cada etapa e demonstrar recuperação de uma falha intermediária.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Health checks, métricas e traces": {
    explanation: [
      "Métricas identificam comportamento agregado, logs explicam eventos e traces conectam etapas da chamada. Esses sinais precisam compartilhar contexto suficiente para investigação.",
      "Uma dependência externa indisponível não deve necessariamente tornar o processo irrecuperável.",
    ],
    practice: [
      "Correlacione gateway, pedidos e catálogo.",
      "Defina uma métrica de falha e observe latência entre serviços.",
      "Simule uma dependência lenta e explique saúde, prontidão e diagnóstico.",
    ],
    pitfall:
      "Expor detalhes operacionais privados ou coletar muitos dados sem uma pergunta de investigação.",
    evidence: "Localizar uma falha distribuída usando sinais correlacionados.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Autorização com tokens": {
    explanation: [
      "O serviço que possui o dado deve verificar a permissão correspondente. Propagar um token exige um modelo de confiança claro e validação de emissor, audiência e tempo.",
      "O gateway não elimina a necessidade de proteger acessos diretos ao serviço.",
    ],
    practice: [
      "Proteja uma consulta de pedido pelo dono.",
      "Teste acesso pelo gateway e acesso direto ao serviço.",
      "Recuse token expirado, alterado e sem a permissão necessária.",
    ],
    pitfall:
      "Aceitar qualquer token só porque ele veio de um componente interno.",
    evidence:
      "Provar proteção no serviço e explicar o limite de confiança de cada chamada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Operação sem segredos em logs": {
    explanation: [
      "Dados que atravessam vários serviços podem aparecer em mais de um log. Mascarar uma única camada não garante que o dado permaneça protegido.",
      "Defina uma lista pequena de campos de observação e teste o que foi registrado.",
    ],
    practice: [
      "Execute uma chamada com credencial fictícia identificável.",
      "Inspecione logs e respostas em cada serviço.",
      "Garanta que o identificador de correlação permita investigar sem registrar a credencial.",
    ],
    pitfall:
      "Registrar cabeçalhos ou payloads completos para facilitar o primeiro diagnóstico.",
    evidence:
      "Demonstrar rastreabilidade com ausência de credenciais nos registros de observação.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Executar o sistema com Docker Compose": {
    explanation: [
      "O laboratório deve declarar serviços, rede, configuração e volumes de forma reproduzível. Prontidão e ordem de inicialização não são a mesma coisa.",
      "Descrever dependência entre containers não garante que o serviço já esteja aceitando trabalho.",
    ],
    practice: [
      "Monte gateway, descoberta, catálogo, pedidos e broker no laboratório.",
      "Separe configuração pública de segredos fictícios.",
      "Recrie o ambiente e teste inicialização com uma dependência lenta.",
    ],
    pitfall:
      "Resolver toda corrida de inicialização com sleeps fixos sem observar saúde.",
    evidence:
      "Subir o ambiente a partir de instruções e demonstrar recuperação de inicialização.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Spring Cloud::Teste ponta a ponta e documentação das decisões": {
    explanation: [
      "Um teste de ponta a ponta verifica a colaboração do sistema, mas precisa de dados isolados e expectativas observáveis. Decisões sobre limites e falhas fazem parte da entrega.",
      "A revisão final deve mostrar onde a garantia termina, não apenas onde o caminho feliz funcionou.",
    ],
    practice: [
      "Demonstre criação de pedido, reserva e evento de conclusão.",
      "Teste resposta perdida, reentrega e indisponibilidade do catálogo.",
      "Entregue contratos, diagramas, decisões, comandos e roteiro de recuperação.",
    ],
    pitfall:
      "Prometer consistência instantânea ou exatamente uma entrega sem delimitar o cenário testado.",
    evidence:
      "Reproduzir os cenários de falha e defender as garantias com evidência.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Go::Instalação, módulos e primeiro programa": {
    explanation: [
      "go.mod identifica o módulo e suas dependências. O executável e o código-fonte são artefatos diferentes, e a versão da ferramenta precisa ser conhecida para reproduzir um build.",
      "Comece com um programa pequeno antes de adicionar frameworks ou banco.",
    ],
    practice: [
      "Crie um módulo da biblioteca e execute um Hello, World.",
      "Compare go run, go test e go build.",
      "Introduza um erro de compilação e explique a mensagem.",
    ],
    pitfall:
      "Misturar código de módulos diferentes sem entender o import path.",
    evidence:
      "Executar os três comandos e explicar o papel de go.mod e do binário gerado.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Tipos, funções e controle de fluxo": {
    explanation: [
      "Go usa tipos estáticos e funções com retornos explícitos. A entrada do usuário é externa ao contrato de tipo e ainda precisa de validação.",
      "Um loop de menu deve separar leitura, regra e apresentação.",
    ],
    practice: [
      "Crie um menu de cadastro de livros.",
      "Valide quantidade e título.",
      "Extraia as regras para funções e teste chamadas sem abrir o terminal.",
    ],
    pitfall:
      "Tratar a existência de tipos como garantia de validade de qualquer entrada.",
    evidence:
      "Demonstrar entrada válida, vazia e inválida com resultados previsíveis.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Slices, mapas, structs e ponteiros": {
    explanation: [
      "Um slice descreve uma janela sobre um array, e cópias de slices podem compartilhar armazenamento. Mapas associam chaves a valores e exigem cuidado com inicialização e acesso concorrente.",
      "Entender compartilhamento evita alterações que parecem surgir em outro lugar do programa.",
    ],
    practice: [
      "Modele Livro e uma coleção de catálogo.",
      "Mostre duas slices que compartilham dados.",
      "Crie uma função que retorna uma cópia adequada e prove a separação.",
    ],
    pitfall:
      "Supor que copiar uma slice duplica todos os elementos e suas referências.",
    evidence:
      "Explicar tamanho, capacidade e compartilhamento com um exemplo reproduzível.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Métodos, interfaces e composição": {
    explanation: [
      "Interfaces descrevem comportamento e são satisfeitas implicitamente. Uma interface pequena no lado consumidor reduz acoplamento.",
      "Evite criar interfaces para todo tipo antes de existir uma necessidade de substituição.",
    ],
    practice: [
      "Defina o contrato de armazenamento usado pela regra de empréstimo.",
      "Implemente um fake em memória.",
      "Teste a regra sem persistência nem servidor HTTP.",
    ],
    pitfall:
      "Criar uma interface enorme que obriga testes a implementar operações não utilizadas.",
    evidence: "Trocar a persistência sem alterar a regra de empréstimo.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Erros explícitos e contexto da falha": {
    explanation: [
      "Um erro é parte do contrato de uma operação e deve preservar contexto útil. O chamador decide onde converter a falha em mensagem ou resposta HTTP.",
      "Diferencie ausência de livro de indisponibilidade da persistência.",
    ],
    practice: [
      "Defina erros para livro ausente e estoque insuficiente.",
      "Propague uma falha de gravação com contexto.",
      "Teste que a fronteira escolhe a resposta correta para cada erro.",
    ],
    pitfall:
      "Comparar mensagens livres para decidir regras ou usar panic para uma entrada comum inválida.",
    evidence:
      "Distinguir falhas de domínio e infraestrutura com testes observáveis.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Testes de tabela, cobertura e fuzzing": {
    explanation: [
      "Testes de tabela descrevem casos que compartilham um contrato. Fuzzing explora entradas além dos exemplos escolhidos, mas ainda precisa de uma propriedade correta para verificar.",
      "Cobertura de linha não demonstra sozinha que as invariantes foram exercitadas.",
    ],
    practice: [
      "Crie uma tabela de validação de identificadores.",
      "Cubra limites e entradas vazias.",
      "Adicione um fuzz test que preserve a propriedade definida e examine uma falha introduzida de propósito.",
    ],
    pitfall:
      "Uma asserção apenas verificar que o programa não caiu sem conferir o resultado prometido.",
    evidence:
      "Demonstrar um teste que detecta uma regressão real e explicar a propriedade do fuzzing.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::API HTTP, JSON e validação": {
    explanation: [
      "Um handler recebe dados não confiáveis e precisa limitar tamanho, validar campos e produzir um contrato de resposta. Erro HTTP e erro de negócio devem ter tradução consistente.",
      "A regra não deve depender de ResponseWriter para ser testável.",
    ],
    practice: [
      "Exponha cadastro e consulta de livros com net/http.",
      "Limite entrada e trate JSON inválido e livro ausente.",
      "Teste os handlers com httptest e mantenha a regra separada.",
    ],
    pitfall:
      "Retornar uma resposta parcialmente escrita e tentar mudar o status depois.",
    evidence:
      "Cobrir sucesso, JSON inválido, limite excedido e ausência de recurso.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Context, timeout e encerramento": {
    explanation: [
      "Context transporta prazo e cancelamento através da operação. Cancelar uma requisição não encerra automaticamente qualquer goroutine criada sem vínculo com esse contexto.",
      "Encerramento do servidor precisa considerar operações em andamento e tempo máximo.",
    ],
    practice: [
      "Propague context da requisição até um adaptador lento.",
      "Teste deadline e cancelamento.",
      "Implemente shutdown com limite em um laboratório.",
    ],
    pitfall:
      "Iniciar trabalho sem contexto e deixá-lo ativo depois que o cliente desistiu.",
    evidence:
      "Demonstrar timeout, cancelamento e encerramento controlado sem trabalho pendente.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::SQL, transações e cancelamento": {
    explanation: [
      "database/sql coordena conexões; uma transação precisa confirmar ou desfazer a unidade de trabalho. Parâmetros separam dados de SQL, e recursos como Rows precisam ser fechados.",
      "O limite de conexões faz parte da capacidade do sistema.",
    ],
    practice: [
      "Persista livros e empréstimos em um banco de laboratório.",
      "Simule falha depois da primeira gravação e valide rollback.",
      "Teste cancelamento de uma consulta e o fechamento de recursos.",
    ],
    pitfall:
      "Reservar uma conexão e deixá-la presa por esquecer um fechamento ou manter transação durante I/O externo.",
    evidence:
      "Provar rollback e explicar como o pool recupera a conexão após falha.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Concorrência e integridade no banco": {
    explanation: [
      "Duas operações podem observar o mesmo estoque. Proteger uma variável em memória não garante integridade entre múltiplos processos.",
      "A estratégia precisa ser definida na fronteira onde o dado é compartilhado.",
    ],
    practice: [
      "Simule dois empréstimos concorrentes para o último exemplar.",
      "Use uma estratégia de controle no banco e trate o conflito.",
      "Teste resultado, estoque e ausência de empréstimo parcial.",
    ],
    pitfall:
      "Resolver o caso com um mutex local e supor que outro processo também está protegido.",
    evidence:
      "Demonstrar no laboratório que apenas um empréstimo é confirmado.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Goroutines, channels e sincronização": {
    explanation: [
      "Goroutines executam de forma concorrente; channels coordenam comunicação, mas não eliminam toda condição de corrida. O dono de um canal e o momento de encerrá-lo precisam ser claros.",
      "Cada goroutine criada deve ter uma condição de término.",
    ],
    practice: [
      "Construa um worker pool de notificações fictícias.",
      "Limite concorrência e propague cancelamento.",
      "Execute go test -race e provoque uma corrida de propósito antes de corrigi-la.",
    ],
    pitfall:
      "Criar uma goroutine por item sem limite ou fechar um canal no lado que não controla sua produção.",
    evidence: "Demonstrar limite, término e ausência da corrida reproduzida.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Benchmarks, profiling e segurança": {
    explanation: [
      "Benchmark mede um cenário definido; um perfil ajuda a localizar custo real. Uma dependência pode exigir atualização por segurança independentemente de um ganho de desempenho.",
      "Compare hipóteses com a mesma carga e registre limites da conclusão.",
    ],
    practice: [
      "Crie um benchmark de uma consulta em memória.",
      "Observe perfil e uma alocação relevante.",
      "Revise dependências com as ferramentas de segurança do ecossistema e documente a decisão.",
    ],
    pitfall:
      "Otimizar uma microfunção sem comprovar que ela influencia a operação observada.",
    evidence:
      "Apresentar hipótese, medição e uma decisão de segurança verificável.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Projeto final Go": {
    explanation: [
      "Uma entrega reúne regra, API, banco, cancelamento, logs e testes. A execução não deve depender de caminhos ou variáveis pessoais do autor.",
      "Reproduzir falhas faz parte da demonstração, não é uma tarefa posterior à conclusão.",
    ],
    practice: [
      "Entregue biblioteca com cadastro, empréstimos e notificações simuladas.",
      "Inclua testes, Dockerfile, configuração de exemplo e instruções.",
      "Demonstre falta de estoque, timeout e recuperação da persistência.",
    ],
    pitfall:
      "Considerar a aplicação concluída porque o binário foi gerado com sucesso.",
    evidence:
      "Executar em ambiente limpo e reproduzir os três cenários de falha.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Go::Revisão de contratos e decisões": {
    explanation: [
      "Revisar é recuperar o raciocínio e adaptar uma regra, não apenas reler a solução. A linguagem oferece ferramentas, mas a decisão deve atender a um contrato de domínio.",
      "Use evidências do projeto para justificar limites e estruturas escolhidas.",
    ],
    practice: [
      "Desenhe a operação de empréstimo sem consultar o guia.",
      "Explique context, transação e término das goroutines.",
      "Altere uma regra e adapte testes antes de mudar a implementação.",
    ],
    pitfall:
      "Decorar um padrão de concorrência sem explicar quem produz, consome e encerra o trabalho.",
    evidence:
      "Defender as decisões e adaptar uma regra com testes de regressão.",
    minutes: 90,
    project:
      "Biblioteca Go: catálogo, empréstimos e processamento de notificações.",
    example: null,
  },
  "Java::Construtores, static, final e enum": {
    explanation: [
      "O construtor estabelece um estado inicial válido. static pertence à classe e final impede reatribuição da referência; nenhum deles garante sozinho a imutabilidade de todo o objeto.",
      "Enums representam um conjunto finito de valores e permitem modelar transições com nomes claros.",
    ],
    practice: [
      "Crie estados de um pedido com enum.",
      "Valide o pedido no construtor e impeça criação sem itens.",
      "Compare um contador static e um atributo de instância em dois objetos.",
    ],
    pitfall:
      "Supor que uma lista marcada final não pode ter seus elementos alterados.",
    evidence:
      "Demonstrar estado inicial válido, diferença entre classe e instância e limite de final.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Polimorfismo, classes abstratas e contratos": {
    explanation: [
      "Um consumidor de uma interface depende do comportamento prometido, não de um nome concreto. Uma implementação precisa manter o contrato esperado, inclusive em falhas.",
      "Herança mal escolhida cria condicionais de tipo e obriga consumidores a conhecer detalhes que deveriam estar escondidos.",
    ],
    practice: [
      "Modele duas políticas de cálculo de entrega com a mesma interface.",
      "Execute os mesmos testes de contrato nas duas.",
      "Adicione uma terceira política sem alterar o serviço de pedidos.",
    ],
    pitfall:
      "Mudar o significado de uma operação ao sobrescrever um método e quebrar consumidores existentes.",
    evidence:
      "Substituir implementações preservando o contrato e sem adicionar testes de tipo no consumidor.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Genéricos, records e imutabilidade": {
    explanation: [
      "Generics descrevem relações de tipo e restrições; records tornam a forma de dados explícita. Imutabilidade exige considerar também os objetos e coleções referenciados.",
      "Um tipo que representa uma decisão de negócio deve proteger sua validade em qualquer caminho de construção.",
    ],
    practice: [
      "Crie um record de item de pedido com quantidade validada.",
      "Faça uma cópia defensiva dos itens recebidos.",
      "Escreva uma função genérica de consulta e demonstre um uso que o compilador rejeita.",
    ],
    pitfall:
      "Aceitar uma coleção externa e presumir que ela não será modificada depois.",
    evidence:
      "Provar que o chamador não altera o pedido por uma referência compartilhada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Lambdas, interfaces funcionais e referências de método": {
    explanation: [
      "Uma lambda fornece comportamento para um contrato funcional. Capturar uma variável não transforma automaticamente uma operação em pura ou segura para concorrência.",
      "Use funções para tornar uma transformação explícita, sem esconder acesso a banco ou alteração de estado no meio da pipeline.",
    ],
    practice: [
      "Implemente filtros de livros com Predicate e transformações com Function.",
      "Compare uma lambda e uma referência de método.",
      "Teste uma transformação sem efeitos sobre a coleção de origem.",
    ],
    pitfall:
      "Colocar efeitos de negócio em uma transformação que pode ser reordenada ou executada em paralelo.",
    evidence:
      "Explicar o tipo funcional esperado e testar que a transformação preserva a entrada.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Limites de tipos e curingas": {
    explanation: [
      "Um parâmetro genérico restringe quais tipos podem participar de uma operação. Wildcards descrevem variação da referência, e a direção de leitura e escrita muda o que o compilador permite.",
      "Não contorne uma restrição com cast antes de entender qual garantia ela protege.",
    ],
    practice: [
      "Crie uma função que lê uma coleção de subtipos de um contrato.",
      "Crie outra que escreve em uma coleção apropriada.",
      "Mostre um exemplo rejeitado e explique por que o cast esconderia o problema.",
    ],
    pitfall:
      "Usar cast não verificado como padrão para fazer uma API genérica compilar.",
    evidence:
      "Compilar sem casts não verificados e justificar os limites da assinatura.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
  "Java::Anotações e reflexão sem magia": {
    explanation: [
      "Uma anotação é metadado; seu efeito depende de quem a lê e em que fase. Reflexão permite inspecionar tipos em execução, mas cria acoplamento, custo e limites de acesso.",
      "Entender esse mecanismo ajuda a ler frameworks sem tratar uma anotação como uma regra universal da linguagem.",
    ],
    practice: [
      "Crie uma anotação simples para uma validação de laboratório.",
      "Inspecione-a em um exemplo mínimo e compare com validação direta.",
      "Registre quais erros só aparecem em execução.",
    ],
    pitfall:
      "Acreditar que declarar uma anotação executa automaticamente uma validação.",
    evidence:
      "Explicar quem interpreta o metadado e demonstrar o comportamento sem o interpretador.",
    minutes: 90,
    project: "Livraria: catálogo, pedidos e estoque.",
    example: null,
  },
};
