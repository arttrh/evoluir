# Pesquisa de fontes de estudo

A pesquisa por assunto usa documentação do catálogo e consultas públicas em
Stack Overflow, Baeldung, Medium, DEV Community, Reddit e Hacker News. Funciona
com o computador desligado: Vercel encaminha a rota ao Java no Render.
A implementação Node permanece disponível quando o backend Java não está configurado.

## Resultados e origem

- Documentação: referências oficiais do catálogo, ordenadas pelos termos do assunto.
- Artigos e tutoriais: Baeldung, Medium e DEV Community.
- Discussões: Stack Overflow com resposta aceita, Reddit e Hacker News.
- Buscas diretas: links separados para pesquisar o mesmo assunto no site original.
  Não são apresentados como artigos encontrados.

Os feeds de Medium e DEV são consultados por tecnologia e por foco específico
quando possível. Os resultados locais desses feeds devem conter os termos
pesquisados; uma tag ampla não garante um resultado para toda dúvida.
As buscas nativas de Stack Overflow, Reddit e Hacker News recebem o assunto.
Cada provedor entrega até cinco resultados. URLs repetidas são removidas,
ignorando parâmetros comuns de rastreamento. Datas de publicação não são inventadas.
A interface informa a hora da consulta e quais fontes ficaram indisponíveis.
Se todos os provedores falharem no primeiro acesso, refaz a consulta uma vez
para recuperar uma inicialização fria do serviço gratuito. Falhas parciais
mostram links diretos às fontes afetadas ao lado do aviso.

O catálogo de tecnologias, tags e provedores é compartilhado com o Java pelo
exportador `scripts/export-java-catalog.mjs`. Consultar fontes não altera
conclusões, critérios, notas, revisões ou os backups locais do usuário.

## Limites e privacidade

Não foi contratado provedor de pesquisa ou de IA. A aplicação não envia
conversas ou registros de estudo aos provedores; envia o termo de pesquisa.
Respostas têm limite de tamanho e tempo, e os destinos de rede são fixos.
RSS/Atom rejeitam DTD, entidades externas e XML excessivamente profundo.
Não há execução de HTML ou de conteúdo encontrado.

Sites podem bloquear acesso automático, limitar frequência ou exigir login
ou assinatura para ler um artigo. Baeldung bloqueou consultas Node durante
as verificações; o link de pesquisa direta continua disponível. Reddit RSS
não oferece disponibilidade garantida. Nenhum bloqueio ou paywall é contornado.
Uma busca vazia ou uma falha parcial não gera referências inventadas.
Não é um índice completo da internet nem uma avaliação automática da qualidade
de cada opinião: confira autoria, versão e exemplos com a documentação.

## Referências dos mecanismos utilizados

- https://developers.forem.com/api/v0
- https://help.medium.com/hc/en-us/articles/214874118-Using-RSS-feeds-of-profiles-publications-and-topics
- https://api.stackexchange.com/docs/advanced-search
- https://hn.algolia.com/api
- https://www.baeldung.com/
- https://spring.io/
