# Prumo.

[**Abrir Prumo**](https://evoluir-hazel.vercel.app)

Um espaço pessoal para corpo, estudos e carreira. PWA responsivo, com fundo claro, detalhes em bege, vidro translúcido, navegação inferior e animações com GSAP. Sem pontos ou recompensas.

## Funcionalidades

- Tarefas por área, conclusão, reabertura, planejamento semanal e histórico de reagendamentos.
- Corridas manuais, ritmo calculado, meta semanal, evolução por semana/mês e resumo mensal.
- Trilhas editáveis, prática, critérios e revisão. Há 20 trilhas prontas: Go, Python, JavaScript, TypeScript, React, Node.js, Rust, C#/.NET, SQL/PostgreSQL, Git, Linux, Kubernetes, Segurança, AWS/Cloud, Java, Docker, Backend, System Design, Arquitetura e Spring Cloud. Go tem seis módulos com prática de HTTP, persistência, testes e concorrência. Trilhas antigas podem ser ampliadas sem perder progresso.
- Busca de referências: documentação oficial do catálogo primeiro, discussões com respostas aceitas pela API pública do Stack Exchange depois. Roadmap.sh aparece como referência externa, sem cópia ou scraping.
- Trilhas próprias prontas, com objetivo, pré-requisitos, sequência, exercícios e critérios. Ajustar os tópicos é opcional. Assuntos fora do catálogo ainda podem ser pesquisados, mas a interface informa quando não existe trilha pronta; não inventa uma formação genérica como se fosse revisada. Não copia conteúdo do roadmap.sh: a licença permite referências por link, não republicação livre.
- Vagas, candidaturas, contatos e objetivos profissionais.
- Notícias por assunto: busca online na API documentada do Hacker News/Algolia, com resultados identificados como comunidade, além de RSS/Atom de projetos e fontes técnicas (Go, Python, Java, TypeScript, Kubernetes e segurança). A busca aceita assuntos livres e identifica grafias comuns de Go/Golang. Datas e links originais, sem reproduzir artigos. Cache da última consulta em sessionStorage, sem misturar resultados de assuntos diferentes; não são notificações push.
- Comandos de voz em português, com transcrição ao vivo, pausas, edição e confirmação. Escuta de até 60 segundos com até três retomadas se o navegador encerrar sozinho. Estudos podem concluir tarefas ou tópicos de trilhas; emprego conclui tarefas; corrida registra distância e duração informadas. Exemplos: “Concluí revisar currículo” e “Corri cinco quilômetros em trinta e cinco minutos”. Há alternativa por texto e pelo ditado do teclado.
- PWA offline para os dados manuais, fontes locais, exportação e restauração de backup.

## Executar e validar

Node.js 22.12 ou superior:

```sh
npm ci
npm run dev
```

O servidor de desenvolvimento atende também `/api/study-search` e `/api/strava`, além de `/api/news`, usando os mesmos handlers da Vercel. Sem credenciais Strava, o aplicativo informa que a conexão ainda não está ativada. Buscas online dependem da disponibilidade e quota do Stack Exchange; o catálogo oficial é o fallback.

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

Os ícones selecionados têm movimentos diferentes com intervalos; clicar novamente reinicia o movimento. As semanas animam os dias e o conteúdo diário. A preferência de movimento reduzido desliga essas animações.
