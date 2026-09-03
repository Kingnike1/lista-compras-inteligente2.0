# PROJECT STATUS — Lista de Compras Inteligente 2.0

## Auditoria
- **Data:** 03/09/2026
- **Branch auditada:** `main`
- **Commit-base analisado:** `d19bc629e50d3e225a02d2cdab85bab612c38464`
- **Escopo:** código, migrations, documentação, branches, PRs, Supabase e deploy Vercel.
- **Regra desta auditoria:** nenhum código funcional foi alterado e nenhuma correção foi aplicada.

## Objetivo do projeto
Aplicação mobile-first para organizar estoque doméstico, lista de compras, orçamento, preços por filial, comparação de mercados, execução da compra, histórico e recomendações determinísticas. A documentação 2.0 amplia essa visão para catálogo global, dados compartilhados, integrações, Admin, confiança, NFC-e, Premium e expansão geográfica.

## Estado geral
**🟡 PARCIAL — MVP funcional com Sprints 1–5 implementadas, porém a arquitetura 2.0 ainda é majoritariamente alvo futuro.**

O sistema real hoje é um monólito modular em Next.js/TypeScript usando Supabase como autenticação e backend de dados. A produção está publicada na Vercel e o build do commit-base passou. O banco de produção possui dados reais e não deve ser resetado durante a evolução.

A documentação 2.0 está significativamente à frente do schema e do código atual. Isso é intencional, mas exige migração controlada.

## Tecnologias realmente utilizadas
- Next.js 16.3.3 no último build Vercel observado.
- React / React DOM.
- TypeScript com `strict: true`.
- Supabase Auth + PostgreSQL + RLS + RPC.
- `@supabase/ssr` e `@supabase/supabase-js`.
- Zod para validação das variáveis públicas obrigatórias.
- Vitest configurado, mas sem testes automatizados encontrados.
- Vercel para Preview e Production.

## Estrutura atual relevante
```text
.
├── .env.example
├── README.md
├── docs/
├── package.json
├── proxy.ts
├── src/
│   ├── app/
│   │   ├── auth/callback/route.ts
│   │   ├── login/page.tsx
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── manifest.ts
│   │   ├── globals.css
│   │   └── onboarding.css
│   ├── lib/
│   │   ├── env.ts
│   │   └── supabase/{client,server,proxy}.ts
│   └── modules/
│       ├── core/contracts.ts
│       ├── household/
│       ├── onboarding/
│       ├── pricing/
│       ├── purchases/
│       ├── recommendation/
│       └── shopping-list/
├── supabase/migrations/0001...0008
├── tsconfig.json
└── vitest.config.ts
```

## Git e histórico
### Branches relevantes
- `main` — produção; auditada nesta revisão.
- `develop` — existe, mas está atrás de `main`.
- `feature/sprint-1-user-house-products`
- `feature/sprint-2-shopping-list-budget`
- `feature/sprint-3-pricing-market-comparison`
- `feature/sprint-4-purchase-mode-history`
- `feature/sprint-5-smart-recommendations`
- `feat/onboarding-tutor`
- `integration/onboarding-tutor-main`
- `feature/sprint-ux-navigation-redesign`

Nenhuma branch estava protegida no GitHub no momento da auditoria.

### PR importante ainda aberta
**PR #9 — Sprint UX — Navegação central e redesign do app**
- Head: `feature/sprint-ux-navigation-redesign`
- Head SHA: `68907ca6d7062583557066bb9be849a2d2c1e8c7`
- Estado: aberta, não mergeada e marcada pelo GitHub como não mergeável no momento da consulta.
- O próprio PR determina que não seja mergeada sem validação funcional/visual do Preview.
- O Preview da branch está `READY` na Vercel e contém o redesign de login/navegação que não existe em `main`.

### `git status`
Um `git status` local não pôde ser obtido nesta sessão porque o ambiente de execução não conseguiu resolver `github.com` durante a tentativa de clone. Portanto, **não é correto afirmar que um checkout local está limpo**.

O alvo remoto auditado é `main` no commit-base acima; o build Vercel clonou esse commit exato com sucesso. A documentação criada por esta auditoria será adicionada depois desse commit-base.

