# LearnHarness no Prumo

Integração publicada em 2026-11-03, com verificação real e correções de
inicialização em 2026-11-04. Java e LearnHarness usam serviços Docker Free separados.

## Serviços

- Prumo: https://evoluir-hazel.vercel.app, com o login pessoal da Vercel.
- Backend Java: https://prumo-api-46sd.onrender.com, Docker Free.
- LearnHarness: https://prumo-learning.onrender.com, Docker Free, serviço separado.
  Acesso direto sem sessão retorna 401; abra pelo botão na área Estudos.
- Supabase: projeto `Prumo`, ref `atzncofgyitahiguuhcn`, região `us-east-2`,
  organização `rthurlucas's Org`, plano Free confirmado.
- Fonte AGPL da adaptação: https://github.com/arttrh/learnharness-prumo.
  Base upstream `e69e852`, primeira implementação `342139b`, ajustes `6fe393c`.

## Funcionamento

O Render executa o Java e o LearnHarness. O Supabase guarda sessões, planos,
histórico, grafo, configurações e vínculos. O PC pode ficar desligado.

O login inicial foi feito no próprio LearnHarness, com autorização no navegador.
A credencial foi cifrada antes de ser armazenada no Supabase; o servidor tem
identificador próprio e assume as renovações. Não foram usadas credenciais do
Codex, chave de API paga ou outro provedor. O modelo é `gpt-6.1-sol` via ChatGPT,
correspondente à configuração atual e confirmado no catálogo autorizado real.
Se a autorização for revogada, será necessário refazer a configuração do login.

O botão **Abrir LearnHarness** passa pelo login da Vercel, mostra imediatamente
a espera pela inicialização gratuita e tenta novamente automaticamente. Só
depois de o serviço estar pronto, `/api/learning?op=ticket` gera um bilhete
curto de uso único e estabelece uma sessão HttpOnly/Secure/SameSite no
LearnHarness. As APIs e os streams também exigem autorização. Os agentes
não podem ler arquivos privados da hospedagem.

O painel lê resumos das sessões por Vercel → Java → LearnHarness. A associação
usa o ID original da sessão e os IDs da trilha/tópico. Repetir a sincronização
ou a associação não cria uma segunda sessão. Estados atual, visitado e futuro
vêm do histórico; visita não altera `done`, critérios, exercícios, anotações,
revisões ou conclusões. Não é calculado tempo de estudo por diferença entre
horários, nem inventados notas ou domínio.

Os dados locais `evoluir.data.v1` e os backups existentes continuam funcionando.
Eles não foram migrados, apagados ou enviados ao Supabase. Conclusões e revisões
manuais continuam sob controle do usuário no Prumo.

## Persistência e privacidade

Postgres é a fonte de verdade dos registros compartilhados. O esquema
`prumo_lh` é privado, com RLS e sem concessões de acesso a `anon`/`authenticated`.
A única função SQL pública exige `service_role` e é `SECURITY INVOKER`.
Uma Edge Function do próprio Supabase guarda essa credencial privilegiada
no ambiente e autoriza cada requisição de aplicativo por chave privada.
Nenhuma chave privilegiada vai ao navegador ou ao repositório.

O adaptador preserva os formatos JSON/JSONL e o contrato síncrono do upstream.
Um worker HTTPS aguarda o commit antes de aceitar a mudança em memória. UUIDs
nas operações tornam as repetições de rede idempotentes. Um novo processo
recupera os registros e invalida gravações do escritor antigo. Falha sem
confirmação interrompe as gravações até recuperar o estado canônico, evitando
sobrescrever um commit que pode ter ocorrido sem a resposta chegar ao cliente.
Não há sincronização periódica nem filesystem efêmero como armazenamento durável.

Credenciais são cifradas com AES-256-GCM. Segredos ficam nas configurações
privadas dos servidores; não nas migrações. Storage privado não é usado como
banco; será necessário para anexos binários/exports adicionais quando houver
um fluxo durável específico para eles. Cada documento JSON/JSONL tem limite
de 4 MB; os backups locais continuam necessários.

## Configuração dos servidores

Vercel, somente em produção: `JAVA_BACKEND_URL`, `JAVA_BACKEND_KEY`,
`LEARNHARNESS_URL`, `PRUMO_STORE_URL`, `PRUMO_GATEWAY_KEY`.

Java: `BACKEND_API_KEY`, `APP_ORIGIN`, `LEARNHARNESS_URL`, `LEARNHARNESS_KEY`.

As variáveis privadas do LearnHarness, o gateway SQL, o Dockerfile e os testes
estão documentados no fork em `prumo/README.md`. A licença AGPL e a oferta do
fonte correspondente são mantidas, sem publicar conversas ou dados pessoais.

## Verificação realizada

- Login ChatGPT próprio, catálogo e inferência real com `gpt-6.1-sol`.
- Credencial cifrada restaurada em outro processo, com host ID independente.
- Escrita real no Supabase e repetição da mesma operação sem duplicação.
- Acesso direto sem sessão: 401 em páginas e APIs.
- Bilhete de uso único: primeiro uso 303, repetição 401, cookie com atributos seguros.
- Turno real do LearnHarness no Render: mensagem do usuário e resposta do
  assistente persistidas; sessão sintética identificada como verificação técnica.
- 85 testes originais de autenticação, credenciais, fixtures, grafo e configurações.
- Testes adicionais do adaptador e da sessão assinada; TypeScript e build Next.
- Testes de API do Prumo, validação do modelo de dados e build Vite.
- E2E em viewport iPhone: associação sem duplicação, preservação byte a byte
  dos dados locais, falha mantendo sessão anterior, acessibilidade e largura.
- Java validado em cópia limpa do commit publicado, incluindo os novos testes;
  as alterações pendentes de outros trabalhos ficaram intactas.

A sessão sintética da implantação anterior foi recuperada após o reinício
no Render. O acesso via formulário no domínio do Prumo retornou 303, estabeleceu
a sessão privada e carregou a interface móvel. Uma nova pergunta sobre Java
recebeu resposta real do assistente, confirmada no histórico persistido.
Isso não equivale a testar um iPhone físico ou todas as ferramentas pesadas.

Os serviços existentes foram criados por URL pública do repositório; não
presuma publicação automática após um push. Confira o SHA no Render e, se
não houver nova implantação, publique o commit pelo dashboard do serviço.

## Limites dos planos gratuitos

Render: 512 MB/0,1 CPU por serviço, 750 horas mensais compartilhadas no
workspace e suspensão por inatividade. O primeiro acesso pode demorar e exigir
nova tentativa. Demos/PDFs e contextos grandes podem exceder a memória.

Supabase: 500 MB de banco, 1 GB de arquivos e pausa por inatividade. O consumo
atual das cotas não foi auditado. Hospedagem Free não amplia cotas do ChatGPT.
Nenhum plano pago foi contratado e Strava continua desativado.

Referências: [Render Free](https://render.com/docs/free),
[Supabase Free](https://supabase.com/pricing),
[login em servidor próprio](https://developers.openai.com/siwc/token-sharing-open-source/self-hosted-vms).
