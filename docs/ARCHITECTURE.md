# ARCHITECTURE — Estado Implementado

> Este documento descreve **como o sistema funciona hoje no código real**, auditado em 03/09/2026. Ele não substitui os contratos-alvo em `docs/2.0-*.md`.
>
> Atenção à diferença de nome: `docs/architecture.md` registra decisões históricas do MVP; este `docs/ARCHITECTURE.md` é o retrato atual para continuidade.

## Visão geral
O sistema atual é um **monólito modular Next.js + TypeScript**, hospedado na Vercel, com Supabase fornecendo autenticação, PostgreSQL, Row Level Security e uma RPC transacional para finalizar compras.

```text
Browser
  │
  ├─ Next.js App Router
  │   ├─ /login
  │   ├─ /auth/callback
  │   └─ /
  │       └─ HouseholdDashboard
  │           ├─ RecommendationPanel
  │           ├─ ShoppingListPanel
  │           ├─ PricingPanel
  │           └─ PurchasePanel
  │
  ├─ Supabase Browser Client ───────────────┐
  │                                         │
Next.js Server Components / Proxy           │
  └─ Supabase SSR Client ───────────────────┤
                                            ▼
                                      Supabase
                                      ├─ Auth
                                      ├─ PostgreSQL
                                      ├─ RLS
                                      ├─ triggers
                                      └─ complete_purchase RPC
```

## Frontend
### App Router
`src/app/page.tsx` é a entrada autenticada. Ele obtém o usuário pelo Supabase no servidor e redireciona para `/login` quando não há sessão.

`src/app/login/page.tsx` é uma página client-side simples com login Google. O OAuth retorna para `/auth/callback`.

`src/app/auth/callback/route.ts` troca o código OAuth pela sessão. O parâmetro opcional `next` é limitado a caminhos internos iniciados por `/`, evitando redirect arbitrário externo.

### Dashboard atual
`src/modules/household/dashboard.tsx` concentra a composição principal e parte importante da lógica de UI/CRUD. Hoje a página autenticada é essencialmente uma tela longa com:
1. perfil da casa;
2. cadastro e estoque;
3. recomendações;
4. lista de compras;
5. preços/mercados;
6. modo compra/histórico.

O redesign com navegação separada por áreas existe na PR #9, mas **não pertence à arquitetura de `main` ainda**.

### Estado no cliente
Os módulos usam React `useState`, `useEffect`, `useMemo` e `useCallback`. Não existe store global externa. As leituras e escritas são feitas diretamente com o cliente Supabase em cada módulo.

## Módulos funcionais
### Household
Responsável pelo perfil da casa, produtos domésticos e estoque.

Principais tabelas:
- `user_profiles`
- `households`
- `products`
- `inventory_items`

Fluxo de criação de produto atual:
1. inserir `products`;
2. inserir `inventory_items`;
3. se estoque falhar, cliente tenta deletar o produto como compensação.

Esse fluxo não é uma transação de banco e deve ser tratado como dívida técnica até uma Sprint própria.

### Shopping List
`src/modules/shopping-list/panel.tsx` mantém a lista corrente em estado `draft` ou `active`.

Tabelas:
- `shopping_lists`
- `shopping_list_items`

Comportamentos atuais:
- cria uma lista `draft` automaticamente quando nenhuma existe;
- orçamento e dias planejados opcionais;
- preço previsto é informado pelo usuário;
- total previsto = soma de `quantidade × preço previsto`;
- adicionar produto já existente tenta aumentar a quantidade no cliente;
- lista pode ser ativada para modo compra.

Não existe ainda `shopping_plan` multi-mercado.

### Pricing
`src/modules/pricing/panel.tsx` implementa o modelo legado de preço.

Tabelas:
- `stores`
- `store_locations`
- `prices`

Fluxo atual:
- usuário autenticado pode cadastrar mercado/filial;
- usuário registra preço manual por produto/filial;
- frontend grava `source_type = manual`, `confidence = 1` e `valid_until = observed_at + 7 dias`;
- consulta ignora preços cujo `valid_until` já passou;
- comparação calcula a cobertura e o total conhecido por filial;
- ranking privilegia comparação completa, depois maior cobertura, depois menor total;
- uma única filial pode ser selecionada na lista.

Este modelo é **legado e não equivale ao contrato de preço 2.0**.

### Purchases
`src/modules/purchases/panel.tsx` executa o modo compra.

A finalização chama `public.complete_purchase(uuid, jsonb)` criada na migration `0008`.

A RPC:
- exige uma lista `active` da casa autenticada;
- bloqueia a linha da lista com `FOR UPDATE`;
- exige mercado selecionado;
- exige pelo menos um item marcado;
- exige preço real positivo para cada item marcado;
- calcula o total no banco;
- cria `purchases` e `purchase_items`;
- registra `actual_price` nos itens;
- muda a lista para `completed`;
- ocorre na mesma transação PostgreSQL.

Esse é o fluxo multi-etapa mais robusto do sistema atual.

### Recommendation
`src/modules/recommendation/panel.tsx` é totalmente determinístico.

Entradas:
- status/quantidade do estoque;
- perfil `economic`, `balanced` ou `practical`;
- frequência do produto nas últimas compras consultadas.