## Funcionalidades
### ✅ CONCLUÍDO no código atual
- Autenticação Google via Supabase OAuth.
- Callback OAuth com troca de código por sessão.
- Proteção da página principal para usuário autenticado.
- Criação automática de casa/perfil no cadastro de novo usuário.
- Perfil da casa: nome, cidade, nome de exibição e perfil de compra.
- Cadastro e remoção de produtos privados da casa.
- Semântica de quantidade de embalagens no estoque.
- Ajuste de estoque e estados `Em casa`, `Acabando`, `Acabou`.
- Lista de compras com quantidade, prioridade, preço previsto e orçamento.
- Ativação de uma lista para modo de compra.
- Cadastro manual de mercado e filial.
- Registro manual de preços por produto/filial.
- Comparador determinístico de um único mercado por vez.
- Seleção de mercado para a compra.
- Modo compra com preços reais.
- Fechamento transacional via RPC `complete_purchase`.
- Histórico das compras recentes.
- Recomendações determinísticas por estoque, perfil e frequência recente.
- Tutorial/onboarding local, armazenado em `localStorage`.
- RLS ativado em todas as 12 tabelas públicas atuais.
- Helpers sensíveis de RLS movidos para schema `private`.

### 🟡 PARCIAL
- **PWA:** existe `manifest`, mas não foi encontrado service worker/offline cache funcional.
- **Comparador:** funciona no modelo legado de um mercado; não há plano dividido, distância, confiança ou elegibilidade de condição de preço.
- **Preços:** o MVP funciona, mas o modelo implementado é anterior ao contrato 2.0 congelado.
- **Produtos:** existe produto doméstico/global-nullable, mas não existe ainda identidade Família → Variante → SKU, múltiplos identificadores ou EAN/GTIN.
- **Mercados:** cadastro manual funciona; descoberta, deduplicação e validação por providers não existem.
- **Recomendações:** são determinísticas e funcionais, mas não existe integração de IA real.
- **UX:** a versão redesenhada existe na PR #9, mas não está integrada à `main`.

### 🔴 NÃO IMPLEMENTADO
- Catálogo global 2.0 completo.
- EAN/GTIN e múltiplos identificadores de produto.
- Products sem código/peso variável modelados pelo contrato novo.
- Providers externos reais de produtos, mercados ou preços.
- Pipeline NFC-e/nota fiscal.
- Admin 2.0 e fila de revisão.
- Workflow de publicação/aprovação de preço manual.
- `price_observation` completo e estados de publicação.
- Promoções/club/app/quantidade mínima como condições estruturadas.
- Comparador com divisão da lista entre mercados.
- Geolocalização automática.
- Notificações in-app/push/e-mail.
- Assinaturas Premium e entitlements.
- Casa compartilhada/múltiplos membros e papéis.
- Jobs assíncronos, retry e dead-letter queue.
- Métricas de produto/custo/observabilidade definidas nos docs 2.0.
- Admin audit log completo.
- Escrita offline; por decisão de produto, não é prevista para o lançamento 2.0.

## Backend e banco de dados
O backend é composto principalmente por Supabase/PostgreSQL, RLS, triggers e RPC. Não há um servidor Express/FastAPI separado.

### Schema público real confirmado
`categories`, `households`, `inventory_items`, `prices`, `products`, `purchase_items`, `purchases`, `shopping_list_items`, `shopping_lists`, `store_locations`, `stores`, `user_profiles`.

Todas essas tabelas estavam com RLS habilitado.

O histórico de migrations do projeto Supabase continha oito versões, compatíveis com as oito migrations versionadas no repositório. O banco contém dados reais, incluindo perfis/casas, produtos, preços e pelo menos um histórico de compra; tratar produção como persistência que precisa de migrações reversíveis e reconciliação.

## Autenticação e autorização
### ✅ Pontos positivos
- Supabase Auth com OAuth Google.
- Sessão SSR atualizada via proxy.
- Página raiz valida usuário no servidor.
- RLS protege recursos privados por `household_id`.
- Callback impede redirect externo arbitrário ao aceitar apenas caminhos iniciados por `/`.
- Helpers de segurança foram endurecidos em migrations posteriores.

### ⚠️ Pontos de atenção
- O modelo atual é essencialmente uma pessoa → uma casa; não existe membership/roles adequado para a casa compartilhada futura.
- `stores`, `store_locations` e preços manuais têm inserção permitida a usuário autenticado no modelo legado. Isso não atende a governança 2.0 de dados compartilhados.
- Admin/operadores, MFA/reautenticação privilegiada e trilha de auditoria ainda não existem.

