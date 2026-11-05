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

O conector de login apenas autoriza a conta. As inscrições usam o fluxo separado abaixo; LinkedIn continua sem conexão e as buscas antigas no GitHub permanecem suspensas.

## Cadastro privado e aprovação por candidatura

1. No Telegram vinculado, envie `/cadastro`. Abra o link privado de uso único em até 15 minutos. No navegador, o acesso dura 30 minutos; o token é removido do endereço e trocado por cookie HttpOnly, Secure e SameSite Strict.
2. Salve contato, documentos opcionais, salários mensais separados para estágio/júnior e respostas profissionais de referência. Os valores ficam cifrados com AES-256-GCM no estado privado; nenhuma nova tabela pública ou dependência foi adicionada. CPF tem validação dos dígitos verificadores. O cadastro pode ser apagado e a sessão encerrada na própria página.
3. Use `/candidaturas` para preparar uma vaga selecionada. A consulta é somente leitura. A revisão privada exibe o currículo atual da Gupy e os campos da empresa. O currículo da Gupy não é substituído pelo PDF do Evoluir; contato/CPF e demais informações desse currículo devem estar corretos na plataforma.
4. Confirme a revisão privada e depois **Autorizar início** no Telegram. Esse botão cria a inscrição na empresa; ainda não declara o cadastro concluído. Interesse, preparação e abrir um link não autorizam esse efeito externo.
5. Prepare novamente a vaga para revisar a conclusão. Salário e RG são mapeados somente quando o formulário conhecido solicita esses campos. Os demais dados da inscrição são preservados. Nome da mãe, perguntas pessoais sem resposta e campos ainda não reconhecidos precisam ser preenchidos na Gupy; nenhuma resposta é inferida do currículo ou das notas de referência.
6. Revise os valores exatos e confirme **Confirmar envio** no Telegram. O servidor verifica que currículo, formulário e versão do cadastro continuam iguais. A aprovação vence em 30 minutos; editar dados ou cancelar invalida a revisão. Só a etapa confirmada como `register` pode receber a chamada de conclusão. A resposta de conclusão não basta: `registrationComplete=true` no comprovante da Gupy é exigido para marcar como enviado.

O bot persiste o início de cada efeito externo antes da chamada. Timeout ou resposta sem comprovante fica com resultado incerto, bloqueando repetição automática. Uma inscrição com identificador pode ser consultada novamente por `/sincronizar`; sem identificador, confira na plataforma antes de qualquer nova tentativa. Cancelar a automação não remove uma inscrição já criada na empresa.

## Testes e próximas etapas

`/pendencias` e `/sincronizar` consultam as etapas vinculadas ao comprovante da candidatura. O agendamento de 30 minutos também atualiza as etapas, com aviso quando elas mudam e lembrete diário das pendentes; `/pausar` interrompe avisos agendados. Links abrem a etapa oficial, sem iniciar testes por API.

Testes de raciocínio, comportamentais, psicotécnicos e entrevistas são feitos pelo candidato. O bot não gera respostas, não chama endpoints de testes e não trata um clique como conclusão. O estado mostrado vem da Gupy, inclusive etapas ainda não liberadas; não se inventam prazos ou notas.

## Validação e recuperação

Os contratos de leitura foram conferidos com a sessão real, sem criar candidaturas. As chamadas de início/conclusão são testadas com respostas simuladas: a primeira validação completa na plataforma depende da aprovação do usuário para uma vaga concreta. Falhas de contrato bloqueiam o envio, preservando o estado.

O estado agora contém `flow`. Antes de retornar a uma versão antiga que descarta campos desconhecidos, exporte o estado canônico pelo gateway autenticado. Não use um backup anterior à criação dos documentos privados para sobrescrever o banco.
