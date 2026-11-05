# Publicação do bot de vagas

Verificação em 2026-11-05, workspace Render `My Workspace`, somente plano Free.

- Serviço: [prumo-telegram](https://dashboard.render.com/web/srv-dblv4o0u01pc73fsb83g).
- Origem HTTP: `https://prumo-telegram.onrender.com`.
- Fonte: branch `feat/telegram-cloud` de `arttrh/evoluir`, sem merge em `main`.
- Código publicado: `c3f610aa97ee8a0ed653aac6a8af8b8fa269ddd8`.
- Deploy: `dep-dblv7c08v5cc73d258sg`, estado `live`.
- Node 22.17 no Render, build `npm ci --include=dev` e comando em `scripts/telegram-web.mjs`.
- Publicação automática desativada; alterações futuras precisam de deploy explícito após validação.
- Supabase: projeto Prumo, gateway `prumo-telegram-store`, esquema privado `prumo_jobs`.
- Agendamento: `prumo-telegram-half-hour`, expressão `*/30 * * * *`, assinatura HMAC derivada do Vault.
- Serviço local `evoluir-telegram.service` parado e desabilitado; arquivos privados preservados para recuperação.

## Evidências

- `npm run check`: 187 testes passaram, TypeScript e build concluídos. Permanece o aviso anterior de tamanho de bundle do frontend.
- RPC real: exclusão entre proprietários concorrentes, revisão crescente e rejeição de gravação antiga; transação de verificação revertida.
- RLS habilitado; `anon` e `authenticated` sem acesso ao esquema privado e à RPC. A ausência de políticas é intencional para acesso exclusivo do servidor.
- Saúde HTTP 200; webhook e busca sem assinatura recusados com 401; assinatura vencida recusada com 401.
- Gateway com chave errada recusado com 403.
- Disparo real por `pg_net` recebeu HTTP 200, sem timeout. Não equivale a observar uma rodada futura do cron.
- PDF recuperado do gateway com SHA-256 idêntico ao arquivo local; três links conferidos por chave e valor.
- Perfil e estado preservados após novo deploy, sem dependência de arquivos locais do contêiner.
- Webhook registrado no Telegram, sem erros informados ou atualizações pendentes na consulta realizada.
- Auditoria Supabase sem WARN/ERROR após instalar `pg_net` no esquema de extensões. Os avisos INFO de RLS sem políticas são esperados nos esquemas privados.

A conta ainda precisava ser vinculada pelo link de início na última verificação. Nenhum aviso real a uma conta vinculada ou envio de candidatura foi declarado como testado. `/perfil` e os botões exigem a vinculação real do usuário. O PDF está armazenado, mas envio de candidatura continua desativado.

## Recuperação

Para interromper as buscas, desative o job `prumo-telegram-half-hour` no Supabase. Não apague perfil, tabela ou Vault para pausar a operação.

Não reative o polling local enquanto o webhook estiver configurado. Antes de retornar ao modo local, exporte o estado canônico atual do banco por canal autenticado; o backup anterior à migração não contém seleções posteriores. Só remova o webhook após preservar as atualizações pendentes, e nunca rode dois consumidores ao mesmo tempo.

O funcionamento depende das cotas compartilhadas e da disponibilidade dos planos Free. A inicialização a frio pode atrasar buscas e respostas do bot. Hospedagem não inclui automação de formulários ou conexão de e-mail.
