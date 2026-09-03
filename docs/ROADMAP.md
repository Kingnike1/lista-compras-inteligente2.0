# ROADMAP — Continuidade de Desenvolvimento

Este roadmap foi criado a partir da auditoria de 03/09/2026. Ele **não autoriza execução automática das Sprints**. Cada Sprint deve ser pequena, testável, reversível e validada antes da próxima.

## Princípios
- Preservar produção e dados existentes.
- Não reescrever o sistema do zero.
- Separar hardening, UX e migrations de domínio.
- Nunca migrar preço global sem estados de publicação/revisão compatíveis com o contrato 2.0.
- Nunca depender de IA para cálculos, identidade ou fatos.
- Preferir migrations aditivas e compatibilidade temporária antes de remover legado.

---

## Sprint C1 — Gate de Continuidade e Reprodutibilidade
### Objetivo
Tornar o repositório reproduzível e criar um baseline técnico verificável sem mudar comportamento funcional.

### Motivo
Hoje as dependências usam `latest`, não há lockfile encontrado, não existem testes automatizados e os comandos de qualidade não estão completamente validados.

### Tarefas
- Fixar versões das dependências atuais sem upgrade funcional desnecessário.
- Gerar e versionar lockfile.
- Validar o comando de lint compatível com a versão real do Next.js.
- Criar script explícito de `typecheck`.
- Criar testes de caracterização mínimos para regras determinísticas que já existem.
- Definir gate: install → lint → typecheck → test → build.
- Opcionalmente adicionar CI simples somente depois de o gate local estar verde.

### Dependências
Nenhuma migration de domínio.

### Áreas prováveis
`package.json`, lockfile, `tsconfig.json`, `vitest.config.ts`, testes novos e configuração de CI se aprovada.

### Testes necessários
- instalação limpa;
- lint;
- typecheck;
- Vitest;
- `next build`;
- smoke test de `/login` e proteção de `/`.

### Critérios de aceite
- instalação reproduzível;
- todos os comandos documentados passam;
- nenhuma regra de negócio muda;
- build de Preview verde.

### Riscos
Atualizar versões por acidente em vez de somente congelar o estado conhecido.

---

## Sprint C2 — Reconciliar e Validar UX da PR #9
### Objetivo
Preservar e integrar com segurança o redesign já existente na branch `feature/sprint-ux-navigation-redesign`.

### Motivo
A versão visual desejada existe em Preview, mas a PR #9 está aberta, divergente e não mergeável no estado auditado.

### Tarefas
- Atualizar a branch sobre uma base atual sem descartar mudanças do redesign.
- Resolver conflitos de forma mínima.
- Comparar regras funcionais das Sprints 1–5 antes/depois.
- Executar o checklist visual e funcional existente.
- Só mergear após aprovação explícita do Preview.

### Dependências
Sprint C1 concluída.

### Áreas prováveis
`src/app/globals.css`, `src/app/login/page.tsx`, `src/modules/household/dashboard.tsx` e demais arquivos já modificados na PR #9.

### Testes necessários
- gate da C1;
- login Google;
- estoque;
- lista/orçamento;
- preços/comparador;
- modo compra/histórico;
- recomendações;
- responsividade mobile.

### Critérios de aceite
- Preview aprovado visualmente;
- regressão zero das Sprints 1–5;
- PR mergeável e integrada sem migration de banco.

### Riscos
Misturar redesign com mudanças de arquitetura 2.0 e tornar a revisão impossível.

---

## Sprint C3 — Contrato de Migração e Reconciliação do Banco
### Objetivo
Preparar a evolução do schema sem ainda substituir o modelo legado.

### Motivo
O banco contém dados reais. Os contratos 2.0 de produto e preço são incompatíveis com partes do schema atual.

### Tarefas
- Inventariar tabela/coluna atual → entidade 2.0.
- Definir invariantes que não podem ser quebradas.
- Definir backup, rollback, reconciliação e critérios de cutover.
- Criar estratégia de migrations aditivas e feature flags.
- Definir como dados legados serão classificados, sem apagar histórico.

### Dependências
C1. C2 pode ocorrer antes ou em paralelo apenas se não tocar banco.

### Áreas prováveis
`supabase/migrations/`, `docs/2.0-migracao-sistema-atual.md`, documentação técnica de migration.

### Testes necessários
- aplicar migrations em ambiente descartável/staging;
- validar contagens e invariantes antes/depois;
- testar rollback/restauração definida.

### Critérios de aceite
- nenhum dado de produção perdido;
- mapa de migração completo;
- plano de reconciliação executável;
- nenhuma mudança funcional obrigatória ainda.

### Riscos
Transformar uma Sprint de planejamento em migration grande e irreversível.

---

## Sprint C4 — Fundação de Identidade de Produto 2.0
### Objetivo
Adicionar a fundação de Família → Variante → SKU e múltiplos identificadores sem remover o produto legado de imediato.

### Motivo
EAN/GTIN, produtos sem código e peso variável precisam existir no modelo antes de catálogo global, NFC-e e providers.

### Tarefas
- Implementar apenas as entidades/relacionamentos congelados no contrato de produto.
- Adicionar aliases/identificadores com proveniência.
- Definir status de matching/provisório.
- Mapear produtos atuais para o novo modelo com compatibilidade temporária.

### Dependências
C3.

