# Guia de Testes por Sprint

Este documento reúne os testes funcionais manuais do projeto **Lista de Compras Inteligente 2.0**, separados por Sprint.

> Regra de validação: executar os testes no Preview da Sprint antes do merge para `main`. Uma Sprint só deve ser considerada validada quando os resultados esperados forem confirmados.

## Registro de validação

| Sprint | Status | Data | Observações |
| --- | --- | --- | --- |
| Sprint 1 | Validada | — | Fluxo funcional aprovado antes da integração. |
| Sprint 2 | Validada | 29/08/2026 | Lista e orçamento aprovados. |
| Sprint 3 | Validada | 29/08/2026 | Preços por filial e comparação aprovados. |
| Sprint 4 | Validada | 29/08/2026 | Modo compra, fechamento e histórico aprovados. |
| Sprint 5 | Validada | 29/08/2026 | Recomendações e semântica de embalagens aprovadas. |
| Sprint UX | Pendente | — | Navegação central e redesign aguardando validação funcional/visual. |

---

## Sprint UX — Navegação e Redesign do App

### Objetivo
Transformar a interface acumulada das Sprints 1–5 em uma experiência mobile-first organizada por áreas, preservando as regras de negócio existentes.

### Login
- [ ] Abrir o Preview sem autenticação e confirmar a nova tela de entrada.
- [ ] Confirmar identidade visual, proposta do produto e botão **Continuar com Google**.
- [ ] Entrar com Google e confirmar retorno correto ao aplicativo.
- [ ] Confirmar mensagem adequada caso o OAuth não possa ser iniciado.

### Navegação central
- [ ] Confirmar menu inferior com **Início**, **Minha Casa**, **Lista**, **Mercados** e **Mais**.
- [ ] Trocar entre todas as abas e confirmar que apenas a área escolhida domina a tela.
- [ ] Confirmar indicação visual da aba ativa.
- [ ] Confirmar que o menu permanece acessível no celular sem cobrir ações importantes.

### Início
- [ ] Confirmar saudação e resumo da casa.
- [ ] Confirmar quantidade de produtos e alertas de reposição.
- [ ] Confirmar recomendações inteligentes da Sprint 5.
- [ ] Usar os cards de resumo para navegar para Estoque ou Lista.

### Minha Casa
- [ ] Editar perfil da casa e salvar.
- [ ] Cadastrar produto e embalagem.
- [ ] Alterar estoque com `+` e `−`.
- [ ] Alterar status Em casa/Acabando/Acabou.
- [ ] Confirmar semântica de embalagens da Sprint 5.

### Lista e Mercados
- [ ] Criar/editar lista e orçamento na aba **Lista**.
- [ ] Confirmar cálculos existentes da Sprint 2.
- [ ] Abrir **Mercados**, registrar/consultar preços e comparar filiais.
- [ ] Confirmar que preços ausentes continuam não sendo inventados.

### Mais / Compra
- [ ] Abrir **Mais** e confirmar perfil, Modo compra/histórico e saída da conta.
- [ ] Executar um fechamento de compra já suportado pela Sprint 4.
- [ ] Confirmar histórico após atualização da página.
- [ ] Sair e confirmar retorno ao novo login.

### Responsividade e regressão
- [ ] Testar principalmente em tela de celular.
- [ ] Confirmar ausência de rolagem horizontal e campos cortados.
- [ ] Confirmar que botões principais são fáceis de tocar.
- [ ] Atualizar/relogar e confirmar persistência.
- [ ] Confirmar que nenhuma regra das Sprints 1–5 mudou por causa do redesign.

### Critério de aprovação
A Sprint UX passa quando login e navegação estão claros no celular, cada domínio possui uma área compreensível, o usuário consegue chegar às funções principais em poucos toques e todas as regras funcionais das Sprints 1–5 continuam corretas.
