# Guia de Testes por Sprint

Este documento reúne os testes funcionais manuais do projeto **Lista de Compras Inteligente 2.0**, separados por Sprint.

> Regra de validação: executar os testes no Preview da Sprint antes do merge para `main`. Uma Sprint só deve ser considerada validada quando os resultados esperados forem confirmados.

---

## Sprints 1–4 — Regressão consolidada

Antes de validar uma nova Sprint, confirmar que continuam funcionando: autenticação Google, Minha Casa, cadastro/estoque, lista e orçamento, preços por filial, comparação de mercados, modo compra, fechamento e histórico.

---

## Sprint 5 — Recomendações inteligentes e semântica de embalagens

### Objetivo
Validar recomendações determinísticas de reposição e corrigir a interpretação do estoque para quantidade de embalagens, sem inventar preços e sem adicionar itens automaticamente.

### Preparação

- Entrar com a conta Google.
- Ter pelo menos três produtos cadastrados.
- Usar, por exemplo: Arroz pacote de 5 kg, Feijão pacote de 1 kg e Leite caixa de 1 L.

### Embalagens e estoque

- [ ] Confirmar que as unidades do cadastro aparecem em português.
- [ ] Cadastrar Arroz com tamanho da embalagem `5`, unidade `quilograma (kg)` e `3` embalagens em casa.
- [ ] Confirmar que o estoque mostra **3 embalagens**, e não **3 kg**.
- [ ] Confirmar que o total físico mostra **15 kg**.
- [ ] Usar `+` e `−` e confirmar que cada clique altera uma embalagem inteira.
- [ ] Confirmar que a quantidade de embalagens nunca fica negativa.

### Recomendações por estoque

- [ ] Marcar Arroz como **Acabou**.
- [ ] Confirmar que Arroz aparece em **Recomendações inteligentes**.
- [ ] Marcar Feijão como **Acabando**.
- [ ] Confirmar que Feijão também é recomendado.
- [ ] Manter Leite como **Em casa** e confirmar que ele não é sugerido somente por estar cadastrado.
- [ ] Confirmar que cada recomendação explica o motivo, como `acabou em casa` ou `estoque acabando`.

### Perfil da casa

- [ ] Selecionar perfil **Econômico**, salvar e confirmar sugestão conservadora para item acabado.
- [ ] Selecionar perfil **Equilibrado**, salvar e confirmar sugestão intermediária.
- [ ] Selecionar perfil **Prático**, salvar e confirmar pequena reserva para item que precisa reposição.
- [ ] Confirmar que a recomendação continua baseada em regras determinísticas, sem cálculo financeiro por IA.

### Histórico

- [ ] Se houver compras anteriores do produto, confirmar que a recomendação informa frequência recente quando aplicável.
- [ ] Confirmar que a ausência de histórico não impede recomendação baseada no estoque.

### Adicionar à lista

- [ ] Clicar **Adicionar à lista** em uma recomendação.
- [ ] Confirmar que o produto aparece na lista com quantidade em embalagens.
- [ ] Clicar novamente na mesma recomendação e confirmar que não surge duplicação incoerente do mesmo produto.
- [ ] Confirmar que o sistema nunca adiciona uma recomendação à lista sem clique do usuário.
- [ ] Confirmar que nenhum preço é criado ou inventado pela recomendação.

### Persistência e regressão

- [ ] Atualizar a página e confirmar que estoque, perfil e lista permanecem corretos.
- [ ] Sair e entrar novamente e confirmar persistência.
- [ ] Confirmar que comparação de mercados continua calculando preço por embalagem × quantidade de embalagens.
- [ ] Confirmar que modo compra e histórico da Sprint 4 continuam funcionando.

### Critério de aprovação

A Sprint 5 passa quando o estoque representa claramente número de embalagens, as recomendações surgem apenas por regras explicáveis de estoque/perfil/histórico, nenhuma recomendação é adicionada sem confirmação, nenhum preço é inventado e as Sprints anteriores continuam funcionando.

---

## Registro de validação

| Sprint | Status | Data | Observações |
| --- | --- | --- | --- |
| Sprint 1 | Validada | — | Fluxo funcional aprovado antes da integração. |
| Sprint 2 | Validada | 29/08/2026 | Fluxo funcional aprovado antes da integração. |
| Sprint 3 | Validada | 29/08/2026 | Preços por filial e comparação de mercados aprovados. |
| Sprint 4 | Validada | 29/08/2026 | Modo compra, fechamento e histórico aprovados. |
| Sprint 5 | Pendente | — | Aguardando teste funcional autenticado. |

## Regra para próximas Sprints

Para cada nova Sprint, adicionar neste mesmo documento: objetivo, preparação, testes em ordem, valores de exemplo, resultados esperados, persistência, entradas inválidas, regressão e critério objetivo de aprovação.