O módulo não usa LLM e não cria preços. O usuário precisa clicar para adicionar uma recomendação à lista.

### Onboarding
`src/modules/onboarding/tutorial.tsx` implementa um guia de quatro passos. O estado de concluído/dispensado é guardado em `localStorage`, com chave isolada pelo `householdId`.

## Supabase e autenticação
### Clientes
- `src/lib/supabase/client.ts`: browser client.
- `src/lib/supabase/server.ts`: server client usando cookies do Next.js.
- `src/lib/supabase/proxy.ts`: atualiza sessão/cookies no proxy.
- `proxy.ts`: aplica o proxy a praticamente todas as rotas, exceto assets estáticos.

### Novo usuário
Migration de segurança cria trigger em `auth.users`. Ao entrar um novo usuário:
1. cria `households` com nome padrão `Minha Casa`;
2. cria `user_profiles` apontando para essa casa.

O modelo atual é uma associação direta `user_profiles.household_id`. Não há tabela de membros/papéis para compartilhamento de casa.

## Banco de dados atual
### Tabelas públicas
- `categories`
- `households`
- `inventory_items`
- `prices`
- `products`
- `purchase_items`
- `purchases`
- `shopping_list_items`
- `shopping_lists`
- `store_locations`
- `stores`
- `user_profiles`

Todas estavam com RLS habilitado na auditoria.

### Segurança RLS
O repositório passou por endurecimento progressivo:
- migrations iniciais criaram helpers e policies;
- migrations posteriores moveram helpers para schema `private`;
- execução dos helpers foi restringida;
- índices de suporte a RLS/FKs foram adicionados.

Dados privados de casa são filtrados por `household_id` derivado do usuário autenticado.

### Dados compartilhados atuais
`categories`, `stores`, `store_locations` e certos produtos/preços têm comportamento compartilhado. A governança é de MVP: qualquer autenticado pode inserir `stores` e `store_locations`, e pode inserir preço manual para produto acessível. Isso precisa mudar antes da operação global 2.0.

## Migrations
O repositório possui oito migrations:
- `0001`: schema núcleo do MVP;
- `0002`: RLS, helpers e trigger de novo usuário;
- `0003`: move helpers sensíveis ao schema `private`;
- `0004`: restringe execução de helpers privados;
- `0005`: otimizações de RLS e índices de FK;
- `0006`: perfil/produto/estoque e constraints da Sprint 1;
- `0007`: cadastro manual de mercados e preços da Sprint 3;
- `0008`: fechamento transacional e histórico da Sprint 4.

O projeto Supabase real possui oito versões de migration aplicadas, alinhadas em quantidade ao repositório.

## Contratos e scaffolding não utilizados
`src/modules/core/contracts.ts` define `PriceProvider`, `AIProvider` e uma forma antiga de `PriceObservation`.

Nenhuma implementação de `PriceProvider` ou `AIProvider` foi encontrada. Esses contratos são scaffolding e não devem ser confundidos com integração ativa.

Além disso, o `PriceObservation` TypeScript atual está atrás do contrato normativo em `docs/2.0-contrato-preco.md`.

## APIs e integrações
### Em uso
- Supabase Auth/Database.
- Google OAuth via Supabase.
- Vercel conectado ao GitHub para deploys.

### Não implementadas
Google Places, OpenStreetMap/Overpass, Open Food Facts, Open Prices, OCR/NFC-e, LLM/IA e demais providers descritos na arquitetura 2.0.

## PWA/offline
Existe `src/app/manifest.ts`, mas não foi encontrado service worker nem camada de cache/offline funcional. Portanto, o app está apenas **preparado superficialmente para instalação**, não deve ser descrito como app offline implementado.

## Cálculos e regras
Os cálculos financeiros atuais são determinísticos no frontend e, no fechamento, também no PostgreSQL. Não existe IA no caminho crítico.

Moeda é formatada como BRL no código atual. O schema legado de `prices` não guarda moeda por observação, portanto a arquitetura mundial 2.0 ainda não está refletida no banco.

## Deploy
`main` gera Production na Vercel. Branches/PRs podem gerar Preview.

No commit-base auditado `d19bc629...`, a Vercel executou instalação, `next build`, verificação TypeScript incluída no build, geração de rotas e deployment com sucesso.

## Limites arquiteturais atuais
- componentes client-side acessam Supabase diretamente;
- poucas operações possuem service/use-case server-side;
- `HouseholdDashboard` concentra responsabilidades;
- schema ainda representa o MVP e não a arquitetura global 2.0;
- sem fila assíncrona;
- sem Admin operacional;
- sem observabilidade de domínio;
- sem entitlements;
- sem workflow de contribuição/publicação global.

## Fonte de verdade para continuidade
Antes de mudar o sistema, consultar nesta ordem:
1. `CLAUDE.md`;
2. `docs/PROJECT_STATUS.md`;
3. `docs/ROADMAP.md`;
4. este `docs/ARCHITECTURE.md`;
5. contratos específicos `docs/2.0-*.md` para o alvo futuro.

O código real e o schema real prevalecem quando a pergunta é “o que existe hoje”; os contratos 2.0 prevalecem quando a pergunta é “para onde a migração deve ir”.