### Áreas prováveis
`supabase/migrations/`, tipos/contratos de produto, camada de leitura compatível.

### Testes necessários
- migrations aditivas;
- constraints de identidade;
- produto com EAN;
- produto sem EAN;
- embalagens diferentes;
- peso variável;
- leitura de produtos legados durante transição.

### Critérios de aceite
- modelo suporta os cenários do contrato;
- app legado continua operando;
- nenhum merge automático de identidade ambígua.

### Riscos
Duplicação de catálogo ou migração errada de produtos existentes.

---

## Sprint C5 — Fundação `price_observation` e Governança de Preço
### Objetivo
Migrar o conceito de preço legado para observações imutáveis, elegibilidade e publicação controlada.

### Motivo
O maior conflito atual é preço manual sendo publicado diretamente com confiança máxima e validade fixa de 7 dias.

### Tarefas
- Criar modelo aditivo de observação de preço conforme contrato congelado.
- Separar observação, condição, vigência, frescor e publicação.
- Registrar moeda e unidade corretamente.
- Impedir que contribuição manual vire compartilhada/oficial sem revisão.
- Preservar os preços legados e criar regra explícita de compatibilidade/migração.
- Fazer preço desatualizado permanecer consultável com estado de frescor.

### Dependências
C3 e base de produto C4 suficiente para relacionar observações ao SKU correto.

### Áreas prováveis
`supabase/migrations/`, módulo `pricing`, contratos de core e RLS.

### Testes necessários
- preço-base;
- stale vs atual;
- preço manual pendente;
- preço aprovado;
- promoção/clube como condição sem sobrescrever base;
- preço por kg/unidade;
- histórico imutável;
- RLS/publicação.

### Critérios de aceite
- nenhuma contribuição manual compartilhada automaticamente;
- histórico preservado;
- comparação só recebe preços elegíveis;
- legado continua reconciliável.

### Riscos
Contaminação do histórico e alteração silenciosa do total do comparador.

---

## Sprint C6 — Fila de Revisão/Admin Mínimo
### Objetivo
Criar a capacidade operacional mínima para revisar dados duvidosos sem implementar todo o Admin 2.0.

### Motivo
Preço manual, matching de produto, filial duplicada e futuras notas fiscais precisam de um fluxo de decisão auditável.

### Tarefas
- Criar `review_case`/equivalente com estados explícitos.
- Prioridade, razão, entidade, evidências, responsável e timestamps.
- Aprovação/rejeição reversível quando aplicável.
- Controle server-side de papel privilegiado.
- Auditoria das decisões críticas.

### Dependências
C4/C5.

### Áreas prováveis
Banco/RLS, rotas server-side e interface Admin mínima.

### Testes necessários
- usuário comum não acessa fila;
- Admin revisa caso permitido;
- decisão registra auditoria;
- concorrência de dois revisores;
- reversão controlada.

### Critérios de aceite
- dados pendentes não exigem manipulação direta do banco;
- ação administrativa é rastreável;
- privilégios são testados no servidor.

### Riscos
Criar um “Super Admin” sem trilha de auditoria ou controles operacionais.

---

## Sprint C7 — Mercado/Filial com Governança e Deduplicação
### Objetivo
Retirar a dependência de inserção global irrestrita de mercados/filiais por usuário comum.

### Motivo
O schema atual permite contribuições globais sem moderação, o que não escala com segurança de dados.

### Tarefas
- Proveniência e status de publicação de filial.
- Dedupe por sinais múltiplos.
- Sugestão do usuário separada de publicação global.
- Preparar adapter interface para providers futuros.

### Dependências
C6.

### Testes necessários
- sugestão privada/pendente;
- aprovação;
- tentativa de duplicidade;
- RLS e permissões.

### Critérios de aceite
Nenhum usuário comum cria silenciosamente um fato global sem governança.

### Riscos
Duplicar filiais reais ou bloquear contribuição útil por regras excessivamente rígidas.

---

## Sprint C8 — Comparador Compatível com Dados 2.0
### Objetivo
Fazer o comparador consumir identidade e preço elegível novos, mantendo primeiro o modo de compra em um mercado.

### Motivo
O comparador atual usa apenas preço válido legado e não considera condições, frescor ou confiança.

### Tarefas
- Consumir projeção de preço atual/elegível.
- Mostrar cobertura, frescor e confiança.
- Não esconder lacunas.
- Preservar ranking determinístico.
- Modelar `shopping_plan` compatível com futura divisão, sem obrigatoriamente liberar UI multi-mercado nesta Sprint.

### Dependências
C4–C7.

### Testes necessários
- lista completa/parcial;
- preço stale;
- preço inelegível por condição;
- ausência de preço;
- ranking determinístico.

### Critérios de aceite
Resultado explicável e sem preço fabricado, com compatibilidade futura para divisão da compra.

### Riscos
Mudar regra de ranking sem dados de caracterização suficientes.

---

## Depois da fundação
Somente após essas Sprints devem entrar, em Sprints próprias: providers externos, NFC-e, geolocalização, notificações, Premium/entitlements, compartilhamento de casa, comparação dividida, observabilidade avançada e expansão geográfica.

## Próxima Sprint recomendada
**C1 — Gate de Continuidade e Reprodutibilidade.** É a menor intervenção capaz de reduzir risco de todas as Sprints seguintes e não altera regra de negócio.