# Avisos pessoais de vagas pelo Telegram

## Escopo atual — 2026-11-05

O usuário restringiu candidaturas a **LinkedIn com candidatura simplificada** e **Gupy**, mantendo Java júnior/estágio e a frequência desejada de 30 minutos. As contas e currículos nessas plataformas já estão preenchidos, mas não estão conectados ao serviço.

A busca antiga no GitHub está bloqueada no modo de nuvem. A busca pública da Gupy usa o mesmo endpoint observado no portal oficial, filtra Java júnior/estágio e permite avisos a cada 30 minutos. Ela não usa login nem credenciais do candidato. `/retomar` habilita somente Gupy autorizada no perfil; nunca reativa GitHub na nuvem. LinkedIn e envio de candidaturas continuam pendentes. As seções sobre busca GitHub abaixo descrevem o modo local legado, não a configuração atual da nuvem.

A conexão da conta Gupy é separada da busca pública. Siga [as instruções de login supervisionado](telegram/GUPY.md): o usuário entra na página oficial em uma janela isolada no computador; o servidor valida a autorização e guarda somente a sessão cifrada. A senha não é capturada. A conta não é declarada conectada antes dessa verificação real.

O `/start` comum agora recebe uma resposta pública de orientação sem vincular conta nem revelar o código privado. O link com código continua necessário para acessar perfil e currículo. Isso corrige o silêncio anterior: a mensagem era recebida e confirmada, mas o handler não respondia quando faltava o código.

