# Guia de Testes por Sprint

Este documento reúne os testes funcionais manuais do projeto **Lista de Compras Inteligente 2.0**, separados por Sprint.

> Regra de validação: executar os testes no Preview da Sprint antes do merge para `main`. Uma Sprint só deve ser considerada validada quando os resultados esperados forem confirmados.

---

## Sprint 1 — Minha Casa, produtos e estoque

### Objetivo
Validar autenticação, perfil da casa, cadastro de produtos e controle básico de estoque.

### Fluxo de teste

- [ ] Entrar com a conta Google.
- [ ] Confirmar que a tela **Minha Casa** abre sem erro.
- [ ] Alterar o nome da casa e a cidade e salvar.
- [ ] Atualizar a página e confirmar que os dados permanecem salvos.
- [ ] Cadastrar um produto, por exemplo **Arroz**.
- [ ] Informar marca, tamanho da embalagem, unidade de medida e quantidade existente em casa.
- [ ] Confirmar que o produto aparece no estoque.
- [ ] Cadastrar um segundo produto, por exemplo **Feijão**.
- [ ] Aumentar a quantidade de um produto usando o controle `+`.
- [ ] Diminuir usando `−`.
- [ ] Confirmar que a quantidade nunca fica negativa.
- [ ] Alterar o status entre **Em casa**, **Acabando** e **Acabou**.
- [ ] Confirmar que marcar **Acabou** zera o estoque quando aplicável.
- [ ] Remover um produto e confirmar que ele desaparece.
- [ ] Atualizar a página e confirmar que produtos e estoque continuam corretos.
- [ ] Sair da conta e entrar novamente.
- [ ] Confirmar novamente a persistência dos dados.

### Critério de aprovação
A Sprint 1 passa quando autenticação, Minha Casa, produtos e estoque funcionam sem erros e os dados persistem após atualização e novo login.

---

## Sprint 2 — Lista de compras e orçamento

### Objetivo
Validar criação da lista, orçamento, prioridades, quantidades, preços previstos e persistência.

### Preparação
Ter pelo menos dois produtos cadastrados na Minha Casa. Exemplo: Arroz — pacote de 5 kg; Feijão — pacote de 1 kg.

### Fluxo de teste

- [ ] Entrar com a conta Google.
- [ ] Confirmar que **Minha Casa** abre normalmente.
- [ ] Localizar a área **Lista de compras**.
- [ ] Definir orçamento de **R$ 100,00**.
- [ ] Definir, por exemplo, **30 dias planejados** e salvar.
- [ ] Adicionar Arroz: quantidade `2`, prioridade **Essencial**, preço previsto `R$ 20,00` por embalagem.
- [ ] Adicionar Feijão: quantidade `3`, prioridade **Necessário**, preço previsto `R$ 8,00` por embalagem.
- [ ] Confirmar `2 × R$ 20 = R$ 40` e `3 × R$ 8 = R$ 24`.
- [ ] Confirmar **Total previsto = R$ 64** e **Saldo previsto = R$ 36**.
- [ ] Marcar e desmarcar item como comprado.
- [ ] Remover e adicionar item novamente sem duplicação incoerente.
- [ ] Ativar/iniciar a compra e confirmar mudança de status.
- [ ] Atualizar a página e confirmar persistência.
- [ ] Sair e entrar novamente e confirmar persistência.
- [ ] Alterar orçamento para **R$ 20** e confirmar saldo negativo.

### Critério de aprovação
A Sprint 2 passa quando os cálculos batem exatamente, a lista não perde nem mistura produtos, os estados funcionam e tudo persiste após atualização e novo login.

---

## Sprint 3 — Preços por filial e comparação de mercados

### Objetivo
Validar mercados, filiais físicas, preços observados e comparação determinística do custo da lista.

### Preparação
Ter uma lista de compras com pelo menos dois produtos, por exemplo Arroz e Feijão.

### Fluxo de teste

- [ ] Cadastrar dois mercados e suas filiais.
- [ ] Registrar preços diferentes de Arroz e Feijão nas filiais.
- [ ] Para 2 Arroz a R$20 e 3 Feijão a R$8, confirmar total R$64.
- [ ] Para 2 Arroz a R$18 e 3 Feijão a R$10, confirmar total R$66.
- [ ] Confirmar que a opção completa mais barata é identificada corretamente.
- [ ] Com cobertura parcial, confirmar que preço ausente nunca é inventado.
- [ ] Criar duas filiais da mesma rede e confirmar preços separados.
- [ ] Para pacote de 5 kg a R$25, confirmar preço da embalagem e derivado R$5/kg quando exibido.
- [ ] Selecionar mercado e confirmar que somente um fica selecionado.
- [ ] Atualizar e relogar para confirmar persistência.
- [ ] Confirmar rejeição de preço negativo/zero inválido e campos obrigatórios ausentes.

