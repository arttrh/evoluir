import type { Seed } from "./advanced-content.js";
export const deepTracks: Record<string, Seed> = {
  Java: {
    objective:
      "Construir uma livraria do programa no terminal ao backend seguro, testado, observável e entregue. Cada aula acrescenta uma parte verificável ao mesmo projeto.",
    prerequisites:
      "Nenhuma experiência em Java. Reserve sessões para explicação, implementação, teste de falha e revisão. A estimativa de prática é independente das cerca de 63 horas do vídeo de apoio.",
    modules: [
      {
        title: "Básico · ambiente, execução e depuração",
        topics: [
          {
            title: "JDK, JVM e primeiro programa",
            criteria:
              "Executar o mesmo programa pelo terminal e pela IDE e explicar onde surge cada arquivo de saída.",
            exercise:
              "Crie uma pasta de laboratório e um Main.java que imprima o nome da livraria. Compile pelo terminal, execute e compare com a execução pela IDE. Remova um ponto e vírgula, leia a mensagem e restaure o programa.",
            resources: [
              {
                title: "Documentação · ambiente, execução e depuração",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de JDK, JVM e primeiro programa. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Variáveis, entrada e saída",
            criteria:
              "Demonstrar entradas válida, vazia, não numérica e negativa com resultados previsíveis.",
            exercise:
              "Leia título e quantidade de um livro pelo terminal. Converta a quantidade e rejeite texto, zero e números negativos. Mostre um resumo sem encerrar abruptamente o programa.",
            resources: [
              {
                title: "Documentação · ambiente, execução e depuração",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Variáveis, entrada e saída. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Fluxo, métodos e diagnóstico de uma falha",
            criteria:
              "Percorrer cada opção do menu e explicar com o depurador por que o laço termina.",
            exercise:
              "Implemente um menu cadastrar, listar e sair. Extraia a validação de quantidade para um método. Coloque um breakpoint, observe duas iterações e corrija um laço que não termina.",
            resources: [
              {
                title: "Documentação · ambiente, execução e depuração",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Fluxo, métodos e diagnóstico de uma falha. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · tipos, decisões e contratos",
        topics: [
          {
            title: "Tipos primitivos, conversões e precisão",
            criteria:
              "Explicar a diferença entre 5 / 2 e 5.0 / 2 e testar o cálculo decimal do total.",
            exercise:
              "Compare divisão inteira e decimal em exemplos pequenos. Leia um preço como texto, converta com BigDecimal e calcule o total de três unidades. Teste uma quantidade além do limite escolhido.",
            resources: [
              {
                title: "Documentação · tipos, decisões e contratos",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Tipos primitivos, conversões e precisão. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Strings, igualdade e validação",
            criteria:
              "Cobrir texto vazio, espaços, caracteres acentuados e duas instâncias com o mesmo conteúdo.",
            exercise:
              "Normalize o título removendo espaços externos. Recuse um título vazio e estabeleça um limite de tamanho. Compare dois títulos criados de formas diferentes e escreva o resultado esperado.",
            resources: [
              {
                title: "Documentação · tipos, decisões e contratos",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Strings, igualdade e validação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Arrays, loops e decomposição",
            criteria:
              "Executar os três limites e explicar a condição que impede acesso fora do array.",
            exercise:
              "Armazene três livros em um array e liste com índice. Extraia busca por título para uma função. Teste um array vazio, um item e uma busca sem resultado.",
            resources: [
              {
                title: "Documentação · tipos, decisões e contratos",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Arrays, loops e decomposição. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · orientação a objetos e domínio",
        topics: [
          {
            title: "Classes, encapsulamento e invariantes",
            criteria:
              "Demonstrar que nenhuma operação pública permite título vazio ou estoque negativo.",
            exercise:
              "Modele Livro com identificador, título e estoque. Crie operações repor e reservar que validem a quantidade. Tente violar a regra chamando o objeto diretamente, sem usar o menu.",
            resources: [
              {
                title: "Documentação · orientação a objetos e domínio",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Classes, encapsulamento e invariantes. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Herança, interfaces e composição",
            criteria:
              "Trocar a persistência por uma implementação de teste sem alterar a regra de reserva.",
            exercise:
              "Defina uma interface de repositório com salvar e buscar. Implemente uma versão em memória. Injete o repositório no serviço de reservas e troque a implementação em um teste.",
            resources: [
              {
                title: "Documentação · orientação a objetos e domínio",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Herança, interfaces e composição. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Equals, hashCode, records e imutabilidade",
            criteria:
              "Explicar o contrato de igualdade e testar recuperação por uma chave equivalente.",
            exercise:
              "Crie um record para o identificador do livro. Use-o como chave de um mapa e teste a busca com uma instância equivalente. Experimente receber uma lista mutável em um record e proteja o estado.",
            resources: [
              {
                title: "Documentação · orientação a objetos e domínio",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Equals, hashCode, records e imutabilidade. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · construção e polimorfismo",
        topics: [
          {
            title: "Construtores, static, final e enum",
            criteria:
              "Demonstrar estado inicial válido, diferença entre classe e instância e limite de final.",
            exercise:
              "Crie estados de um pedido com enum. Valide o pedido no construtor e impeça criação sem itens. Compare um contador static e um atributo de instância em dois objetos.",
            resources: [
              {
                title: "Documentação · construção e polimorfismo",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Construtores, static, final e enum. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Polimorfismo, classes abstratas e contratos",
            criteria:
              "Substituir implementações preservando o contrato e sem adicionar testes de tipo no consumidor.",
            exercise:
              "Modele duas políticas de cálculo de entrega com a mesma interface. Execute os mesmos testes de contrato nas duas. Adicione uma terceira política sem alterar o serviço de pedidos.",
            resources: [
              {
                title: "Documentação · construção e polimorfismo",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Polimorfismo, classes abstratas e contratos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Genéricos, records e imutabilidade",
            criteria:
              "Provar que o chamador não altera o pedido por uma referência compartilhada.",
            exercise:
              "Crie um record de item de pedido com quantidade validada. Faça uma cópia defensiva dos itens recebidos. Escreva uma função genérica de consulta e demonstre um uso que o compilador rejeita.",
            resources: [
              {
                title: "Documentação · construção e polimorfismo",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Genéricos, records e imutabilidade. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · coleções e modelagem de dados",
        topics: [
          {
            title: "Tipos, coleções e objetos",
            criteria:
              "Justificar cada coleção e provar que uma referência retornada não altera o estoque interno.",
            exercise:
              "Substitua o array do catálogo por uma coleção apropriada. Impeça identificadores duplicados. Retorne uma visão segura da listagem e teste tentativa de alteração externa.",
            resources: [
              {
                title: "Documentação · coleções e modelagem de dados",
                url: "https://dev.java/learn/api/collections-framework/",
                why: "Consulte depois da explicação e durante o laboratório de Tipos, coleções e objetos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Generics, comparadores e ordenação",
            criteria:
              "Compilar sem tipos crus e demonstrar ordenação estável em empates.",
            exercise:
              "Crie uma função genérica de paginação de listas. Ordene livros por título e, em empate, por identificador. Teste página vazia, última página e tamanho inválido.",
            resources: [
              {
                title: "Documentação · coleções e modelagem de dados",
                url: "https://dev.java/learn/api/collections-framework/",
                why: "Consulte depois da explicação e durante o laboratório de Generics, comparadores e ordenação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Complexidade e estruturas de dados",
            criteria:
              "Comparar crescimento e custo de atualização sem confundir uma medição isolada com garantia de desempenho.",
            exercise:
              "Implemente busca por identificador com lista e com mapa. Conte comparações para tamanhos diferentes. Explique o custo de atualizar e manter as duas representações.",
            resources: [
              {
                title: "Documentação · coleções e modelagem de dados",
                url: "https://dev.java/learn/api/collections-framework/",
                why: "Consulte depois da explicação e durante o laboratório de Complexidade e estruturas de dados. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · algoritmos e estruturas",
        topics: [
          {
            title: "Recursão, busca e ordenação",
            criteria:
              "Demonstrar casos de fronteira e justificar a pré-condição da busca binária.",
            exercise:
              "Implemente busca linear e binária em identificadores ordenados. Teste coleção vazia, um item, primeiro e último elemento. Ordene um conjunto pequeno e explique o custo de cada abordagem.",
            resources: [
              {
                title: "Documentação · algoritmos e estruturas",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Recursão, busca e ordenação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=75916s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Pilhas, filas e prioridades",
            criteria:
              "Testar as ordens esperadas e explicar por que cada estrutura atende ao caso de uso.",
            exercise:
              "Modele uma fila de espera para um livro. Adicione uma operação de desfazer em um histórico descartável. Compare ordem de chegada e prioridade com casos de empate.",
            resources: [
              {
                title: "Documentação · algoritmos e estruturas",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Pilhas, filas e prioridades. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=75916s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Árvores, grafos e travessia",
            criteria:
              "Demonstrar uma travessia correta e explicar seu custo em nós e conexões.",
            exercise:
              "Modele categorias de livros em árvore. Crie recomendações fictícias em um grafo e faça uma busca com controle de visitados. Introduza um ciclo e prove que o algoritmo termina.",
            resources: [
              {
                title: "Documentação · algoritmos e estruturas",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Árvores, grafos e travessia. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=75916s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · erros, streams e arquivos",
        topics: [
          {
            title: "Exceções, streams e testes",
            criteria:
              "Explicar onde a exceção é convertida em mensagem e provar equivalência das duas implementações.",
            exercise:
              "Calcule totais por categoria com streams. Mantenha uma versão simples equivalente com laços. Teste coleção vazia e erro de dados e compare os resultados.",
            resources: [
              {
                title: "Documentação · erros, streams e arquivos",
                url: "https://dev.java/learn/api/streams/",
                why: "Consulte depois da explicação e durante o laboratório de Exceções, streams e testes. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Arquivos, recursos e persistência segura",
            criteria:
              "Reproduzir arquivo ausente, inválido e erro de escrita sem perder a cópia anterior.",
            exercise:
              "Salve o catálogo em um arquivo de laboratório. Leia linha a linha e informe o número de uma linha inválida. Simule uma falha e garanta que o arquivo anterior permaneça recuperável.",
            resources: [
              {
                title: "Documentação · erros, streams e arquivos",
                url: "https://dev.java/learn/api/streams/",
                why: "Consulte depois da explicação e durante o laboratório de Arquivos, recursos e persistência segura. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Datas, Optional e fronteiras de entrada",
            criteria:
              "Testar dia anterior, dia do prazo e dia seguinte sem depender da data atual.",
            exercise:
              "Adicione prazo de uma reserva usando LocalDate. Injete um relógio ou data de referência para testar vencimento. Retorne ausência quando o identificador não existir.",
            resources: [
              {
                title: "Documentação · erros, streams e arquivos",
                url: "https://dev.java/learn/api/streams/",
                why: "Consulte depois da explicação e durante o laboratório de Datas, Optional e fronteiras de entrada. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · funções, anotações e reflexão",
        topics: [
          {
            title: "Lambdas, interfaces funcionais e referências de método",
            criteria:
              "Explicar o tipo funcional esperado e testar que a transformação preserva a entrada.",
            exercise:
              "Implemente filtros de livros com Predicate e transformações com Function. Compare uma lambda e uma referência de método. Teste uma transformação sem efeitos sobre a coleção de origem.",
            resources: [
              {
                title: "Documentação · funções, anotações e reflexão",
                url: "https://dev.java/learn/lambdas/",
                why: "Consulte depois da explicação e durante o laboratório de Lambdas, interfaces funcionais e referências de método. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Limites de tipos e curingas",
            criteria:
              "Compilar sem casts não verificados e justificar os limites da assinatura.",
            exercise:
              "Crie uma função que lê uma coleção de subtipos de um contrato. Crie outra que escreve em uma coleção apropriada. Mostre um exemplo rejeitado e explique por que o cast esconderia o problema.",
            resources: [
              {
                title: "Documentação · funções, anotações e reflexão",
                url: "https://dev.java/learn/generics/",
                why: "Consulte depois da explicação e durante o laboratório de Limites de tipos e curingas. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Anotações e reflexão sem magia",
            criteria:
              "Explicar quem interpreta o metadado e demonstrar o comportamento sem o interpretador.",
            exercise:
              "Crie uma anotação simples para uma validação de laboratório. Inspecione-a em um exemplo mínimo e compare com validação direta. Registre quais erros só aparecem em execução.",
            resources: [
              {
                title: "Documentação · funções, anotações e reflexão",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Anotações e reflexão sem magia. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · build e dependências",
        topics: [
          {
            title: "Maven: estrutura, ciclo e dependências",
            criteria:
              "Construir o projeto em uma pasta limpa e explicar de onde veio cada dependência principal.",
            exercise:
              "Crie um pom para a livraria e execute compile, test e package. Inspecione a árvore de dependências. Introduza e remova um conflito transitivo em um projeto descartável.",
            resources: [
              {
                title: "Documentação · build e dependências",
                url: "https://maven.apache.org/guides/getting-started/",
                why: "Consulte depois da explicação e durante o laboratório de Maven: estrutura, ciclo e dependências. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=48771s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Gradle e wrappers de build",
            criteria:
              "Executar os dois exemplos com wrapper e explicar a escolha do build principal.",
            exercise:
              "Monte uma variante mínima com Gradle Wrapper. Execute testes e empacotamento e compare com Maven. Registre qual ferramenta você manterá no projeto e por quê.",
            resources: [
              {
                title: "Documentação · build e dependências",
                url: "https://docs.gradle.org/current/userguide/userguide.html",
                why: "Consulte depois da explicação e durante o laboratório de Gradle e wrappers de build. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=56533s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Configuração, ambientes e segredos",
            criteria:
              "Iniciar com ambiente válido e recusar ambiente inválido com uma mensagem sem credenciais.",
            exercise:
              "Leia uma configuração de caminho do catálogo pelo ambiente. Defina um exemplo sem valores pessoais. Teste variável ausente e arquivo inacessível.",
            resources: [
              {
                title: "Documentação · build e dependências",
                url: "https://maven.apache.org/guides/getting-started/",
                why: "Consulte depois da explicação e durante o laboratório de Configuração, ambientes e segredos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=48771s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · testes que sustentam a evolução",
        topics: [
          {
            title: "JUnit, parametrização e desenho testável",
            criteria:
              "Fazer um teste falhar ao introduzir uma regressão e explicar o contrato protegido.",
            exercise:
              "Teste reserva válida, livro ausente e estoque insuficiente. Parametrize quantidade zero, negativa e acima do estoque. Mostre uma falha real quando a regra for alterada incorretamente.",
            resources: [
              {
                title: "Documentação · testes que sustentam a evolução",
                url: "https://docs.junit.org/current/user-guide/",
                why: "Consulte depois da explicação e durante o laboratório de JUnit, parametrização e desenho testável. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=58397s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Mocks, fakes e integração",
            criteria:
              "Distinguir o risco coberto por cada tipo de teste e demonstrar a falha de persistência.",
            exercise:
              "Use um repositório em memória nos testes de regra. Escreva um teste de integração da persistência em arquivo. Provoque uma falha de escrita e confira a mensagem e os dados preservados.",
            resources: [
              {
                title: "Documentação · testes que sustentam a evolução",
                url: "https://docs.junit.org/current/user-guide/",
                why: "Consulte depois da explicação e durante o laboratório de Mocks, fakes e integração. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=58397s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Git e revisão de uma mudança",
            criteria:
              "Entregar uma mudança pequena, validada e com histórico compreensível.",
            exercise:
              "Crie uma branch de laboratório e adicione uma regra com teste. Revise o diff e escreva a intenção do commit. Simule um conflito e recupere um commit em um repositório descartável.",
            resources: [
              {
                title: "Documentação · testes que sustentam a evolução",
                url: "https://git-scm.com/book/en/v2",
                why: "Consulte depois da explicação e durante o laboratório de Git e revisão de uma mudança. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=68686s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · SQL e JDBC",
        topics: [
          {
            title: "Modelo relacional, joins e restrições",
            criteria:
              "Explicar a cardinalidade das consultas e provar que o banco rejeita dados inconsistentes.",
            exercise:
              "Modele livro, pedido e item de pedido. Adicione restrições e consultas de pedidos com seus itens. Teste identificador duplicado e referência inexistente.",
            resources: [
              {
                title: "Documentação · SQL e JDBC",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Consulte depois da explicação e durante o laboratório de Modelo relacional, joins e restrições. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=94348s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "JDBC, consultas parametrizadas e transações",
            criteria:
              "Provar que uma falha no item não deixa um pedido incompleto persistido.",
            exercise:
              "Implemente um repositório JDBC para o catálogo. Use parâmetros em busca e atualização. Crie um pedido e simule falha após inserir o cabeçalho para validar rollback.",
            resources: [
              {
                title: "Documentação · SQL e JDBC",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Consulte depois da explicação e durante o laboratório de JDBC, consultas parametrizadas e transações. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=94348s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Índices, concorrência e custo de consulta",
            criteria:
              "Reproduzir a disputa e demonstrar que o estoque não fica negativo.",
            exercise:
              "Analise uma consulta com EXPLAIN. Compare um índice adequado com o plano anterior. Simule duas reservas concorrentes e registre a estratégia que mantém o estoque correto.",
            resources: [
              {
                title: "Documentação · SQL e JDBC",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Consulte depois da explicação e durante o laboratório de Índices, concorrência e custo de consulta. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=94348s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · HTTP, Servlet e MVC",
        topics: [
          {
            title: "HTTP: métodos, status e contratos",
            criteria:
              "Documentar e demonstrar códigos e corpos de resposta para os principais caminhos.",
            exercise:
              "Escreva exemplos de GET, POST e DELETE para livros. Defina respostas de sucesso e falha em JSON. Teste a diferença entre uma URL inexistente e um identificador ausente.",
            resources: [
              {
                title: "Documentação · HTTP, Servlet e MVC",
                url: "https://jakarta.ee/specifications/servlet/",
                why: "Consulte depois da explicação e durante o laboratório de HTTP: métodos, status e contratos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=103176s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Servlets, filtros e ciclo de requisição",
            criteria:
              "Explicar o ciclo de uma requisição e remover estado compartilhado incorreto.",
            exercise:
              "Crie um exemplo pequeno de Servlet em laboratório. Adicione um filtro que mede tempo sem registrar dados pessoais. Envie requisições simultâneas e observe um contador compartilhado.",
            resources: [
              {
                title: "Documentação · HTTP, Servlet e MVC",
                url: "https://jakarta.ee/specifications/servlet/",
                why: "Consulte depois da explicação e durante o laboratório de Servlets, filtros e ciclo de requisição. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=103176s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "JSP e separação de apresentação",
            criteria:
              "Demonstrar separação de responsabilidades e renderização segura de texto.",
            exercise:
              "Monte uma página simples de listagem de livros no laboratório. Separe preparação de dados da renderização. Mostre um título com caracteres especiais sem interpretá-lo como marcação executável.",
            resources: [
              {
                title: "Documentação · HTTP, Servlet e MVC",
                url: "https://jakarta.ee/specifications/servlet/",
                why: "Consulte depois da explicação e durante o laboratório de JSP e separação de apresentação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=103176s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · ORM e Hibernate",
        topics: [
          {
            title: "Entidades, estados e mapeamentos",
            criteria:
              "Explicar o SQL produzido e o momento em que a alteração se torna persistente.",
            exercise:
              "Mapeie Livro e Categoria em um projeto de laboratório. Observe SQL de inserção e atualização. Compare uma entidade gerenciada e um objeto fora do contexto de persistência.",
            resources: [
              {
                title: "Documentação · ORM e Hibernate",
                url: "https://hibernate.org/orm/documentation/",
                why: "Consulte depois da explicação e durante o laboratório de Entidades, estados e mapeamentos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=125591s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Relacionamentos, N+1 e limites de carregamento",
            criteria:
              "Medir o número de consultas e manter o contrato da API sem consultas inesperadas.",
            exercise:
              "Liste pedidos com itens e conte consultas. Reproduza N+1 e corrija a consulta com uma estratégia justificada. Crie DTOs para a resposta, sem depender da sessão aberta na serialização.",
            resources: [
              {
                title: "Documentação · ORM e Hibernate",
                url: "https://hibernate.org/orm/documentation/",
                why: "Consulte depois da explicação e durante o laboratório de Relacionamentos, N+1 e limites de carregamento. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=125591s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Migrações, locking e evolução de schema",
            criteria:
              "Demonstrar conflito controlado e uma migração que preserva dados.",
            exercise:
              "Adicione versão à entidade que controla estoque. Simule duas atualizações concorrentes. Escreva uma migração que adicione um campo sem apagar registros existentes.",
            resources: [
              {
                title: "Documentação · ORM e Hibernate",
                url: "https://hibernate.org/orm/documentation/",
                why: "Consulte depois da explicação e durante o laboratório de Migrações, locking e evolução de schema. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=125591s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · Spring por dentro",
        topics: [
          {
            title: "IoC, beans e injeção por construtor",
            criteria:
              "Explicar quem cria cada objeto e testar a regra sem contexto Spring.",
            exercise:
              "Transforme o serviço de reservas em um bean. Injete a interface de repositório pelo construtor. Execute um teste de regra instanciando o serviço diretamente com um fake.",
            resources: [
              {
                title: "Documentação · Spring por dentro",
                url: "https://docs.spring.io/spring-framework/reference/core.html",
                why: "Consulte depois da explicação e durante o laboratório de IoC, beans e injeção por construtor. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=128689s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Configuração, perfis e ciclo de vida",
            criteria:
              "Mostrar qual configuração está ativa e uma falha de inicialização legível e sem segredos.",
            exercise:
              "Separe configuração local e de teste. Faça a aplicação recusar uma propriedade obrigatória ausente. Registre inicialização e encerramento de um recurso de laboratório.",
            resources: [
              {
                title: "Documentação · Spring por dentro",
                url: "https://docs.spring.io/spring-framework/reference/core.html",
                why: "Consulte depois da explicação e durante o laboratório de Configuração, perfis e ciclo de vida. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=128689s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Proxy, transações e fronteiras do serviço",
            criteria:
              "Explicar a fronteira real e demonstrar rollback por um teste de integração.",
            exercise:
              "Coloque criação de pedido e itens numa operação transacional. Teste uma falha entre as gravações. Compare chamada externa ao bean e chamada interna a um método anotado.",
            resources: [
              {
                title: "Documentação · Spring por dentro",
                url: "https://docs.spring.io/spring-framework/reference/core.html",
                why: "Consulte depois da explicação e durante o laboratório de Proxy, transações e fronteiras do serviço. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=128689s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · API com Spring Boot",
        topics: [
          {
            title: "Spring Boot e persistência",
            criteria:
              "Demonstrar CRUD, validação e testes em uma execução reproduzível.",
            exercise:
              "Exponha CRUD de livros com controller, serviço e repositório. Valide entrada e defina códigos HTTP. Adicione testes de criação, busca e atualização inválida.",
            resources: [
              {
                title: "Documentação · API com Spring Boot",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Spring Boot e persistência. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "DTOs, validação e tratamento global de erros",
            criteria:
              "Cobrir três classes de falha e manter um formato de erro documentado.",
            exercise:
              "Crie DTOs de entrada e saída. Implemente respostas de erro para validação, ausência e conflito. Teste o formato dos erros e a ausência de detalhes internos.",
            resources: [
              {
                title: "Documentação · API com Spring Boot",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de DTOs, validação e tratamento global de erros. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Spring Data, paginação e consultas eficientes",
            criteria:
              "Provar limites de entrada e estabilidade da paginação com dados repetidos.",
            exercise:
              "Implemente busca paginada por título e categoria. Limite tamanho de página e use ordenação com desempate. Conte consultas e evite N+1 em uma listagem de pedidos.",
            resources: [
              {
                title: "Documentação · API com Spring Boot",
                url: "https://docs.spring.io/spring-data/jpa/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Spring Data, paginação e consultas eficientes. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · segurança e identidade",
        topics: [
          {
            title: "Autenticação e autorização",
            criteria:
              "Demonstrar 401 e 403 nos cenários adequados e impedir acesso cruzado entre usuários.",
            exercise:
              "Proteja o endpoint de criação de pedidos. Adicione verificação de proprietário na consulta de pedido. Teste visitante, usuário sem permissão, dono e outro usuário.",
            resources: [
              {
                title: "Documentação · segurança e identidade",
                url: "https://docs.spring.io/spring-security/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Autenticação e autorização. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=150032s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "JWT, validade e resource server",
            criteria:
              "Provar rejeição das quatro entradas inválidas e não expor tokens nas respostas.",
            exercise:
              "Configure um resource server em um laboratório controlado. Teste token ausente, alterado, expirado e com audiência incorreta. Documente como a renovação será tratada pelo cliente autorizado.",
            resources: [
              {
                title: "Documentação · segurança e identidade",
                url: "https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html",
                why: "Consulte depois da explicação e durante o laboratório de JWT, validade e resource server. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=156988s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "OAuth2, OIDC, sessões e CSRF",
            criteria:
              "Explicar state, sessão e autorização local e demonstrar rejeição de callback ou origem inválidos.",
            exercise:
              "Desenhe o fluxo entre navegador, aplicação e provedor. Use um provedor de laboratório ou mocks para testar callback, state e negação de acesso. Teste uma ação autenticada com origem não permitida.",
            resources: [
              {
                title: "Documentação · segurança e identidade",
                url: "https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html",
                why: "Consulte depois da explicação e durante o laboratório de OAuth2, OIDC, sessões e CSRF. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=160832s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · testes de integração e observabilidade",
        topics: [
          {
            title: "Logs estruturados, contexto e dados sensíveis",
            criteria:
              "Investigar um pedido falho pelos logs sem depender do depurador nem de credenciais expostas.",
            exercise:
              "Adicione um identificador de correlação à criação de pedido. Registre sucesso, conflito e falha de dependência com campos definidos. Verifique que senhas, tokens e dados pessoais não aparecem.",
            resources: [
              {
                title: "Documentação · testes de integração e observabilidade",
                url: "https://logging.apache.org/log4j/2.x/manual/",
                why: "Consulte depois da explicação e durante o laboratório de Logs estruturados, contexto e dados sensíveis. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Métricas, Actuator e health checks",
            criteria:
              "Distinguir saúde, prontidão e desempenho e reproduzir uma falha observável.",
            exercise:
              "Adicione métricas de latência e falhas de pedidos. Defina health checks com exposição restrita. Simule banco indisponível e explique a resposta de cada verificação.",
            resources: [
              {
                title: "Documentação · testes de integração e observabilidade",
                url: "https://docs.spring.io/spring-boot/reference/actuator/",
                why: "Consulte depois da explicação e durante o laboratório de Métricas, Actuator e health checks. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Testes de fronteira e diagnóstico",
            criteria:
              "Executar o fluxo completo e explicar quais fronteiras reais foram verificadas.",
            exercise:
              "Crie testes de API para o fluxo de pedido. Teste conflito de estoque e indisponibilidade do banco em ambiente isolado. Registre uma falha e mostre o teste que impede sua regressão.",
            resources: [
              {
                title: "Documentação · testes de integração e observabilidade",
                url: "https://docs.spring.io/spring-boot/reference/actuator/",
                why: "Consulte depois da explicação e durante o laboratório de Testes de fronteira e diagnóstico. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · documentos e alternativas de dados",
        topics: [
          {
            title: "MongoDB e agregados de documentos",
            criteria:
              "Justificar o agregado e documentar os custos de duplicação e atualização.",
            exercise:
              "Modele uma projeção de catálogo como documento. Compare consulta e atualização com o modelo relacional. Explique como manter referências e duplicações consistentes.",
            resources: [
              {
                title: "Documentação · documentos e alternativas de dados",
                url: "https://docs.spring.io/spring-data/mongodb/reference/",
                why: "Consulte depois da explicação e durante o laboratório de MongoDB e agregados de documentos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=165783s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Índices, paginação e consistência da projeção",
            criteria:
              "Reconstruir a projeção e demonstrar tratamento de uma atualização duplicada.",
            exercise:
              "Crie um índice para uma consulta real do catálogo. Implemente uma projeção reconstruível a partir dos eventos de laboratório. Simule atraso e duplicação de atualização.",
            resources: [
              {
                title: "Documentação · documentos e alternativas de dados",
                url: "https://docs.spring.io/spring-data/mongodb/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Índices, paginação e consistência da projeção. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=165783s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · concorrência, JVM e desempenho",
        topics: [
          {
            title: "Threads, virtual threads e sincronização",
            criteria:
              "Reproduzir e corrigir a disputa e justificar o limite de concorrência.",
            exercise:
              "Reproduza uma condição de corrida no estoque em um laboratório. Corrija com uma estratégia explícita e compare alternativas. Teste carga pequena com limites de recursos definidos.",
            resources: [
              {
                title: "Documentação · concorrência, JVM e desempenho",
                url: "https://dev.java/learn/new-features/virtual-threads/",
                why: "Consulte depois da explicação e durante o laboratório de Threads, virtual threads e sincronização. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "JVM, memória e profiling",
            criteria:
              "Apresentar hipótese, medição antes/depois e limites da conclusão.",
            exercise:
              "Defina uma carga pequena e reproduzível. Observe JFR ou outra ferramenta do JDK e identifique uma retenção ou gargalo. Aplique uma mudança e repita a mesma medição.",
            resources: [
              {
                title: "Documentação · concorrência, JVM e desempenho",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de JVM, memória e profiling. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Cache, limites e degradação controlada",
            criteria:
              "Demonstrar invalidação, limite de memória e comportamento sem o cache.",
            exercise:
              "Adicione cache a uma consulta de catálogo com validade definida. Teste atualização de livro, expiração e falha do cache. Documente que dados podem ficar temporariamente desatualizados.",
            resources: [
              {
                title: "Documentação · concorrência, JVM e desempenho",
                url: "https://dev.java/learn/",
                why: "Consulte depois da explicação e durante o laboratório de Cache, limites e degradação controlada. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=0s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · containers e operação",
        topics: [
          {
            title: "Dockerfile, build reproduzível e Compose",
            criteria:
              "Construir e executar sem dependências da IDE e demonstrar que a imagem não contém segredos.",
            exercise:
              "Crie uma imagem da livraria com build separado da execução. Defina aplicação e banco em Compose com volume de laboratório. Suba a aplicação a partir de um ambiente limpo e execute o fluxo de pedido.",
            resources: [
              {
                title: "Documentação · containers e operação",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Dockerfile, build reproduzível e Compose. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=170303s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Linux, sinais, rede e encerramento seguro",
            criteria:
              "Diagnosticar as duas falhas e demonstrar encerramento controlado.",
            exercise:
              "Observe PID, porta e logs da aplicação em ambiente isolado. Envie um sinal de encerramento e acompanhe uma requisição em andamento. Reproduza um endereço de banco errado e uma porta indisponível.",
            resources: [
              {
                title: "Documentação · containers e operação",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Linux, sinais, rede e encerramento seguro. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=170303s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Deploy, rollback e orçamento operacional",
            criteria:
              "Executar um rollback verificável e explicar como detectar uma entrega com falha.",
            exercise:
              "Prepare um plano de entrega com configuração por ambiente. Simule uma versão defeituosa e execute rollback local. Documente backup, recuperação e uma estimativa de custo sem contratar recursos.",
            resources: [
              {
                title: "Documentação · containers e operação",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Deploy, rollback e orçamento operacional. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=170303s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · microsserviços e falhas distribuídas",
        topics: [
          {
            title: "Limites de serviço e contratos",
            criteria:
              "Justificar o limite e demonstrar o comportamento quando o catálogo está indisponível.",
            exercise:
              "Extraia catálogo e pedidos como serviços de laboratório. Documente seus contratos e donos dos dados. Compare o fluxo local com o fluxo de dois processos e descreva as novas falhas.",
            resources: [
              {
                title: "Documentação · microsserviços e falhas distribuídas",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Limites de serviço e contratos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Descoberta, gateway e configuração",
            criteria:
              "Explicar o caminho da chamada e localizar falhas em descoberta, rota e serviço separadamente.",
            exercise:
              "Registre duas instâncias de catálogo em um laboratório. Roteie uma chamada pelo gateway e observe qual instância respondeu. Troque uma configuração pública e registre quando ela passa a valer.",
            resources: [
              {
                title: "Documentação · microsserviços e falhas distribuídas",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Descoberta, gateway e configuração. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Resiliência, idempotência e consistência",
            criteria:
              "Medir o tempo máximo e provar ausência de duplicação sob repetição.",
            exercise:
              "Defina um orçamento de timeout para criar pedido. Simule resposta lenta e repetição da requisição. Adicione uma chave de idempotência e prove que apenas um pedido foi criado.",
            resources: [
              {
                title: "Documentação · microsserviços e falhas distribuídas",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Resiliência, idempotência e consistência. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · Kafka e processamento de eventos",
        topics: [
          {
            title: "Tópicos, partições, chaves e consumidores",
            criteria:
              "Demonstrar a relação entre chave, partição e paralelismo.",
            exercise:
              "Publique eventos de pedido com uma chave definida. Observe partições e consumidores em um laboratório. Explique quais eventos mantêm ordem e o que muda ao adicionar um consumidor.",
            resources: [
              {
                title: "Documentação · Kafka e processamento de eventos",
                url: "https://docs.spring.io/spring-kafka/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Tópicos, partições, chaves e consumidores. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Retries, duplicação, DLQ e outbox",
            criteria:
              "Provar que a falha do broker não perde o evento e que a reentrega não duplica o efeito.",
            exercise:
              "Registre um evento de pedido em outbox na mesma transação. Simule falha do broker e retome a publicação. Reentregue a mensagem e teste um consumidor idempotente.",
            resources: [
              {
                title: "Documentação · Kafka e processamento de eventos",
                url: "https://docs.spring.io/spring-kafka/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Retries, duplicação, DLQ e outbox. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · automação e entrega contínua",
        topics: [
          {
            title: "Pipeline: teste, build, imagem e promoção",
            criteria:
              "Demonstrar interrupção na falha e rastrear a entrega até o commit e o artefato corretos.",
            exercise:
              "Descreva etapas de teste, build e imagem para a livraria. Simule uma falha de teste e interrompa a promoção. Registre o identificador do artefato que será entregue.",
            resources: [
              {
                title: "Documentação · automação e entrega contínua",
                url: "https://www.jenkins.io/doc/book/pipeline/",
                why: "Consulte depois da explicação e durante o laboratório de Pipeline: teste, build, imagem e promoção. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=212204s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Ansible: estado desejado e idempotência",
            criteria:
              "Explicar o resultado da segunda aplicação e um procedimento de recuperação.",
            exercise:
              "Escreva um playbook de exemplo para um ambiente descartável. Execute ou revise uma primeira e uma segunda aplicação. Explique quais mudanças ocorreriam e como recuperar uma falha.",
            resources: [
              {
                title: "Documentação · automação e entrega contínua",
                url: "https://docs.ansible.com/ansible/latest/getting_started/index.html",
                why: "Consulte depois da explicação e durante o laboratório de Ansible: estado desejado e idempotência. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=205825s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Terraform: plano, estado e responsabilidade",
            criteria:
              "Explicar estado, plano e risco de cada tipo de alteração proposta.",
            exercise:
              "Modele uma arquitetura de exemplo em arquivos de laboratório. Revise um plano fictício com criação, alteração e remoção. Defina proteção de estado e procedimento de mudança sem contratar recursos.",
            resources: [
              {
                title: "Documentação · automação e entrega contínua",
                url: "https://developer.hashicorp.com/terraform/intro",
                why: "Consulte depois da explicação e durante o laboratório de Terraform: plano, estado e responsabilidade. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=216813s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado opcional · Spring AI e integração controlada",
        topics: [
          {
            title: "Modelo, prompt, resposta e teste de contrato",
            criteria:
              "Demonstrar o comportamento sob três respostas simuladas sem contratar um serviço.",
            exercise:
              "Defina um contrato para sugerir uma descrição curta de um livro. Implemente um fake que retorna sucesso, formato inválido e timeout. Valide o formato e mantenha a operação principal disponível quando a sugestão falhar.",
            resources: [
              {
                title: "Documentação · Spring AI e integração controlada",
                url: "https://docs.spring.io/spring-ai/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Modelo, prompt, resposta e teste de contrato. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=183641s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Contexto, busca e limites de uma resposta",
            criteria:
              "Rastrear a resposta até o contexto e demonstrar recusa quando não há base adequada.",
            exercise:
              "Monte um pequeno conjunto de descrições fictícias de livros. Selecione o contexto e teste uma pergunta com e sem resposta no conjunto. Defina quando o adaptador deve informar ausência de base suficiente.",
            resources: [
              {
                title: "Documentação · Spring AI e integração controlada",
                url: "https://docs.spring.io/spring-ai/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Contexto, busca e limites de uma resposta. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=183641s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Projeto final · revisão e demonstração",
        topics: [
          {
            title: "Projeto final Java",
            criteria:
              "Executar em ambiente limpo, passar os testes e explicar as decisões e limites em uma revisão.",
            exercise:
              "Entregue a livraria com catálogo, pedidos e estoque. Inclua autenticação, testes de integração, logs, imagem e instruções de execução. Demonstre conflito de estoque, falha de dependência e rollback de uma versão.",
            resources: [
              {
                title: "Documentação · revisão e demonstração",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Projeto final Java. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Revisão espaçada e defesa de decisões",
            criteria:
              "Explicar o fluxo completo e adaptar uma regra com teste sem depender de um tutorial passo a passo.",
            exercise:
              "Sem consultar o guia, desenhe o fluxo de criação de pedido. Explique autorização, transação e entrega do evento. Mude um requisito pequeno, adapte o teste e registre o motivo da decisão.",
            resources: [
              {
                title: "Documentação · revisão e demonstração",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Revisão espaçada e defesa de decisões. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
    ],
  },
  "Spring Boot": {
    objective:
      "Entregar uma API de livraria com persistência, segurança, testes, observabilidade e execução reproduzível.",
    prerequisites:
      "Java: tipos, orientação a objetos, coleções, exceções e testes. Se estiver começando do zero, use primeiro a formação Java completa.",
    modules: [
      {
        title: "Básico · container Spring e configuração",
        topics: [
          {
            title: "IoC, beans e injeção por construtor",
            criteria:
              "Explicar quem cria cada objeto e testar a regra sem contexto Spring.",
            exercise:
              "Transforme o serviço de reservas em um bean. Injete a interface de repositório pelo construtor. Execute um teste de regra instanciando o serviço diretamente com um fake.",
            resources: [
              {
                title: "Documentação · Spring por dentro",
                url: "https://docs.spring.io/spring-framework/reference/core.html",
                why: "Consulte depois da explicação e durante o laboratório de IoC, beans e injeção por construtor. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=128689s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Configuração, perfis e ciclo de vida",
            criteria:
              "Mostrar qual configuração está ativa e uma falha de inicialização legível e sem segredos.",
            exercise:
              "Separe configuração local e de teste. Faça a aplicação recusar uma propriedade obrigatória ausente. Registre inicialização e encerramento de um recurso de laboratório.",
            resources: [
              {
                title: "Documentação · Spring por dentro",
                url: "https://docs.spring.io/spring-framework/reference/core.html",
                why: "Consulte depois da explicação e durante o laboratório de Configuração, perfis e ciclo de vida. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=128689s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Proxy, transações e fronteiras do serviço",
            criteria:
              "Explicar a fronteira real e demonstrar rollback por um teste de integração.",
            exercise:
              "Coloque criação de pedido e itens numa operação transacional. Teste uma falha entre as gravações. Compare chamada externa ao bean e chamada interna a um método anotado.",
            resources: [
              {
                title: "Documentação · Spring por dentro",
                url: "https://docs.spring.io/spring-framework/reference/core.html",
                why: "Consulte depois da explicação e durante o laboratório de Proxy, transações e fronteiras do serviço. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=128689s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · SQL e JDBC",
        topics: [
          {
            title: "Modelo relacional, joins e restrições",
            criteria:
              "Explicar a cardinalidade das consultas e provar que o banco rejeita dados inconsistentes.",
            exercise:
              "Modele livro, pedido e item de pedido. Adicione restrições e consultas de pedidos com seus itens. Teste identificador duplicado e referência inexistente.",
            resources: [
              {
                title: "Documentação · SQL e JDBC",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Consulte depois da explicação e durante o laboratório de Modelo relacional, joins e restrições. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=94348s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "JDBC, consultas parametrizadas e transações",
            criteria:
              "Provar que uma falha no item não deixa um pedido incompleto persistido.",
            exercise:
              "Implemente um repositório JDBC para o catálogo. Use parâmetros em busca e atualização. Crie um pedido e simule falha após inserir o cabeçalho para validar rollback.",
            resources: [
              {
                title: "Documentação · SQL e JDBC",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Consulte depois da explicação e durante o laboratório de JDBC, consultas parametrizadas e transações. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=94348s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Índices, concorrência e custo de consulta",
            criteria:
              "Reproduzir a disputa e demonstrar que o estoque não fica negativo.",
            exercise:
              "Analise uma consulta com EXPLAIN. Compare um índice adequado com o plano anterior. Simule duas reservas concorrentes e registre a estratégia que mantém o estoque correto.",
            resources: [
              {
                title: "Documentação · SQL e JDBC",
                url: "https://www.postgresql.org/docs/current/tutorial.html",
                why: "Consulte depois da explicação e durante o laboratório de Índices, concorrência e custo de consulta. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=94348s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · ORM e Hibernate",
        topics: [
          {
            title: "Entidades, estados e mapeamentos",
            criteria:
              "Explicar o SQL produzido e o momento em que a alteração se torna persistente.",
            exercise:
              "Mapeie Livro e Categoria em um projeto de laboratório. Observe SQL de inserção e atualização. Compare uma entidade gerenciada e um objeto fora do contexto de persistência.",
            resources: [
              {
                title: "Documentação · ORM e Hibernate",
                url: "https://hibernate.org/orm/documentation/",
                why: "Consulte depois da explicação e durante o laboratório de Entidades, estados e mapeamentos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=125591s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Relacionamentos, N+1 e limites de carregamento",
            criteria:
              "Medir o número de consultas e manter o contrato da API sem consultas inesperadas.",
            exercise:
              "Liste pedidos com itens e conte consultas. Reproduza N+1 e corrija a consulta com uma estratégia justificada. Crie DTOs para a resposta, sem depender da sessão aberta na serialização.",
            resources: [
              {
                title: "Documentação · ORM e Hibernate",
                url: "https://hibernate.org/orm/documentation/",
                why: "Consulte depois da explicação e durante o laboratório de Relacionamentos, N+1 e limites de carregamento. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=125591s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Migrações, locking e evolução de schema",
            criteria:
              "Demonstrar conflito controlado e uma migração que preserva dados.",
            exercise:
              "Adicione versão à entidade que controla estoque. Simule duas atualizações concorrentes. Escreva uma migração que adicione um campo sem apagar registros existentes.",
            resources: [
              {
                title: "Documentação · ORM e Hibernate",
                url: "https://hibernate.org/orm/documentation/",
                why: "Consulte depois da explicação e durante o laboratório de Migrações, locking e evolução de schema. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=125591s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · API com Spring Boot",
        topics: [
          {
            title: "Spring Boot e persistência",
            criteria:
              "Demonstrar CRUD, validação e testes em uma execução reproduzível.",
            exercise:
              "Exponha CRUD de livros com controller, serviço e repositório. Valide entrada e defina códigos HTTP. Adicione testes de criação, busca e atualização inválida.",
            resources: [
              {
                title: "Documentação · API com Spring Boot",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Spring Boot e persistência. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "DTOs, validação e tratamento global de erros",
            criteria:
              "Cobrir três classes de falha e manter um formato de erro documentado.",
            exercise:
              "Crie DTOs de entrada e saída. Implemente respostas de erro para validação, ausência e conflito. Teste o formato dos erros e a ausência de detalhes internos.",
            resources: [
              {
                title: "Documentação · API com Spring Boot",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de DTOs, validação e tratamento global de erros. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Spring Data, paginação e consultas eficientes",
            criteria:
              "Provar limites de entrada e estabilidade da paginação com dados repetidos.",
            exercise:
              "Implemente busca paginada por título e categoria. Limite tamanho de página e use ordenação com desempate. Conte consultas e evite N+1 em uma listagem de pedidos.",
            resources: [
              {
                title: "Documentação · API com Spring Boot",
                url: "https://docs.spring.io/spring-data/jpa/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Spring Data, paginação e consultas eficientes. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · segurança e identidade",
        topics: [
          {
            title: "Autenticação e autorização",
            criteria:
              "Demonstrar 401 e 403 nos cenários adequados e impedir acesso cruzado entre usuários.",
            exercise:
              "Proteja o endpoint de criação de pedidos. Adicione verificação de proprietário na consulta de pedido. Teste visitante, usuário sem permissão, dono e outro usuário.",
            resources: [
              {
                title: "Documentação · segurança e identidade",
                url: "https://docs.spring.io/spring-security/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Autenticação e autorização. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=150032s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "JWT, validade e resource server",
            criteria:
              "Provar rejeição das quatro entradas inválidas e não expor tokens nas respostas.",
            exercise:
              "Configure um resource server em um laboratório controlado. Teste token ausente, alterado, expirado e com audiência incorreta. Documente como a renovação será tratada pelo cliente autorizado.",
            resources: [
              {
                title: "Documentação · segurança e identidade",
                url: "https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html",
                why: "Consulte depois da explicação e durante o laboratório de JWT, validade e resource server. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=156988s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "OAuth2, OIDC, sessões e CSRF",
            criteria:
              "Explicar state, sessão e autorização local e demonstrar rejeição de callback ou origem inválidos.",
            exercise:
              "Desenhe o fluxo entre navegador, aplicação e provedor. Use um provedor de laboratório ou mocks para testar callback, state e negação de acesso. Teste uma ação autenticada com origem não permitida.",
            resources: [
              {
                title: "Documentação · segurança e identidade",
                url: "https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html",
                why: "Consulte depois da explicação e durante o laboratório de OAuth2, OIDC, sessões e CSRF. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=160832s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · testes de integração e observabilidade",
        topics: [
          {
            title: "Logs estruturados, contexto e dados sensíveis",
            criteria:
              "Investigar um pedido falho pelos logs sem depender do depurador nem de credenciais expostas.",
            exercise:
              "Adicione um identificador de correlação à criação de pedido. Registre sucesso, conflito e falha de dependência com campos definidos. Verifique que senhas, tokens e dados pessoais não aparecem.",
            resources: [
              {
                title: "Documentação · testes de integração e observabilidade",
                url: "https://logging.apache.org/log4j/2.x/manual/",
                why: "Consulte depois da explicação e durante o laboratório de Logs estruturados, contexto e dados sensíveis. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Métricas, Actuator e health checks",
            criteria:
              "Distinguir saúde, prontidão e desempenho e reproduzir uma falha observável.",
            exercise:
              "Adicione métricas de latência e falhas de pedidos. Defina health checks com exposição restrita. Simule banco indisponível e explique a resposta de cada verificação.",
            resources: [
              {
                title: "Documentação · testes de integração e observabilidade",
                url: "https://docs.spring.io/spring-boot/reference/actuator/",
                why: "Consulte depois da explicação e durante o laboratório de Métricas, Actuator e health checks. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Testes de fronteira e diagnóstico",
            criteria:
              "Executar o fluxo completo e explicar quais fronteiras reais foram verificadas.",
            exercise:
              "Crie testes de API para o fluxo de pedido. Teste conflito de estoque e indisponibilidade do banco em ambiente isolado. Registre uma falha e mostre o teste que impede sua regressão.",
            resources: [
              {
                title: "Documentação · testes de integração e observabilidade",
                url: "https://docs.spring.io/spring-boot/reference/actuator/",
                why: "Consulte depois da explicação e durante o laboratório de Testes de fronteira e diagnóstico. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · documentos e alternativas de dados",
        topics: [
          {
            title: "MongoDB e agregados de documentos",
            criteria:
              "Justificar o agregado e documentar os custos de duplicação e atualização.",
            exercise:
              "Modele uma projeção de catálogo como documento. Compare consulta e atualização com o modelo relacional. Explique como manter referências e duplicações consistentes.",
            resources: [
              {
                title: "Documentação · documentos e alternativas de dados",
                url: "https://docs.spring.io/spring-data/mongodb/reference/",
                why: "Consulte depois da explicação e durante o laboratório de MongoDB e agregados de documentos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=165783s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Índices, paginação e consistência da projeção",
            criteria:
              "Reconstruir a projeção e demonstrar tratamento de uma atualização duplicada.",
            exercise:
              "Crie um índice para uma consulta real do catálogo. Implemente uma projeção reconstruível a partir dos eventos de laboratório. Simule atraso e duplicação de atualização.",
            resources: [
              {
                title: "Documentação · documentos e alternativas de dados",
                url: "https://docs.spring.io/spring-data/mongodb/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Índices, paginação e consistência da projeção. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=165783s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · containers e operação",
        topics: [
          {
            title: "Dockerfile, build reproduzível e Compose",
            criteria:
              "Construir e executar sem dependências da IDE e demonstrar que a imagem não contém segredos.",
            exercise:
              "Crie uma imagem da livraria com build separado da execução. Defina aplicação e banco em Compose com volume de laboratório. Suba a aplicação a partir de um ambiente limpo e execute o fluxo de pedido.",
            resources: [
              {
                title: "Documentação · containers e operação",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Dockerfile, build reproduzível e Compose. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=170303s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Linux, sinais, rede e encerramento seguro",
            criteria:
              "Diagnosticar as duas falhas e demonstrar encerramento controlado.",
            exercise:
              "Observe PID, porta e logs da aplicação em ambiente isolado. Envie um sinal de encerramento e acompanhe uma requisição em andamento. Reproduza um endereço de banco errado e uma porta indisponível.",
            resources: [
              {
                title: "Documentação · containers e operação",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Linux, sinais, rede e encerramento seguro. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=170303s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Deploy, rollback e orçamento operacional",
            criteria:
              "Executar um rollback verificável e explicar como detectar uma entrega com falha.",
            exercise:
              "Prepare um plano de entrega com configuração por ambiente. Simule uma versão defeituosa e execute rollback local. Documente backup, recuperação e uma estimativa de custo sem contratar recursos.",
            resources: [
              {
                title: "Documentação · containers e operação",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Deploy, rollback e orçamento operacional. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=170303s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · microsserviços e falhas distribuídas",
        topics: [
          {
            title: "Limites de serviço e contratos",
            criteria:
              "Justificar o limite e demonstrar o comportamento quando o catálogo está indisponível.",
            exercise:
              "Extraia catálogo e pedidos como serviços de laboratório. Documente seus contratos e donos dos dados. Compare o fluxo local com o fluxo de dois processos e descreva as novas falhas.",
            resources: [
              {
                title: "Documentação · microsserviços e falhas distribuídas",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Limites de serviço e contratos. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Descoberta, gateway e configuração",
            criteria:
              "Explicar o caminho da chamada e localizar falhas em descoberta, rota e serviço separadamente.",
            exercise:
              "Registre duas instâncias de catálogo em um laboratório. Roteie uma chamada pelo gateway e observe qual instância respondeu. Troque uma configuração pública e registre quando ela passa a valer.",
            resources: [
              {
                title: "Documentação · microsserviços e falhas distribuídas",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Descoberta, gateway e configuração. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Resiliência, idempotência e consistência",
            criteria:
              "Medir o tempo máximo e provar ausência de duplicação sob repetição.",
            exercise:
              "Defina um orçamento de timeout para criar pedido. Simule resposta lenta e repetição da requisição. Adicione uma chave de idempotência e prove que apenas um pedido foi criado.",
            resources: [
              {
                title: "Documentação · microsserviços e falhas distribuídas",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Resiliência, idempotência e consistência. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · Kafka e processamento de eventos",
        topics: [
          {
            title: "Tópicos, partições, chaves e consumidores",
            criteria:
              "Demonstrar a relação entre chave, partição e paralelismo.",
            exercise:
              "Publique eventos de pedido com uma chave definida. Observe partições e consumidores em um laboratório. Explique quais eventos mantêm ordem e o que muda ao adicionar um consumidor.",
            resources: [
              {
                title: "Documentação · Kafka e processamento de eventos",
                url: "https://docs.spring.io/spring-kafka/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Tópicos, partições, chaves e consumidores. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Retries, duplicação, DLQ e outbox",
            criteria:
              "Provar que a falha do broker não perde o evento e que a reentrega não duplica o efeito.",
            exercise:
              "Registre um evento de pedido em outbox na mesma transação. Simule falha do broker e retome a publicação. Reentregue a mensagem e teste um consumidor idempotente.",
            resources: [
              {
                title: "Documentação · Kafka e processamento de eventos",
                url: "https://docs.spring.io/spring-kafka/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Retries, duplicação, DLQ e outbox. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado opcional · Spring AI e integração controlada",
        topics: [
          {
            title: "Modelo, prompt, resposta e teste de contrato",
            criteria:
              "Demonstrar o comportamento sob três respostas simuladas sem contratar um serviço.",
            exercise:
              "Defina um contrato para sugerir uma descrição curta de um livro. Implemente um fake que retorna sucesso, formato inválido e timeout. Valide o formato e mantenha a operação principal disponível quando a sugestão falhar.",
            resources: [
              {
                title: "Documentação · Spring AI e integração controlada",
                url: "https://docs.spring.io/spring-ai/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Modelo, prompt, resposta e teste de contrato. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=183641s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Contexto, busca e limites de uma resposta",
            criteria:
              "Rastrear a resposta até o contexto e demonstrar recusa quando não há base adequada.",
            exercise:
              "Monte um pequeno conjunto de descrições fictícias de livros. Selecione o contexto e teste uma pergunta com e sem resposta no conjunto. Defina quando o adaptador deve informar ausência de base suficiente.",
            resources: [
              {
                title: "Documentação · Spring AI e integração controlada",
                url: "https://docs.spring.io/spring-ai/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Contexto, busca e limites de uma resposta. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=183641s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Projeto final · revisão e demonstração",
        topics: [
          {
            title: "Projeto final Java",
            criteria:
              "Executar em ambiente limpo, passar os testes e explicar as decisões e limites em uma revisão.",
            exercise:
              "Entregue a livraria com catálogo, pedidos e estoque. Inclua autenticação, testes de integração, logs, imagem e instruções de execução. Demonstre conflito de estoque, falha de dependência e rollback de uma versão.",
            resources: [
              {
                title: "Documentação · revisão e demonstração",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Projeto final Java. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Revisão espaçada e defesa de decisões",
            criteria:
              "Explicar o fluxo completo e adaptar uma regra com teste sem depender de um tutorial passo a passo.",
            exercise:
              "Sem consultar o guia, desenhe o fluxo de criação de pedido. Explique autorização, transação e entrega do evento. Mude um requisito pequeno, adapte o teste e registre o motivo da decisão.",
            resources: [
              {
                title: "Documentação · revisão e demonstração",
                url: "https://docs.spring.io/spring-boot/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Revisão espaçada e defesa de decisões. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=135500s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
    ],
  },
  "Spring Cloud": {
    objective:
      "Construir e investigar um sistema de catálogo e pedidos com descoberta, configuração, gateway, resiliência, eventos, segurança e operação. As falhas são parte obrigatória de cada laboratório.",
    prerequisites:
      "Java, Spring Boot, HTTP, SQL, testes e Docker. A especialização Spring Boot prepara essas bases; comece por ela se ainda não implementou uma API com banco e autorização.",
    modules: [
      {
        title: "Básico · fundamentos e compatibilidade",
        topics: [
          {
            title: "Configurar os serviços",
            criteria:
              "Executar os dois serviços e justificar as versões com a matriz oficial.",
            exercise:
              "Consulte a matriz oficial de compatibilidade e registre a combinação escolhida. Crie catálogo e pedidos com um endpoint e um teste cada. Execute ambos com portas e configurações distintas e registre os comandos de build.",
            resources: [
              {
                title: "Documentação · fundamentos e compatibilidade",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Configurar os serviços. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Limites dos serviços e comunicação HTTP",
            criteria:
              "Explicar o dono de cada dado e reproduzir uma falha de rede controlada.",
            exercise:
              "Desenhe a criação de pedido com consulta ao catálogo. Defina sucesso, ausência, conflito e indisponibilidade no contrato. Simule catálogo fora do ar e observe a diferença entre erro de rede e erro de negócio.",
            resources: [
              {
                title: "Documentação · fundamentos e compatibilidade",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Limites dos serviços e comunicação HTTP. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Configuração por ambiente",
            criteria:
              "Demonstrar configuração válida e falha explícita sem imprimir credenciais.",
            exercise:
              "Separe portas, nomes e endereços por ambiente de laboratório. Mantenha exemplos sem credenciais reais. Teste variável ausente e endereço inválido e documente a mensagem esperada.",
            resources: [
              {
                title: "Documentação · fundamentos e compatibilidade",
                url: "https://spring.io/projects/spring-cloud",
                why: "Consulte depois da explicação e durante o laboratório de Configuração por ambiente. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · descoberta de serviços",
        topics: [
          {
            title: "Service Discovery com Eureka",
            criteria:
              "Explicar registro e resolução e medir o efeito de uma instância indisponível.",
            exercise:
              "Suba um servidor Eureka e registre duas instâncias de catálogo. Registre identificador, porta e informações de saúde de cada instância. Derrube uma instância e observe o tempo até os clientes deixarem de usá-la.",
            resources: [
              {
                title: "Documentação · descoberta de serviços",
                url: "https://docs.spring.io/spring-cloud-netflix/reference/spring-cloud-netflix.html",
                why: "Consulte depois da explicação e durante o laboratório de Service Discovery com Eureka. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Balanceamento entre instâncias",
            criteria:
              "Comprovar resolução por nome e explicar o destino observado nas chamadas.",
            exercise:
              "Identifique a instância que responde a cada requisição. Faça chamadas por nome lógico com duas instâncias ativas. Compare distribuição, falha de uma instância e retomada após recuperação.",
            resources: [
              {
                title: "Documentação · descoberta de serviços",
                url: "https://docs.spring.io/spring-cloud-commons/reference/spring-cloud-commons/loadbalancer.html",
                why: "Consulte depois da explicação e durante o laboratório de Balanceamento entre instâncias. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Falhas de descoberta e alternativas",
            criteria:
              "Descrever o comportamento com registry indisponível e justificar uma alternativa.",
            exercise:
              "Interrompa o registry em um laboratório e faça novas chamadas. Compare instâncias previamente conhecidas e uma instância recém-criada. Escreva uma decisão sobre registry ou descoberta da plataforma para dois cenários.",
            resources: [
              {
                title: "Documentação · descoberta de serviços",
                url: "https://docs.spring.io/spring-cloud-netflix/reference/spring-cloud-netflix.html",
                why: "Consulte depois da explicação e durante o laboratório de Falhas de descoberta e alternativas. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · configuração centralizada",
        topics: [
          {
            title: "Config Server e cliente",
            criteria:
              "Rastrear a origem e a atualização de uma propriedade com evidência observável.",
            exercise:
              "Use um repositório de laboratório sem dados pessoais como origem. Configure um cliente e observe a origem de uma propriedade. Altere a propriedade, teste o mecanismo escolhido de atualização e registre quais valores exigem reinício.",
            resources: [
              {
                title: "Documentação · configuração centralizada",
                url: "https://docs.spring.io/spring-cloud-config/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Config Server e cliente. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Disponibilidade e proteção da configuração",
            criteria:
              "Demonstrar acesso negado e comportamento definido quando a configuração remota falha.",
            exercise:
              "Restrinja acesso ao servidor de configuração no laboratório. Simule indisponibilidade na inicialização de um cliente. Documente a estratégia de recuperação e teste a ausência de uma propriedade obrigatória.",
            resources: [
              {
                title: "Documentação · configuração centralizada",
                url: "https://docs.spring.io/spring-cloud-config/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Disponibilidade e proteção da configuração. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Versionamento e mudança compatível",
            criteria:
              "Executar mudança e retorno sem deixar um consumidor em estado indefinido.",
            exercise:
              "Crie duas versões de uma propriedade de negócio fictícia. Execute clientes com configurações diferentes. Faça rollback da configuração e verifique o valor efetivamente utilizado.",
            resources: [
              {
                title: "Documentação · configuração centralizada",
                url: "https://docs.spring.io/spring-cloud-config/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Versionamento e mudança compatível. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · gateway e fronteira HTTP",
        topics: [
          {
            title: "Rotas e filtros do Gateway",
            criteria:
              "Explicar predicados e ordem dos filtros e demonstrar cada resposta de falha.",
            exercise:
              "Roteie catálogo e pedidos por caminhos distintos. Propague um identificador de correlação. Teste rota inexistente, serviço indisponível e uma alteração de cabeçalho.",
            resources: [
              {
                title: "Documentação · gateway e fronteira HTTP",
                url: "https://docs.spring.io/spring-cloud-gateway/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Rotas e filtros do Gateway. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Validação, CORS e limites da borda",
            criteria:
              "Distinguir CORS, autenticação e limitação de recursos com testes separados.",
            exercise:
              "Defina origem permitida para um frontend de laboratório. Teste preflight permitido e origem recusada. Limite payload e uma taxa de chamadas simuladas com resposta clara.",
            resources: [
              {
                title: "Documentação · gateway e fronteira HTTP",
                url: "https://docs.spring.io/spring-cloud-gateway/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Validação, CORS e limites da borda. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Timeouts e rastreabilidade das chamadas",
            criteria:
              "Localizar a etapa lenta e explicar o tempo máximo da operação.",
            exercise:
              "Defina um orçamento total de tempo para uma consulta. Simule lentidão no catálogo e meça a resposta no gateway. Correlacione os logs das duas camadas e verifique cancelamento quando disponível.",
            resources: [
              {
                title: "Documentação · gateway e fronteira HTTP",
                url: "https://docs.spring.io/spring-cloud-gateway/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Timeouts e rastreabilidade das chamadas. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · resiliência e repetição segura",
        topics: [
          {
            title: "Circuit breaker e fallback",
            criteria:
              "Explicar os estados e demonstrar uma recuperação sem fabricar dados de negócio.",
            exercise:
              "Simule sucessos, erros e respostas lentas do catálogo. Observe abertura, espera e tentativas de recuperação do circuito. Implemente fallback que preserve a distinção entre dado conhecido e indisponibilidade.",
            resources: [
              {
                title: "Documentação · resiliência e repetição segura",
                url: "https://docs.spring.io/spring-cloud-circuitbreaker/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Circuit breaker e fallback. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Retries e idempotência",
            criteria:
              "Provar um único efeito para a mesma chave e um número máximo de tentativas.",
            exercise:
              "Crie o mesmo pedido duas vezes com a mesma chave. Simule uma resposta perdida depois da gravação. Adicione limite de tentativas e teste que uma falha permanente não causa repetição infinita.",
            resources: [
              {
                title: "Documentação · resiliência e repetição segura",
                url: "https://docs.spring.io/spring-cloud-circuitbreaker/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Retries e idempotência. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Isolamento, carga e degradação",
            criteria:
              "Mostrar isolamento entre rotas e explicar o limite observado sob falha.",
            exercise:
              "Defina limites pequenos em um laboratório e gere uma carga controlada. Observe fila, tempo de resposta e recusas. Interrompa a dependência e demonstre que uma rota independente continua atendendo.",
            resources: [
              {
                title: "Documentação · resiliência e repetição segura",
                url: "https://docs.spring.io/spring-cloud-circuitbreaker/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Isolamento, carga e degradação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · contratos entre serviços",
        topics: [
          {
            title: "Testes de contrato",
            criteria:
              "Demonstrar detecção de uma alteração incompatível antes da entrega.",
            exercise:
              "Defina o contrato da consulta de livro usada por pedidos. Valide o provedor e um consumidor contra esses exemplos. Remova ou altere um campo necessário e mostre o teste falhando.",
            resources: [
              {
                title: "Documentação · contratos entre serviços",
                url: "https://docs.spring.io/spring-cloud-contract/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Testes de contrato. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Evolução de contrato e compatibilidade",
            criteria:
              "Explicar e testar uma sequência de evolução que mantenha consumidores atendidos.",
            exercise:
              "Desenhe a adição de um campo opcional ao contrato. Teste consumidor antigo com provedor novo e o cenário inverso relevante. Registre a ordem de uma mudança incompatível em etapas.",
            resources: [
              {
                title: "Documentação · contratos entre serviços",
                url: "https://docs.spring.io/spring-cloud-contract/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Evolução de contrato e compatibilidade. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=187688s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · eventos e consistência",
        topics: [
          {
            title: "Eventos com Spring Cloud Stream",
            criteria:
              "Rastrear um evento do produtor ao efeito e explicar a confirmação do processamento.",
            exercise:
              "Publique pedido criado com identificador e versão de schema. Implemente um consumidor de reserva de estoque. Observe sucesso, erro de processamento e reentrega num broker de laboratório.",
            resources: [
              {
                title: "Documentação · eventos e consistência",
                url: "https://docs.spring.io/spring-cloud-stream/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Eventos com Spring Cloud Stream. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Duplicidade e mensagens com erro",
            criteria:
              "Demonstrar reentrega sem duplicação e um procedimento de recuperação verificável.",
            exercise:
              "Reentregue uma mensagem já processada. Envie uma mensagem com schema inválido e observe o destino de erro. Corrija a causa em laboratório e reprocese com proteção de idempotência.",
            resources: [
              {
                title: "Documentação · eventos e consistência",
                url: "https://docs.spring.io/spring-cloud-stream/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Duplicidade e mensagens com erro. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Outbox, saga e compensação",
            criteria:
              "Explicar a garantia de cada etapa e demonstrar recuperação de uma falha intermediária.",
            exercise:
              "Registre a intenção de evento junto do pedido. Simule falha de publicação e retome a entrega. Desenhe reserva, confirmação e cancelamento com um caminho de compensação e teste a falha de um passo.",
            resources: [
              {
                title: "Documentação · eventos e consistência",
                url: "https://docs.spring.io/spring-cloud-stream/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Outbox, saga e compensação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=195320s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · observabilidade e autorização",
        topics: [
          {
            title: "Health checks, métricas e traces",
            criteria:
              "Localizar uma falha distribuída usando sinais correlacionados.",
            exercise:
              "Correlacione gateway, pedidos e catálogo. Defina uma métrica de falha e observe latência entre serviços. Simule uma dependência lenta e explique saúde, prontidão e diagnóstico.",
            resources: [
              {
                title: "Documentação · observabilidade e autorização",
                url: "https://docs.spring.io/spring-boot/reference/actuator/",
                why: "Consulte depois da explicação e durante o laboratório de Health checks, métricas e traces. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Autorização com tokens",
            criteria:
              "Provar proteção no serviço e explicar o limite de confiança de cada chamada.",
            exercise:
              "Proteja uma consulta de pedido pelo dono. Teste acesso pelo gateway e acesso direto ao serviço. Recuse token expirado, alterado e sem a permissão necessária.",
            resources: [
              {
                title: "Documentação · observabilidade e autorização",
                url: "https://docs.spring.io/spring-security/reference/",
                why: "Consulte depois da explicação e durante o laboratório de Autorização com tokens. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Operação sem segredos em logs",
            criteria:
              "Demonstrar rastreabilidade com ausência de credenciais nos registros de observação.",
            exercise:
              "Execute uma chamada com credencial fictícia identificável. Inspecione logs e respostas em cada serviço. Garanta que o identificador de correlação permita investigar sem registrar a credencial.",
            resources: [
              {
                title: "Documentação · observabilidade e autorização",
                url: "https://docs.spring.io/spring-boot/reference/actuator/",
                why: "Consulte depois da explicação e durante o laboratório de Operação sem segredos em logs. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=161788s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
      {
        title: "Projeto final · entrega e testes de falha",
        topics: [
          {
            title: "Executar o sistema com Docker Compose",
            criteria:
              "Subir o ambiente a partir de instruções e demonstrar recuperação de inicialização.",
            exercise:
              "Monte gateway, descoberta, catálogo, pedidos e broker no laboratório. Separe configuração pública de segredos fictícios. Recrie o ambiente e teste inicialização com uma dependência lenta.",
            resources: [
              {
                title: "Documentação · entrega e testes de falha",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Executar o sistema com Docker Compose. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=178226s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
          {
            title: "Teste ponta a ponta e documentação das decisões",
            criteria:
              "Reproduzir os cenários de falha e defender as garantias com evidência.",
            exercise:
              "Demonstre criação de pedido, reserva e evento de conclusão. Teste resposta perdida, reentrega e indisponibilidade do catálogo. Entregue contratos, diagramas, decisões, comandos e roteiro de recuperação.",
            resources: [
              {
                title: "Documentação · entrega e testes de falha",
                url: "https://docs.docker.com/compose/",
                why: "Consulte depois da explicação e durante o laboratório de Teste ponta a ponta e documentação das decisões. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
              {
                title: "Telusko · capítulo de apoio",
                url: "https://www.youtube.com/watch?v=q6z_UCBM5Ek&t=178226s",
                why: "Este link abre no início do capítulo conferido na descrição do autor. Assista ao trecho do assunto, pause para implementar e compare com a documentação atual. O exercício e o roteiro desta trilha são próprios.",
              },
            ],
          },
        ],
      },
    ],
  },
  Go: {
    objective:
      "Construir uma biblioteca em Go com CLI, API HTTP, persistência, testes de falha, concorrência controlada e diagnóstico.",
    prerequisites:
      "Lógica e terminal. Trabalhe em ambiente de laboratório; as aulas avançam pela mesma aplicação.",
    modules: [
      {
        title: "Básico · ambiente e execução",
        topics: [
          {
            title: "Instalação, módulos e primeiro programa",
            criteria:
              "Executar os três comandos e explicar o papel de go.mod e do binário gerado.",
            exercise:
              "Crie um módulo da biblioteca e execute um Hello, World. Compare go run, go test e go build. Introduza um erro de compilação e explique a mensagem.",
            resources: [
              {
                title: "Documentação · ambiente e execução",
                url: "https://go.dev/tour/",
                why: "Consulte depois da explicação e durante o laboratório de Instalação, módulos e primeiro programa. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Tipos, funções e controle de fluxo",
            criteria:
              "Demonstrar entrada válida, vazia e inválida com resultados previsíveis.",
            exercise:
              "Crie um menu de cadastro de livros. Valide quantidade e título. Extraia as regras para funções e teste chamadas sem abrir o terminal.",
            resources: [
              {
                title: "Documentação · ambiente e execução",
                url: "https://go.dev/tour/",
                why: "Consulte depois da explicação e durante o laboratório de Tipos, funções e controle de fluxo. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
      {
        title: "Básico · coleções e interfaces",
        topics: [
          {
            title: "Slices, mapas, structs e ponteiros",
            criteria:
              "Explicar tamanho, capacidade e compartilhamento com um exemplo reproduzível.",
            exercise:
              "Modele Livro e uma coleção de catálogo. Mostre duas slices que compartilham dados. Crie uma função que retorna uma cópia adequada e prove a separação.",
            resources: [
              {
                title: "Documentação · coleções e interfaces",
                url: "https://go.dev/tour/",
                why: "Consulte depois da explicação e durante o laboratório de Slices, mapas, structs e ponteiros. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Métodos, interfaces e composição",
            criteria:
              "Trocar a persistência sem alterar a regra de empréstimo.",
            exercise:
              "Defina o contrato de armazenamento usado pela regra de empréstimo. Implemente um fake em memória. Teste a regra sem persistência nem servidor HTTP.",
            resources: [
              {
                title: "Documentação · coleções e interfaces",
                url: "https://go.dev/tour/",
                why: "Consulte depois da explicação e durante o laboratório de Métodos, interfaces e composição. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · erros e testes",
        topics: [
          {
            title: "Erros explícitos e contexto da falha",
            criteria:
              "Distinguir falhas de domínio e infraestrutura com testes observáveis.",
            exercise:
              "Defina erros para livro ausente e estoque insuficiente. Propague uma falha de gravação com contexto. Teste que a fronteira escolhe a resposta correta para cada erro.",
            resources: [
              {
                title: "Documentação · erros e testes",
                url: "https://pkg.go.dev/testing",
                why: "Consulte depois da explicação e durante o laboratório de Erros explícitos e contexto da falha. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Testes de tabela, cobertura e fuzzing",
            criteria:
              "Demonstrar um teste que detecta uma regressão real e explicar a propriedade do fuzzing.",
            exercise:
              "Crie uma tabela de validação de identificadores. Cubra limites e entradas vazias. Adicione um fuzz test que preserve a propriedade definida e examine uma falha introduzida de propósito.",
            resources: [
              {
                title: "Documentação · erros e testes",
                url: "https://pkg.go.dev/testing",
                why: "Consulte depois da explicação e durante o laboratório de Testes de tabela, cobertura e fuzzing. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · API e contratos HTTP",
        topics: [
          {
            title: "API HTTP, JSON e validação",
            criteria:
              "Cobrir sucesso, JSON inválido, limite excedido e ausência de recurso.",
            exercise:
              "Exponha cadastro e consulta de livros com net/http. Limite entrada e trate JSON inválido e livro ausente. Teste os handlers com httptest e mantenha a regra separada.",
            resources: [
              {
                title: "Documentação · API e contratos HTTP",
                url: "https://pkg.go.dev/net/http",
                why: "Consulte depois da explicação e durante o laboratório de API HTTP, JSON e validação. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Context, timeout e encerramento",
            criteria:
              "Demonstrar timeout, cancelamento e encerramento controlado sem trabalho pendente.",
            exercise:
              "Propague context da requisição até um adaptador lento. Teste deadline e cancelamento. Implemente shutdown com limite em um laboratório.",
            resources: [
              {
                title: "Documentação · API e contratos HTTP",
                url: "https://pkg.go.dev/context",
                why: "Consulte depois da explicação e durante o laboratório de Context, timeout e encerramento. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
      {
        title: "Intermediário · SQL e transações",
        topics: [
          {
            title: "SQL, transações e cancelamento",
            criteria:
              "Provar rollback e explicar como o pool recupera a conexão após falha.",
            exercise:
              "Persista livros e empréstimos em um banco de laboratório. Simule falha depois da primeira gravação e valide rollback. Teste cancelamento de uma consulta e o fechamento de recursos.",
            resources: [
              {
                title: "Documentação · SQL e transações",
                url: "https://go.dev/doc/database/",
                why: "Consulte depois da explicação e durante o laboratório de SQL, transações e cancelamento. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Concorrência e integridade no banco",
            criteria:
              "Demonstrar no laboratório que apenas um empréstimo é confirmado.",
            exercise:
              "Simule dois empréstimos concorrentes para o último exemplar. Use uma estratégia de controle no banco e trate o conflito. Teste resultado, estoque e ausência de empréstimo parcial.",
            resources: [
              {
                title: "Documentação · SQL e transações",
                url: "https://go.dev/doc/database/",
                why: "Consulte depois da explicação e durante o laboratório de Concorrência e integridade no banco. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
      {
        title: "Avançado · concorrência controlada",
        topics: [
          {
            title: "Goroutines, channels e sincronização",
            criteria:
              "Demonstrar limite, término e ausência da corrida reproduzida.",
            exercise:
              "Construa um worker pool de notificações fictícias. Limite concorrência e propague cancelamento. Execute go test -race e provoque uma corrida de propósito antes de corrigi-la.",
            resources: [
              {
                title: "Documentação · concorrência controlada",
                url: "https://pkg.go.dev/context",
                why: "Consulte depois da explicação e durante o laboratório de Goroutines, channels e sincronização. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Benchmarks, profiling e segurança",
            criteria:
              "Apresentar hipótese, medição e uma decisão de segurança verificável.",
            exercise:
              "Crie um benchmark de uma consulta em memória. Observe perfil e uma alocação relevante. Revise dependências com as ferramentas de segurança do ecossistema e documente a decisão.",
            resources: [
              {
                title: "Documentação · concorrência controlada",
                url: "https://go.dev/doc/diagnostics",
                why: "Consulte depois da explicação e durante o laboratório de Benchmarks, profiling e segurança. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
      {
        title: "Projeto final · operação e revisão",
        topics: [
          {
            title: "Projeto final Go",
            criteria:
              "Executar em ambiente limpo e reproduzir os três cenários de falha.",
            exercise:
              "Entregue biblioteca com cadastro, empréstimos e notificações simuladas. Inclua testes, Dockerfile, configuração de exemplo e instruções. Demonstre falta de estoque, timeout e recuperação da persistência.",
            resources: [
              {
                title: "Documentação · operação e revisão",
                url: "https://go.dev/doc/security/",
                why: "Consulte depois da explicação e durante o laboratório de Projeto final Go. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
          {
            title: "Revisão de contratos e decisões",
            criteria:
              "Defender as decisões e adaptar uma regra com testes de regressão.",
            exercise:
              "Desenhe a operação de empréstimo sem consultar o guia. Explique context, transação e término das goroutines. Altere uma regra e adapte testes antes de mudar a implementação.",
            resources: [
              {
                title: "Documentação · operação e revisão",
                url: "https://go.dev/doc/security/",
                why: "Consulte depois da explicação e durante o laboratório de Revisão de contratos e decisões. Use a seção correspondente ao conceito, confira a versão e valide o resultado com a evidência desta aula.",
              },
            ],
          },
        ],
      },
    ],
  },
};
