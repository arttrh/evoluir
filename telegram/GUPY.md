# Conectar a conta de candidato da Gupy

## Busca pública e avisos

`server/gupy-jobs.ts` consulta `https://portal.gupy.io/api/job-search/jobs` com `jobName=java`, até 100 anúncios por consulta. Esse contrato foi observado em navegação real no portal; não é a API empresarial. O bot filtra júnior/estágio, recusa anúncios vencidos e URLs fora das páginas de vaga HTTPS da Gupy. Falha da fonte não é apresentada como lista vazia nem aciona outra fonte.

O teste real encontrou sete vagas compatíveis entre 100 anúncios retornados. Essa quantidade muda e não garante disponibilidade de todas as vagas. Os avisos, seleções e deduplicação ficam no banco privado. Selecionar **Tenho interesse** não envia uma candidatura.

## Conexão da conta

A conexão usa um login supervisionado em uma janela isolada do Firefox instalado no computador, controlado pela interface BiDi suportada pelo Playwright. Não usa o perfil Firefox habitual do usuário. Não é uma integração OAuth oficial nem usa a API empresarial da Gupy. O login ocorre em `https://login.gupy.io/candidates/signin`, testado na página real antes da implementação.

## Passo a passo neste computador

1. Vincule a conta do Telegram e confirme que `/perfil` responde.
2. No menu de aplicativos, abra **Conectar Gupy ao Evoluir**.
3. Na janela separada da Gupy, entre com sua conta. Senha, SMS, CAPTCHA ou confirmação ficam exclusivamente na página oficial; não envie esses dados pelo Telegram ou pelo chat do assistente.
4. Se escolher um link por e-mail, abra o link dentro da mesma janela isolada. Abrir em outro navegador não conclui a autorização observada pelo conector.
5. Aguarde a confirmação do bot e consulte `/gupy`.

A primeira conexão exige o PC. Ela ainda não pode ser feita só pelo celular. Depois de registrada, o estado fica na nuvem. Não são lidos cookies do navegador que o usuário já usa no dia a dia.

O script pode ser executado diretamente, com as dependências do projeto instaladas:

```sh
node scripts/connect-gupy.mjs
```

Uma tentativa cifrada pendente é retomada antes de pedir outro login. Falhas temporárias preservam `~/.config/evoluir-telegram/gupy-pending-session.json` com permissão `600`; a confirmação do servidor remove esse arquivo. `--login` abre uma janela nova sem apagar previamente a tentativa anterior.

O atalho local usa Kitty explicitamente e mantém o terminal aberto para os erros não desaparecerem. A janela do Firefox e o atalho foram verificados no Niri em execução.

## O que é guardado

O conector observa uma resposta HTTP 200 do endpoint de conta autenticada da Gupy e captura apenas os cabeçalhos de autorização/cookie dessa requisição e o User-Agent. Não captura senha, cookies de Google/LinkedIn nem o armazenamento completo do navegador.

Essa sessão é cifrada com AES-256-GCM, nonce aleatório e dado autenticado de versão. A chave fica fora do banco, somente no Render e no armazenamento privado deste computador. O artefato cifrado fica no perfil privado do Supabase. `/gupy/connect` exige a credencial de aplicativo e não aceita gravação anônima. A sessão anterior não é substituída se a Gupy recusar a nova credencial na verificação inicial.

O servidor verifica o acesso real ao endpoint de conta antes de marcar o estado como conectado. Só a conta de Telegram já vinculada recebe a confirmação. O banco recusa sessão antes da vinculação e alterações concorrentes com outra operação. Senhas e cabeçalhos não são registrados em logs, mensagens de erro, código ou documentação.

A verificação HTTP mantém `Origin: https://login.gupy.io` e `Referer: https://login.gupy.io/`. Com a mesma sessão real, a ausência desses cabeçalhos retornou 500 e a presença retornou 200 com identificação da conta. O teste de regressão cobre esse contrato sem usar credenciais reais.

## Limites

A sessão pode expirar ou ser revogada e ainda não há renovação automática; `/gupy` mostra a data da última verificação. Repita a conexão quando precisar reautorizar. O endpoint é usado pelo portal da Gupy e não tem garantia de compatibilidade como API pública.

Conectar a sessão não implementa candidatura automática nem prova que os formulários de vagas podem ser preenchidos. Nenhuma chamada de inscrição, alteração de currículo ou envio a empregador é feita por este conector. LinkedIn continua sem conexão e as buscas antigas no GitHub permanecem suspensas.
