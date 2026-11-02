# Prumo.

[**Abrir Prumo**](https://evoluir-hazel.vercel.app)

Um espaço pessoal para corpo, estudos e carreira. PWA responsivo, com fundo claro, detalhes em bege, vidro translúcido, navegação inferior e animações com GSAP. Sem pontos ou recompensas.

## Funcionalidades

- Tarefas por área, conclusão, reabertura, planejamento semanal e histórico de reagendamentos.
- Corridas manuais, ritmo calculado, meta semanal, evolução por semana/mês e resumo mensal.
- Trilhas editáveis, prática, critérios e revisão. Há 21 trilhas prontas: Go, Python, JavaScript, TypeScript, React, Node.js, Rust, C#/.NET, SQL/PostgreSQL, Git, Linux, Kubernetes, Segurança, AWS/Cloud, Java, Docker, Backend, System Design, Arquitetura, Spring Boot e Spring Cloud. Java agora integra 25 módulos e 71 aulas; Spring Boot tem 32 aulas, Spring Cloud 25 e Go 14. Trilhas antigas podem ser ampliadas sem perder progresso.
- Busca de referências: documentação oficial do catálogo primeiro, discussões com respostas aceitas pela API pública do Stack Exchange depois. Roadmap.sh aparece como referência externa, sem cópia ou scraping.
- Trilhas próprias prontas, com objetivo, pré-requisitos, sequência, exercícios e critérios. Ajustar os tópicos é opcional. Assuntos fora do catálogo ainda podem ser pesquisados, mas a interface informa quando não existe trilha pronta; não inventa uma formação genérica como se fosse revisada. Não copia conteúdo do roadmap.sh: a licença permite referências por link, não republicação livre.
- Busca de vagas pela API pública do GitHub (Backend BR e Frontend BR), filtros de tecnologia/localização/fonte, salvamento sem duplicação e acompanhamento de candidaturas com data de envio confirmada. Atualização opcional a cada 15 minutos com a tela aberta. Currículos não são enviados automaticamente.
- Notícias por assunto: paginação real, atualização manual sem cache e histórico local de manchetes vistas, com opção de voltar a exibi-las. Busca online na API documentada do Hacker News/Algolia, com resultados identificados como comunidade, além de RSS/Atom de projetos e fontes técnicas (Go, Python, Java, TypeScript, Kubernetes e segurança). A busca aceita assuntos livres e identifica grafias comuns de Go/Golang. Datas e links originais, sem reproduzir artigos. Cache da última consulta em sessionStorage, sem misturar resultados de assuntos diferentes; não são notificações push.
- Comandos de voz em português, com transcrição ao vivo, pausas, edição e confirmação. Escuta de até 60 segundos com até três retomadas se o navegador encerrar sozinho. Estudos podem concluir tarefas ou tópicos de trilhas; emprego conclui tarefas; corrida registra distância e duração informadas. Exemplos: “Concluí revisar currículo” e “Corri cinco quilômetros em trinta e cinco minutos”. Há alternativa por texto e pelo ditado do teclado.
- PWA offline para os dados manuais, fontes locais, exportação e restauração de backup.

## Executar e validar

Node.js 22.12 ou superior:

```sh
npm ci
npm run dev
```

O servidor de desenvolvimento atende também `/api/study-search` e `/api/strava`, além de `/api/news` e `/api/jobs`, usando os mesmos handlers da Vercel. Sem credenciais Strava, o aplicativo informa que a conexão ainda não está ativada. Buscas online dependem da disponibilidade e quota do Stack Exchange; o catálogo oficial é o fallback.

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Testes incluem a lógica de voz, ambiguidade, validação de dados, preservação de progresso, backup, falhas de armazenamento, acessibilidade, movimento reduzido, tamanhos de tela, OAuth, criptografia, CSRF e consulta privada de atividades. O reconhecimento físico do microfone e o Safari/iOS exigem validação no aparelho.

## Configurar a consulta Strava

Existe integração oficial Nike → Strava para **novas** corridas; ela não migra o histórico anterior. Configure no NRC: Perfil → Configurações → Parceiros → Strava. [Instruções oficiais](https://support.strava.com/en-us/articles/15401850-nike-and-strava).

1. Cadastre uma aplicação em [Strava API Settings](https://www.strava.com/settings/api). A documentação atual exige assinatura Strava para cadastrar uma aplicação. Confira os requisitos e limites do seu nível de acesso; um app novo pode ter acesso apenas ao próprio atleta.
2. Use `evoluir-hazel.vercel.app` como Authorization Callback Domain. O retorno é `https://evoluir-hazel.vercel.app/api/strava?op=callback`.
3. Nas variáveis **server-only** da Vercel, configure `APP_ORIGIN`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` e `STRAVA_SESSION_SECRET`. O último deve ter no mínimo 32 caracteres aleatórios. Consulte `.env.example`; nunca use prefixo `VITE_`, nem inclua valores reais no Git.
4. Faça um novo deploy para aplicar as variáveis. Na área Corrida, leia o consentimento e conecte sua própria conta.

OAuth usa state com validade curta, verificação de origem na revogação e cookies Secure/HttpOnly/SameSite=Lax. Tokens são criptografados com AES-256-GCM e nunca enviados ao JavaScript. A aplicação consulta apenas o atleta autorizado; exibe corridas entre as 100 atividades mais recentes. Não armazena nem exporta essas atividades e não as combina com métricas locais, voz ou inteligência artificial. Ao sair da tela, a consulta é descartada. A desconexão revoga a autorização e limpa a sessão. Consulte [a política atual da API](https://www.strava.com/legal/api_policy).

## Privacidade e persistência

Registros manuais ficam neste navegador, sem sincronização automática. Faça backups: limpar o navegador ou perder o aparelho pode apagar o histórico. O backup contém seus registros manuais; não contém tokens, áudio nem atividades consultadas no Strava.

Ao restaurar, a cópia anterior é preservada na chave `evoluir.before-import`. Backups inválidos são recusados antes de alterar os dados. A tela de recuperação permite baixar dados corrompidos e restaurar um backup válido.

O reconhecimento de voz depende do navegador e das permissões. Alguns navegadores processam o áudio online. O Evoluir não grava áudio e não escuta em segundo plano. A busca envia somente o assunto pesquisado ao Stack Exchange. [Política de privacidade](https://evoluir-hazel.vercel.app/privacy.html).

## Instalar no iPhone

Safari → Compartilhar → **Adicionar à Tela de Início**. Abra uma vez com internet para preparar o cache. Registros manuais funcionam offline; busca de fontes, voz online e Strava podem precisar de internet. A barra de rolagem visual é ocultada, preservando toque, mouse e teclado. Preferência por redução de movimento é respeitada.

## Atalhos e movimento no iPhone

[Guia de conexão e atalhos](https://evoluir-hazel.vercel.app/conectar-strava.html). Tocar Atrás aceita dois ou três toques, conforme a Apple. O atalho pode abrir um gravador nativo; o início automático depende das ações que ele disponibiliza. Gravação GPS em segundo plano no Evoluir fica fora desta entrega. As superfícies de vidro ficam paradas durante as transições para evitar recomposição custosa; GSAP anima somente cabeçalhos leves. A fluidez física e o microfone ainda precisam ser conferidos em Safari no aparelho.

## Acesso pessoal e identidade

A marca visível é **prumo.**. Mantivemos o domínio, o ID do PWA e as chaves de armazenamento anteriores para preservar os dados existentes. O repositório pode continuar público; ele não contém os registros pessoais do navegador.

Para acesso pessoal, a proteção nativa da Vercel em **All Deployments** restringe também o endereço principal aos membros autorizados. O plano atual permite essa proteção sem adicionar um serviço de autenticação ou contratar APIs. A Vercel gerencia a duração e reutilização da sessão; o aplicativo não promete um prazo fixo de 90 dias. A sessão do Safari/PWA precisa de validação no aparelho. Conteúdo offline já salvo permanece acessível no aparelho, independentemente da autenticação de rede.

[Documentação oficial de proteção](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).

Os ícones principais usam a coleção System Outline da Lordicon, exportada individualmente com licença gratuita e crédito no rodapé. O player oficial `@lordicon/react` usa arquivos locais, com SVG de reserva e cache offline; não consulta CDN nem API da Lordicon em tempo de uso. O código do projeto não relicencia esses arquivos (veja `public/icons/lordicon/NOTICE.txt`). Os ícones selecionados animam com intervalos; clicar novamente reinicia o movimento. As semanas animam os dias e o conteúdo diário. A preferência de movimento reduzido desliga essas animações. Em Preferências também é possível pausar os ícones; a escolha fica neste navegador, separada do backup de registros.

## Aulas guiadas e comandos de estudo

Java, Spring Boot, Spring Cloud e Go têm explicações autorais, laboratório sequencial, falha para investigar, evidência para avançar e ligação com um projeto integrado. O roteiro carrega ao abrir a aula. A prática estimada é uma orientação, não um prazo de conclusão. Nas trilhas Java/Spring, o vídeo de apoio enviado pelo usuário tem capítulos conferidos na descrição do autor: [Telusko, aproximadamente 63 horas](https://www.youtube.com/watch?v=q6z_UCBM5Ek). Não reproduzimos a transcrição nem afirmamos ter assistido ao vídeo inteiro. Documentação atual acompanha os capítulos; confirme compatibilidade entre versões.

Trilhas antigas oferecem **Atualizar formação e preservar progresso**. A atualização reorganiza as aulas, mantém IDs dos tópicos existentes, conclusões, revisões, critérios personalizados e módulos extras. Referências ausentes são acrescentadas sem sobrescrever as já salvas. A estrutura do backup continua na versão 1. Assuntos do restante do catálogo mantêm as trilhas anteriores; não são apresentados como cursos completos equivalentes ao vídeo.

“Estudei Spring Cloud” funciona mesmo sem uma tarefa diária com esse título: encontra a trilha e sugere o primeiro tópico pendente. “Estudei Service Discovery de Spring Cloud” restringe o assunto. A prévia mostra o critério, permite escolher outro tópico e só conclui um tópico após confirmação. Não conclui a formação inteira por interpretar apenas o nome dela. Reconhecimento acústico continua dependente do navegador; não foi adicionado provedor de transcrição nem cobrança por API.

## Notícias sem repetir o mesmo lote

A lista inicial combina lotes de até três publicações por feed e manchetes da comunidade; a próxima página consulta outras publicações e outra página do Hacker News. Links são deduplicados sem parâmetros de rastreamento. Abrir uma notícia ou marcá-la como vista salva apenas seu identificador localmente. “Já vi lote” permite ocultar o lote inteiro. “Mostrar vistas” volta a exibi-lo. O histórico de leitura fica separado do backup pessoal.

Atualização manual usa `fresh=1`, resposta `no-store` e uma nova consulta às fontes. Consultas normais usam cache curto. Quando os mesmos artigos retornam, a tela informa ausência de manchetes diferentes; não inventa nem redistribui aleatoriamente notícias antigas como se fossem novas. As fontes podem não ter publicado algo novo. No Hacker News, a data representa compartilhamento; nos feeds, publicação.

## Backend Java

A migração para Java 21/Spring Boot 4.1.2 tem implementação das quatro APIs, testes, Docker e CI. A ativação depende de hospedagem Java e configuração somente no servidor. O site continua na Vercel e conserva autenticação, domínio e dados locais. Consulte [instruções e estado da migração](backend/README.md).
