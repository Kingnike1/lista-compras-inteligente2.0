# SETUP — Ambiente de Desenvolvimento

Este guia descreve o setup do **estado atual do repositório**, auditado em 03/09/2026. Não contém segredos.

## Pré-requisitos
- Git.
- Node.js e npm.
- Acesso a um projeto Supabase compatível com as migrations do repositório.
- Para login Google: provider Google configurado no Supabase Auth e URL de callback local autorizada.

> O projeto ainda não fixa uma versão de Node e não possui lockfile versionado no estado auditado. Isso é uma dívida técnica registrada para a Sprint C1. O último build Vercel observado resolveu Next.js 16.3.3 com sucesso.

## 1. Clonar
```bash
git clone https://github.com/Kingnike1/lista-compras-inteligente2.0.git
cd lista-compras-inteligente2.0
```

Confirme a branch desejada:
```bash
git branch --show-current
git status
git log -5 --oneline
```

Para reproduzir a produção auditada antes dos commits de documentação, o commit-base foi:
```text
d19bc629e50d3e225a02d2cdab85bab612c38464
```

Para desenvolvimento novo, use a branch definida pelo fluxo de trabalho atual; não desenvolva diretamente sobre uma branch antiga de Sprint sem verificar `docs/PROJECT_STATUS.md` e `docs/ROADMAP.md`.

## 2. Configurar variáveis de ambiente
Copie o exemplo:

Linux/macOS:
```bash
cp .env.example .env.local
```

Windows PowerShell:
```powershell
Copy-Item .env.example .env.local
```

Preencha apenas com os valores do ambiente autorizado.

### Variáveis realmente exigidas pelo código atual
```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

`.env.example` também contém `NEXT_PUBLIC_APP_URL`, porém o código auditado não a consome atualmente.

Nunca coloque em `NEXT_PUBLIC_*`:
- Google Client Secret;
- service role key;
- tokens privados;
- API keys secretas;
- senhas.

## 3. Configurar OAuth Google
No Supabase Auth/Google Cloud, o fluxo precisa aceitar o callback local:
```text
http://localhost:3000/auth/callback
```

Previews e Production da Vercel também precisam estar allow-listed conforme o fluxo de deploy.

O segredo OAuth é configurado fora do repositório.

## 4. Instalar dependências
No estado atual:
```bash
npm install
```

### Limitação atual
O projeto usa versões `latest` no `package.json` e não possui lockfile versionado encontrado na auditoria. Portanto, duas instalações em datas diferentes podem resolver versões diferentes. Não faça upgrades voluntários durante setup; a Sprint C1 deve congelar as versões conhecidas.

## 5. Executar em desenvolvimento
```bash
npm run dev
```

Abra:
```text
http://localhost:3000
```

Sem sessão, `/` deve redirecionar para `/login`.

## 6. Testar
### Testes automatizados
O script existe:
```bash
npm test
```

Porém, na auditoria não foram encontrados arquivos `src/**/*.test.ts`. Portanto a suíte automatizada ainda precisa ser criada; não interprete ausência de testes como validação funcional.

Modo watch:
```bash
npm run test:watch
```

### Testes manuais
Use:
```text
docs/testes-por-sprint.md
```

Esse arquivo registra cenários para Sprints 1–5. Os registros antigos de validação são históricos; após uma alteração relevante, execute novamente os cenários afetados.

## 7. Typecheck
Não existe script dedicado de `typecheck` no estado atual.

O último `npm run build` executado pela Vercel incluiu a etapa TypeScript e passou. A criação de um comando explícito será parte da Sprint C1.

Não invente um script novo durante simples setup sem que a Sprint correspondente esteja em execução.

## 8. Lint
O `package.json` atual declara:
```bash
npm run lint
```

que aponta para `next lint`.

Esse comando ainda precisa ser validado contra a versão atual do Next.js resolvida no projeto. A auditoria não o executou localmente. Se falhar, registre o erro e trate na Sprint C1; não faça refatoração ampla para “zerar lint” durante outra Sprint.

## 9. Build de produção
```bash
npm run build
```

O último build de produção auditado na Vercel passou no commit-base `d19bc629...`.

Para executar o build gerado localmente:
```bash
npm start
```

## 10. Banco de dados
Migrations versionadas:
```text
supabase/migrations/0001_sprint0_core.sql
...
supabase/migrations/0008_sprint4_purchase_completion.sql
```

### Produção
O projeto Supabase de produção contém dados reais. **Não resetar, recriar ou aplicar SQL destrutivo por conveniência.**

### Ambiente novo/staging
O repositório não possui, no estado auditado, um script npm padronizado para instalar/ligar a Supabase CLI e aplicar migrations. Portanto:
- use um ambiente Supabase separado;
- aplique as migrations na ordem;
- valide schema/RLS antes de apontar a aplicação para ele;
- nunca use `service_role` no frontend.

A padronização da execução/reconciliação de migrations deve acontecer antes das migrations 2.0 relevantes.

## 11. Smoke test mínimo
Após subir o ambiente:
1. abrir `/login`;
2. autenticar com Google;
3. confirmar redirecionamento para `/`;
4. confirmar que a casa/perfil carrega;
5. criar ou visualizar produto/estoque em ambiente de teste;
6. atualizar a página e confirmar persistência;
7. executar `npm run build` antes de entregar alteração.

Não use produção para criar dados descartáveis de teste quando um ambiente de Preview/staging estiver disponível.

## 12. Preview e Production
- `main`: Production na Vercel.
- branches de feature: Preview quando integração Vercel/GitHub estiver ativa.
- `develop`: historicamente destinado a validação/staging, porém na auditoria está atrás de `main`; não assuma que representa o estado mais recente.

A PR #9 (`feature/sprint-ux-navigation-redesign`) possui Preview próprio e não deve ser mergeada sem validação visual/funcional.

## 13. Validação antes de entregar qualquer futura alteração
Enquanto a Sprint C1 não padronizar o gate, use no mínimo:
```bash
npm test
npm run build
```

e execute os testes manuais do fluxo alterado. Tente `npm run lint` e registre o resultado real; não esconda falhas.

Depois da Sprint C1, o gate oficial deve ser documentado aqui como:
```text
install → lint → typecheck → test → build → smoke/Preview
```

## Ordem de leitura para outro desenvolvedor/IA
Antes de implementar:
1. `CLAUDE.md`
2. `docs/PROJECT_STATUS.md`
3. `docs/ROADMAP.md`
4. `docs/ARCHITECTURE.md`
5. contrato `docs/2.0-*.md` específico da Sprint

Se documentação e código divergirem sobre o **estado atual**, valide no código/schema. Se a dúvida for sobre o **alvo 2.0**, siga o contrato normativo mais recente e a estratégia de migração.