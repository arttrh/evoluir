# Backend Java do Prumo

Java 21, Spring Boot 4.1.2 e Maven. Implementa `/api/jobs`, `/api/news`, `/api/study-search` e `/api/strava` com os contratos usados pelo site. Não adiciona banco: registros, candidaturas e estudos continuam no armazenamento local do navegador e no backup existente.

## Estado da migração

A implementação Java pode ser executada e testada independentemente. A produção continua nas funções atuais até configurar uma hospedagem Java e definir `JAVA_BACKEND_URL` e `JAVA_BACKEND_KEY` na Vercel. Não há runtime Java oficial na Vercel: https://vercel.com/docs/functions/runtimes.

O navegador continua usando `/api/*` no domínio do site. As funções da Vercel passam as consultas ao Java com uma chave exclusiva entre servidores. A proteção de login da Vercel permanece no site, e o servidor Java também exige a chave em todas as rotas, inclusive `/api/health`. Não basta publicar o servidor Java com a URL escondida.

Sem URL configurada, as funções existentes continuam atendendo. Com URL configurada, falhas de configuração ou comunicação retornam erro: não há retorno silencioso para uma implementação diferente. Para reverter a ativação, remova `JAVA_BACKEND_URL` da Vercel e publique novamente.

## Executar e testar

Na raiz do projeto:

```sh
npm ci
node scripts/export-java-catalog.mjs
mvn -B -f backend/pom.xml verify
```

O catálogo público de fontes e os padrões de nomes vêm do mesmo catálogo do frontend. O JSON gerado fica versionado para permitir compilar o Java sem Node; regenere-o quando alterar as trilhas/fontes. O CI verifica se está atualizado. O Java não copia conteúdo de artigos ou roadmaps.

Para iniciar localmente, configure `BACKEND_API_KEY` no ambiente com pelo menos 32 caracteres aleatórios e execute:

```sh
mvn -f backend/pom.xml spring-boot:run
```

Por padrão, o servidor escuta apenas em `127.0.0.1:8080`. O proxy de desenvolvimento aceita HTTP somente em `127.0.0.1` ou `localhost`; em produção exige HTTPS.

## Docker

Crie um arquivo de ambiente privado a partir de `.env.example`, preencha a chave e, se necessário, as credenciais Strava. Não envie esse arquivo ao GitHub nem cole seus valores no chat.

```sh
docker build -t prumo-backend ./backend
docker run --rm --env-file backend/.env -p 127.0.0.1:8080:8080 prumo-backend
```

O contêiner executa com usuário sem privilégios. A hospedagem deve fornecer HTTPS, porta encaminhada ao contêiner e variáveis de ambiente. Não existe conta, cobrança ou serviço de hospedagem criado por esse código.

## Ativar na hospedagem

1. Configure `BACKEND_API_KEY` somente no servidor Java. Sem chave forte, ele não inicia.
2. Mantenha `APP_ORIGIN` no endereço público atual do site.
3. Para Strava, transfira com segurança as três variáveis `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` e `STRAVA_SESSION_SECRET` já existentes no servidor. Preserve a chave de sessão atual: o formato AES-256-GCM é compatível com o Node, incluindo os nomes e atributos dos cookies seguros. O callback continua no domínio atual `/api/strava?op=callback`.
4. Teste o Java com a chave no cabeçalho `X-Prumo-Backend-Key`. A rota de saúde também exige a chave; use uma verificação TCP se a hospedagem não permite cabeçalhos na verificação de saúde.
5. Na Vercel, configure `JAVA_BACKEND_URL` com a origem HTTPS do Java, sem caminho, e `JAVA_BACKEND_KEY` com o mesmo valor de `BACKEND_API_KEY`. Não use prefixo `VITE_`.
6. Publique, confira vagas, notícias, estudos e conexão Strava. Não remova a proteção nativa de login.

O servidor Java responde com `private, no-store`, inclusive para pesquisas públicas, evitando que um cache intermediário devolva respostas protegidas sem verificar a chave. Chamadas às fontes têm tempo limite, tamanho máximo e destinos fixos. RSS/Atom rejeita DTD, entidades externas e XML profundamente aninhado. Nenhum token Strava aparece no JSON do frontend.

Os testes usam respostas simuladas das fontes para cobrir limites, falhas, OAuth, cookies antigos e ausência de vazamento. Não substituem a validação com a conta Strava real após configurar a hospedagem.

## Render

O `render.yaml` na raiz prepara um único Web Service Docker no plano **Free**, sem banco e sem assinatura Strava. Ele usa `backend/Dockerfile`, respeita `PORT` e gera `BACKEND_API_KEY` no próprio Render. O serviço exige essa chave mesmo quando seu endereço é público. Não configure verificação HTTP em `/api/health` sem autenticação; a verificação TCP padrão é adequada.

Na conta Render, crie um Blueprint a partir deste repositório e confira que o plano selecionado é Free. Depois do deploy, configure na Vercel `JAVA_BACKEND_URL` com o endereço HTTPS `onrender.com` criado e `JAVA_BACKEND_KEY` com a chave gerada pelo Render. Guarde esse valor apenas nas configurações privadas dos dois serviços. A implantação na conta ainda depende de autenticação no Render.

O plano gratuito suspende o serviço após 15 minutos sem tráfego. O primeiro acesso pode levar cerca de um minuto para acordá-lo; o proxy tem limite de 15 segundos e pode retornar erro nessa primeira tentativa. Aguarde e tente novamente. A interface e os registros locais continuam disponíveis. Não foi adicionado mecanismo para manter artificialmente o serviço acordado.

A integração Strava é opcional. A documentação atual exige assinatura para criar uma aplicação de API; deixe suas variáveis Strava ausentes se não quiser contratar. Corridas manuais continuam funcionando.

Referências: [Docker no Render](https://render.com/docs/docker), [limites do Free](https://render.com/docs/free), [requisitos Strava](https://developers.strava.com/docs/getting-started/).