## Integrações externas
### ✅ Ativas
- Supabase.
- Google OAuth através da configuração do Supabase/Google Cloud.
- Vercel/GitHub para deploy automático.

### 🔴 Apenas contratos/documentação
- `PriceProvider` e `AIProvider` existem como interfaces, sem implementação real encontrada.
- APIs externas de catálogo, mercados e preços descritas nos docs 2.0 ainda não aparecem no código funcional.

## Variáveis de ambiente
O código realmente exige:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`.env.example` também cita `NEXT_PUBLIC_APP_URL`, porém o código auditado não a lê atualmente.

`AI_API_KEY` aparece apenas como comentário/exemplo; nenhuma integração de IA real foi encontrada.

Segredos do Google OAuth devem permanecer configurados no provedor/Supabase e nunca em variáveis `NEXT_PUBLIC_*` ou no repositório.

## Testes e validação real
### ✅ Executado/observado com sucesso
No último deploy de produção do commit-base `d19bc629` na Vercel:
- instalação/resolução das dependências: OK;
- `npm run build`: OK;
- compilação Next.js: OK;
- etapa TypeScript do build: OK;
- geração das rotas: OK;
- deployment: `READY`;
- `/login` em produção: HTTP 200.

O Preview da PR #9 no commit `68907ca` também teve build concluído com sucesso.

### 🟡 Histórico de validação manual
`docs/testes-por-sprint.md` registra Sprints 1–5 como validadas anteriormente. Isso é evidência histórica, não uma reexecução nesta auditoria.

### 🐛 / NÃO EXECUTADO NESTA SESSÃO
- `npm test`: não executado localmente; nenhum arquivo `src/**/*.test.ts` foi encontrado.
- `npm run lint`: não executado localmente.
- `npm run dev`: não executado localmente.
- `git status`: não executável sem checkout local nesta sessão.

A tentativa de clone falhou por indisponibilidade de DNS para `github.com` no ambiente usado pela auditoria. Isso é limitação do ambiente de auditoria, não evidência de defeito do repositório.

## Bugs e inconsistências detectados
### P0
1. **🐛 Modelo de preço legado incompatível com o contrato 2.0.** Usuário autenticado consegue publicar preço manual diretamente em `prices`; o frontend grava `confidence: 1` e validade de 7 dias. O contrato 2.0 exige revisão administrativa antes de preço manual se tornar compartilhado/oficial, além de semântica temporal/publicação mais rica. Não migrar novas features de preço sobre o schema atual sem uma migration de compatibilidade.

### P1
2. **🐛 Preço zero é aceito no cadastro manual.** Frontend rejeita apenas `< 0` e o banco possui `price >= 0`, enquanto o guia manual de testes diz que zero deve ser inválido.
3. **⚠️ Preços desatualizados somem completamente.** O código filtra `valid_until >= now`; o contrato 2.0 determina preservar e sinalizar preço antigo, não simplesmente escondê-lo.
4. **⚠️ Cadastro global de mercado/filial é aberto a qualquer autenticado.** Não há estado de revisão/proveniência/deduplicação administrativa.
5. **⚠️ Dependências não reproduzíveis.** Todas estão em `latest` e não há lockfile versionado encontrado.
6. **⚠️ PR #9 contém a UX desejada, mas está aberta, divergente e não mergeável no momento.** Deve ser preservada e reconciliada depois de validação.
7. **⚠️ Sem testes automatizados.** Vitest está configurado, mas nenhum teste foi localizado.
8. **⚠️ Não há script explícito de typecheck.** O TypeScript é hoje validado indiretamente por `next build`.
9. **⚠️ O script `lint` depende de `next lint` enquanto o projeto resolve Next.js 16.3.3.** Precisa ser validado/substituído na Sprint de hardening, sem alteração nesta auditoria.
10. **⚠️ Operações produto + estoque não são atômicas.** O cliente cria produto, cria estoque e tenta compensar deletando o produto se a segunda etapa falhar.
11. **⚠️ Duplicidade/concor­rência de lista.** A prevenção de item duplicado é apenas no cliente e não há constraint identificada garantindo uma única lista ativa/draft ou um item único por produto/lista.
12. **⚠️ `saveHouse` atualiza perfil filtrando por `household_id`.** RLS impede afetar outro usuário hoje, mas a operação será semanticamente inadequada quando uma casa puder ter vários membros.
13. **⚠️ Código de contratos de providers está sem uso.** `PriceProvider` e `AIProvider` são scaffolding, não integrações.
14. **⚠️ README não documenta setup, arquitetura ou estado.** Contém apenas o título do projeto.
15. **⚠️ `docs/architecture.md` é um documento histórico do MVP, não a arquitetura real atual completa.** Para evitar ambiguidade, `docs/ARCHITECTURE.md` desta auditoria passa a descrever o sistema implementado.