### Critério de aprovação
A Sprint 3 passa quando os totais são matematicamente corretos, preços ausentes nunca são inventados, filiais não têm seus preços misturados, somente um mercado pode ser selecionado, os dados persistem e não há regressão das Sprints anteriores.

---

## Sprint 4 — Modo compra, fechamento e histórico

### Objetivo
Validar a execução da compra no mercado, preço real por item, total real, fechamento atômico e histórico de compras.

### Preparação
- Ter uma lista com pelo menos dois itens.
- Clicar em **Começar compra** para deixar a lista ativa.
- Escolher um mercado na comparação da Sprint 3.

### Fluxo de teste

- [ ] Confirmar que **Modo compra** aparece com a lista ativa e mercado correto.
- [ ] Marcar itens e informar preço real por embalagem.
- [ ] Confirmar total real mudando imediatamente.
- [ ] Arroz 2 × R$21 + Feijão 3 × R$7,50 = **R$64,50**.
- [ ] Com orçamento R$100, confirmar saldo **R$35,50**.
- [ ] Confirmar bloqueio sem mercado, sem item marcado ou com preço inválido.
- [ ] Finalizar e confirmar fechamento apenas uma vez.
- [ ] Confirmar que lista ativa desaparece do Modo compra.
- [ ] Confirmar compra no histórico com mercado, data, total, itens e subtotais.
- [ ] Atualizar e relogar para confirmar persistência.
- [ ] Criar próxima compra sem misturar a compra anterior.

### Critério de aprovação
A Sprint 4 passa quando o total real é determinístico, fechamento inválido é bloqueado, a compra gera um único registro consistente, o histórico persiste e nenhuma funcionalidade das Sprints 1–3 sofre regressão.

---

## Sprint 5 — Recomendações inteligentes e semântica de embalagens

### Objetivo
Validar recomendações determinísticas de reposição e a interpretação do estoque como quantidade de embalagens, sem inventar preços e sem adicionar itens automaticamente.

### Preparação
- Ter Arroz pacote de 5 kg, Feijão pacote de 1 kg e Leite caixa de 1 L cadastrados.

### Embalagens e estoque
- [ ] Confirmar unidades do cadastro em português.
- [ ] Cadastrar Arroz com embalagem `5 kg` e `3` embalagens em casa.
- [ ] Confirmar **3 embalagens**, e não **3 kg**.
- [ ] Confirmar **Total em casa: 15 kg**.
- [ ] Confirmar que `+` e `−` alteram uma embalagem inteira e nunca ficam negativos.

### Recomendações
- [ ] Marcar Arroz como **Acabou** e confirmar recomendação com motivo `acabou em casa`.
- [ ] Marcar Feijão como **Acabando** e confirmar recomendação com motivo `estoque acabando`.
- [ ] Manter Leite **Em casa** e confirmar que não é sugerido apenas por estar cadastrado.
- [ ] Alternar perfis Econômico, Equilibrado e Prático e observar quantidades coerentes com cada perfil.
- [ ] Se houver histórico, confirmar que frequência recente aparece como motivo complementar.
- [ ] Confirmar que ausência de histórico não impede recomendação por estoque.

### Adicionar à lista
- [ ] Clicar **Adicionar à lista** e confirmar inclusão em embalagens.
- [ ] Clicar novamente e confirmar ausência de duplicação incoerente.
- [ ] Confirmar que nada é adicionado sem clique do usuário.
- [ ] Confirmar que nenhum preço é criado ou inventado.

### Persistência e regressão
- [ ] Atualizar e relogar; confirmar estoque, perfil e lista.
- [ ] Confirmar comparação de mercados usando preço por embalagem × quantidade de embalagens.
- [ ] Confirmar Modo compra e histórico da Sprint 4 funcionando.

### Critério de aprovação
A Sprint 5 passa quando o estoque representa claramente número de embalagens, recomendações surgem apenas por regras explicáveis de estoque/perfil/histórico, nenhuma sugestão é adicionada sem confirmação, nenhum preço é inventado e as Sprints anteriores continuam funcionando.

---

## Registro de validação

| Sprint | Status | Data | Observações |
| --- | --- | --- | --- |
| Sprint 1 | Validada | — | Fluxo funcional aprovado antes da integração. |
| Sprint 2 | Validada | 29/08/2026 | Fluxo funcional aprovado antes da integração. |
| Sprint 3 | Validada | 29/08/2026 | Preços por filial e comparação de mercados aprovados. |
| Sprint 4 | Validada | 29/08/2026 | Modo compra, fechamento e histórico aprovados. |
| Sprint 5 | Validada | 29/08/2026 | Recomendações inteligentes e semântica de embalagens aprovadas. |

## Regra para próximas Sprints
Para cada nova Sprint, adicionar neste mesmo documento: objetivo, preparação, testes em ordem, valores de exemplo, resultados esperados, persistência, entradas inválidas, regressão e critério objetivo de aprovação.
