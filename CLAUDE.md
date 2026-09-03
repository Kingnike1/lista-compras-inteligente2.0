# CLAUDE.md — Ponto de Entrada para Agentes

## O projeto
**Lista de Compras Inteligente 2.0** é uma aplicação Next.js + TypeScript com Supabase e Vercel. O estado implementado atual cobre o MVP de casa/estoque, lista/orçamento, preços manuais por filial, comparação de um mercado, modo compra/histórico e recomendações determinísticas.

A arquitetura 2.0 documentada é mais ampla do que o código atual. Não trate funcionalidades descritas em `docs/2.0-*.md` como já implementadas.

## LEITURA OBRIGATÓRIA antes de implementar
Sempre leia, nesta ordem:
1. `CLAUDE.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/ROADMAP.md`
4. `docs/ARCHITECTURE.md`

Depois leia o contrato 2.0 específico da área que será alterada.

## Arquitetura atual resumida
- Monólito modular Next.js App Router.
- Supabase Auth + PostgreSQL + RLS.
- Frontend acessa Supabase diretamente em vários módulos.
- `public.complete_purchase` é a principal operação transacional server-side no banco.
- Vercel publica `main` em Production e branches em Preview.
- O schema atual é legado/MVP; a migração 2.0 deve ser evolutiva, não rewrite.

Consulte `docs/ARCHITECTURE.md` para detalhes do sistema realmente implementado.

## Comandos atuais
```bash
npm install
npm run dev
npm test
npm run lint
npm run build
npm start
```

### Atenção
- Não há testes automatizados encontrados no baseline auditado.
- Não existe script dedicado de typecheck no baseline.
- `npm run lint` ainda precisa de validação contra a versão atual de Next.js.
- Dependências estão em `latest` e não há lockfile versionado no baseline; isso é prioridade da Sprint C1.

Não esconda falhas. Registre a saída real do comando.

## Variáveis de ambiente obrigatórias atuais
```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Nunca exponha ou comite secrets. Nunca coloque service-role key, OAuth client secret, senha ou API key privada no frontend.

## Regras que não devem ser quebradas
- IA nunca inventa preço, identidade de produto ou fato.
- Cálculos financeiros/ranking principal devem ser determinísticos.
- Filiais físicas mantêm seus próprios preços.
- Histórico não deve ser silenciosamente destruído.
- Dados privados devem continuar protegidos por RLS/server-side authorization.
- Não remover/afrouxar RLS para “fazer funcionar”.
- Não usar `service_role` no navegador.
- Não resetar banco de produção: existem dados reais.
- Migrations devem ser pequenas, aditivas/reversíveis quando possível e ter reconciliação.
- Preço manual de usuário **não pode se tornar compartilhado/oficial automaticamente no 2.0**.
- Não adicionar preço fictício para cobrir lacunas do comparador.
- Não misturar redesign visual com migration de domínio sem necessidade.

## Estado especial da UX
Existe uma PR aberta:
- **PR #9** — `feature/sprint-ux-navigation-redesign`

Ela contém o redesign visual/login/navegação que não está em `main`. O próprio PR exige validação funcional/visual antes do merge. Preserve essa branch; não descarte ou reimplemente seu trabalho às cegas.

## Documentação: atual × futuro
- `docs/PROJECT_STATUS.md`: estado real e problemas conhecidos.
- `docs/ROADMAP.md`: sequência recomendada de Sprints.
- `docs/ARCHITECTURE.md`: arquitetura implementada atual.
- `docs/SETUP.md`: setup e validação.
- `docs/architecture.md`: decisões históricas do MVP.
- `docs/2.0-*.md`: arquitetura/contratos-alvo 2.0.

Se a pergunta for “o que funciona hoje?”, valide no código e schema. Se for “qual é o comportamento alvo?”, consulte o contrato 2.0 mais recente.

## Como trabalhar em uma Sprint
1. Confirmar a Sprint em `docs/ROADMAP.md`.
2. Ler o estado e contratos relacionados.
3. Verificar branch/status/commit antes de editar.
4. Fazer a menor alteração capaz de cumprir o objetivo.
5. Não corrigir problemas fora do escopo salvo risco bloqueador e explicitamente documentado.
6. Para banco, testar migration fora da produção primeiro.
7. Executar os testes do critério de aceite.
8. Fazer build.
9. Validar Preview quando houver UI.
10. Atualizar `PROJECT_STATUS.md` e `ROADMAP.md` somente com fatos confirmados.

## Como validar uma alteração
No baseline atual:
```bash
npm test
npm run build
```

Também tente:
```bash
npm run lint
```

e registre o resultado real. Após a Sprint C1, deve existir um gate explícito:
```text
install → lint → typecheck → test → build → smoke/Preview
```

Além dos comandos automáticos, execute os testes manuais afetados em `docs/testes-por-sprint.md`.

## Proibições para futuros agentes
- Não assumir que README está atualizado.
- Não afirmar que uma feature existe só porque há documentação.
- Não fazer rewrite geral do app.
- Não alterar produção diretamente sem migration/validação apropriada.
- Não mergear PR #9 automaticamente.
- Não criar microserviços sem necessidade comprovada.
- Não introduzir dependência externa no núcleo sem adapter/provider.
- Não substituir regras determinísticas por LLM.
- Não apagar dados legados antes de reconciliação e cutover validado.

## Próxima Sprint recomendada
A auditoria recomenda **Sprint C1 — Gate de Continuidade e Reprodutibilidade**, descrita em `docs/ROADMAP.md`. Não comece outra Sprint antes de entender por que C1 vem primeiro.