[O LinkedIn restringe automação de atividades por ferramentas externas](https://www.linkedin.com/help/linkedin/answer/a1341543). Uma conta pessoal com currículo preenchido não equivale a uma integração autorizada para envio automático. Não foram importadas sessões, senhas ou cookies do usuário.

O bot reutiliza `server/job-search.ts`: consulta Backend BR e Frontend BR por Java júnior e estágio, sem filtro de localização, a cada 30 minutos. O modo local precisa de computador ligado; o modo de nuvem recebe webhooks no Render Free e usa Supabase Cron e Postgres, sem depender do computador.

Não envia currículo, não preenche formulários nem cria contas em sites de vagas. Os botões **Tenho interesse** e **Ignorar** guardam a seleção no estado privado. Esse estado ainda não sincroniza com o painel do Evoluir.

## Configuração privada

Crie uma pasta com permissão `700` fora do repositório. Guarde o token em `token`, com permissão `600`, em uma única linha. Nunca publique esse arquivo, o estado ou o código de vinculação.

O `config.json` privado, também com permissão `600`, usa este formato:

```json
{
  "tokenFile": "/caminho/privado/token",
  "botUsername": "seu_bot",
  "pairCode": "codigoaleatoriohexadecimalde24a64caracteres",
  "intervalMinutes": 30,
  "location": ""
}
```

Gere `pairCode` com `crypto.randomBytes(12).toString("hex")` do Node. Abra `https://t.me/SEU_BOT?start=SEU_CODIGO` e toque em Iniciar. Somente a conversa privada com esse código pode vincular a primeira conta; depois disso, mensagens e ações de outros usuários são recusadas. Um webhook existente é preservado e impede iniciar o polling.

Com as dependências do projeto instaladas:

```sh
node scripts/telegram-worker.mjs /caminho/privado/config.json
```

O worker usa o carregador TypeScript do Vite já instalado no projeto. Não abre servidor HTTP. O token é relido a cada chamada, permitindo substituição sem mudar código. O token deve pertencer ao usuário do bot configurado.

## Operação

- `/status`: estado, última busca e quantidade de vagas selecionadas.
- `/pausar`: pausa consultas e avisos.
- `/retomar`: retoma consultas e avisos.
- Uma busca bem-sucedida inicia o próximo intervalo de 30 minutos. Sem novidades, não envia mensagens repetidas.
- Máximo de dez avisos novos por rodada; os restantes ficam para rodadas seguintes. Cada consulta tem os limites da busca existente: até 30 anúncios abertos publicados nos últimos 90 dias. Não cobre todos os sites de emprego nem garante que o anúncio continue disponível.
- O filtro de nível usa título e etiquetas, e Java pode aparecer na descrição. Requisitos contraditórios no anúncio ainda exigem revisão humana.
- `state.json` é validado ao iniciar e salvo por substituição atômica com permissão `600`. Estado inválido interrompe a execução e é preservado.
- Uma entrega com resultado incerto fica como `notificando` e não é reenviada automaticamente, evitando duplicar avisos após falhas. Revise esses registros antes de tentar novamente.
- Falhas interrompem o processo com mensagem sem credenciais. O serviço systemd pode reiniciar após 60 segundos. Não inicie duas instâncias com o mesmo bot.

Neste computador, o serviço de usuário se chama `evoluir-telegram.service`:

```sh
systemctl --user status evoluir-telegram.service
journalctl --user -u evoluir-telegram.service -n 20 --no-pager
systemctl --user stop evoluir-telegram.service
systemctl --user disable evoluir-telegram.service
```

O serviço local inicia nas próximas sessões do usuário, enquanto estiver habilitado. Ele deve ficar desabilitado após a migração para webhook, para não disputar atualizações com a nuvem.

## Perfil de candidatura e migração para a nuvem

O perfil pessoal fica fora do repositório, em `~/.config/evoluir-telegram/profile.json`. Uma cópia privada do PDF selecionado fica em `curriculo.pdf`; o perfil registra o caminho original, SHA-256 e os links autorizados de LinkedIn, GitHub e portfólio. A importação para a nuvem guarda o PDF e os links na tabela privada `prumo_jobs.control`. O comando `/perfil`, disponível somente à conta vinculada, mostra o nome do currículo e os links. O PDF ainda não é enviado a empregadores.

A versão de nuvem usa:

1. Um serviço Node Free separado no Render executa `node --max-old-space-size=256 scripts/telegram-web.mjs`, sem alterar Java ou LearnHarness. O build é `npm ci --include=dev`; o Vite já instalado carrega os módulos TypeScript somente na inicialização, sem abrir outro servidor.
2. `POST /webhook` exige o segredo de webhook enviado pelo Telegram. `POST /scan` exige assinatura HMAC válida por cinco minutos, derivada de uma chave separada no Supabase Vault. A chave nunca entra na fila de requisições do `pg_net`, que pode ter permissões amplas em instalações gerenciadas. Repetir um disparo assinado não repete a busca da mesma janela. `GET /health` não revela perfil nem histórico.
3. `telegram/edge.ts`, publicado como `prumo-telegram-store`, recebe somente comandos com credencial de aplicativo. A credencial privilegiada do banco fica no Supabase. A RPC é `SECURITY INVOKER`, executável somente por `service_role`; o esquema privado tem RLS e nenhuma concessão para `anon`/`authenticated`.
4. A migração em `supabase/migrations/` inclui lease exclusivo de cinco minutos e revisão crescente. Cada gravação exige proprietário, revisão atual e lease válido. Falhas não confirmam a atualização ao Telegram. O lease é renovado a cada gravação e impede dois deploys de sobrescreverem o estado.
5. O agendamento usa `*/30 * * * *`, alinhado às janelas de meia hora. Sem novidades, o bot não manda mensagens repetidas. O primeiro aviso exige a vinculação real pelo link privado.
6. A importação inicial de perfil, PDF e estado é feita fora do repositório por uma chamada autenticada ao gateway. O banco confere o cabeçalho PDF e o SHA-256 e recusa uma segunda importação. Backup e segredos locais são preservados para recuperação.

Variáveis privadas do serviço: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_PAIR_CODE`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_SCAN_SECRET`, `TELEGRAM_STORE_TOKEN`, `TELEGRAM_STORE_URL`. `PORT` é fornecida pelo Render. Fixe uma versão Node compatível com o projeto (validação local em Node 26; hospedagem configurada com Node 22.17). Nenhuma chave usa prefixo público.

O Render Free suspende serviços web depois de 15 minutos sem tráfego recebido; um timer interno de 30 minutos não resolve. Há 750 horas Free mensais compartilhadas por workspace, então a nova rotina compete com os serviços já existentes. Workers não têm plano Free e cron jobs do próprio Render têm cobrança mínima mensal de US$1. O agendamento fica no Supabase para não criar esse custo. A inicialização a frio pode atrasar uma rodada e o funcionamento depende das cotas e da disponibilidade dos serviços Free.

Hospedar o bot não implementa envio de candidaturas. Essa etapa precisa extrair o canal indicado no anúncio e apresentar destinatário, texto, PDF e links para aprovação específica. Envio por e-mail exige conectar a conta do usuário; formulários precisam de integração com cada plataforma e podem exigir intervenção humana. Nunca inferir um destinatário nem registrar seleção como candidatura enviada.

Referências verificadas: [Render Free](https://render.com/docs/free), [Render Cron](https://render.com/docs/cronjobs), [Supabase Cron](https://supabase.com/docs/guides/cron).