## Dívida técnica
### P1
- Fixar versões e criar lockfile.
- Padronizar lint/typecheck/test e CI.
- Construir testes automáticos para cálculos, RLS e fechamento de compra.
- Formalizar migration/reconciliation antes do schema 2.0.
- Reconciliar PR #9 sem perder UX e sem misturar com migrations de domínio.

### P2
- Reduzir a concentração de responsabilidades em `HouseholdDashboard`.
- Introduzir camada de serviços/use-cases para operações multi-etapa críticas.
- Padronizar tratamento de erros e observabilidade.
- Remover hard-code de BRL apenas quando a migration global de moeda for implementada.
- Medir performance das consultas antes de escalar histórico de preços.

### P3
- Providers externos, NFC-e, notificações, Premium, Admin avançado, expansão geográfica e recursos internacionais conforme roadmap 2.0.

## Segurança
**✅ Base aceitável para o MVP privado:** Auth, RLS em todas as tabelas públicas e helpers endurecidos são bons sinais.

**⚠️ Antes de dados globais/compartilhados:** é obrigatório adicionar governança de contribuição, estados de publicação, revisão, proteção contra abuso, papéis administrativos e auditoria. O principal risco atual não é leitura indevida evidente dos dados privados, mas contaminação/abuso dos dados compartilhados legados.

## Performance
No volume atual não foram encontradas evidências de gargalo de escala. Existem índices básicos para household, status, preços e localização. O maior risco futuro é histórico de preços crescendo sem projeção/índices específicos para preço atual. Não otimizar prematuramente antes da migration 2.0.

## Infraestrutura
- **Vercel Production:** ativa e `READY` no commit-base auditado.
- **Vercel Preview:** branch UX/PR #9 possui deployment `READY`.
- **Supabase:** banco/Auth ativos, migrations presentes e dados persistidos.
- **CI dedicada:** não encontrada no repositório; a principal validação automatizada observável hoje é o build da Vercel.

## Classificação resumida
| Área | Estado |
|---|---|
| MVP Sprints 1–5 | ✅ CONCLUÍDO funcionalmente conforme código + histórico de validação |
| Produção/build | ✅ CONCLUÍDO no commit auditado |
| Auth + RLS MVP | ✅ CONCLUÍDO |
| Testes automatizados | 🔴 NÃO IMPLEMENTADO |
| UX redesign PR #9 | 🟡 PARCIAL |
| Arquitetura 2.0 em documentação | ✅ DEFINIDA em grande parte |
| Arquitetura 2.0 no código/schema | 🟡 PARCIAL / majoritariamente futura |
| Catálogo global | 🔴 NÃO IMPLEMENTADO |
| Preço 2.0 | 🐛 COM PROBLEMA de incompatibilidade legado × contrato |
| Admin/review queue | 🔴 NÃO IMPLEMENTADO |
| Providers externos | 🔴 NÃO IMPLEMENTADO |
| NFC-e | 🔴 NÃO IMPLEMENTADO |
| Premium/entitlements | 🔴 NÃO IMPLEMENTADO |
| Observabilidade/CI | ⚠️ DÍVIDA TÉCNICA |
| Estratégia de merge da PR #9 | ❓ PRECISA DE VALIDAÇÃO antes do merge |

## Próxima ação recomendada
**Sprint C1 — Gate de Continuidade e Reprodutibilidade.**

Antes de migrar produto/preço para o 2.0, tornar o estado atual repetível e verificável: fixar dependências, criar lockfile, validar/corrigir os comandos de lint/typecheck/test, estabelecer uma pequena suíte automatizada de caracterização e registrar um gate de build. Essa Sprint não deve mudar regra de negócio. Depois disso, reconciliar a PR #9 e só então iniciar migrations de domínio 2.0.
