# Evoluir

Um organizador pessoal para corpo, estudos e carreira. Interface responsiva, clara e sem gamificação, com navegação inferior e visual de vidro translúcido.

## O que funciona

- Dashboard diário, tarefas por área, conclusão, reabertura e consistência dos últimos sete dias.
- Registro manual e edição de corridas, ritmo calculado, histórico, meta semanal e evolução semanal/mensal.
- Trilhas editáveis para Java, Docker, Spring Cloud e arquitetura, com documentação oficial, exercícios, critérios e revisões. Outros temas podem ser organizados manualmente.
- Vagas, candidaturas, contatos, observações e seis status de acompanhamento.
- Objetivos de longo prazo, metas semanais, tarefas diárias, disponibilidade e histórico de reagendamentos.
- Exportação e restauração de backups JSON validados.
- PWA com recursos locais em cache, fontes incluídas e uso offline após o primeiro carregamento.

## Executar

Requer Node.js 22.12 ou superior.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

O build estático fica em `dist/`. O arquivo `vercel.json` configura a hospedagem, incluindo cabeçalhos de segurança. A integração contínua verifica os testes, a compilação e os fluxos no navegador.

## Dados e privacidade

Os registros ficam no armazenamento local do navegador, sem conta, backend, telemetria ou sincronização entre dispositivos. Nenhum registro pessoal é enviado à hospedagem. Faça backups: limpar os dados do navegador ou perder o aparelho pode apagar o histórico. O modo privado pode não oferecer armazenamento persistente.

Uma restauração substitui os registros atuais após confirmação e conserva uma cópia anterior na chave local `evoluir.before-import`. Backups inválidos são recusados antes de modificar os dados. Quando a leitura do armazenamento falha, o aplicativo oferece o download dos dados originais para recuperação.

## Instalar no iPhone

Abra o endereço HTTPS no Safari, toque em Compartilhar e escolha **Adicionar à Tela de Início**. Abra uma vez com internet para preparar o cache offline. Links externos de estudo e vagas exigem conexão.

## Integrações

O MVP não depende do Nike Run Club nem de uma API do roadmap.sh. As corridas são manuais. Roadmaps são referências externas por link; seu conteúdo não é redistribuído. As trilhas são modelos curados editáveis, sem geração por IA ou chamada a APIs pagas.

## Limites

A emulação de iPhone nos testes usa Chromium e não substitui testes em Safari/iOS real. Instalação na tela inicial, teclado e efeitos de vidro devem ser conferidos no aparelho. A aplicação oculta a barra visual de rolagem e preserva a rolagem nativa e o acesso por teclado.
