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

Ter pelo menos dois produtos cadastrados na Minha Casa. Exemplo:

- Arroz — pacote de 5 kg
- Feijão — pacote de 1 kg

### Fluxo de teste

- [ ] Entrar com a conta Google.
- [ ] Confirmar que **Minha Casa** abre normalmente.
- [ ] Localizar a área **Lista de compras**.
- [ ] Definir orçamento de **R$ 100,00**.
- [ ] Definir, por exemplo, **30 dias planejados** e salvar.
- [ ] Adicionar Arroz: quantidade `2`, prioridade **Essencial**, preço previsto `R$ 20,00` por embalagem.
- [ ] Adicionar Feijão: quantidade `3`, prioridade **Necessário**, preço previsto `R$ 8,00` por embalagem.
- [ ] Confirmar o cálculo do Arroz: `2 × R$ 20 = R$ 40`.
- [ ] Confirmar o cálculo do Feijão: `3 × R$ 8 = R$ 24`.
- [ ] Confirmar **Total previsto = R$ 64**.
- [ ] Confirmar **Saldo previsto = R$ 36**.
- [ ] Marcar um item como comprado e verificar a mudança visual.
- [ ] Desmarcar e confirmar que ele volta ao estado normal.
- [ ] Remover um item e confirmar que desaparece.
- [ ] Adicionar novamente um produto já existente e confirmar que o sistema não cria duplicação incoerente.
- [ ] Ativar/iniciar a compra e confirmar a mudança de status da lista.
- [ ] Atualizar a página e confirmar que a lista continua salva.
- [ ] Sair e entrar novamente e confirmar a persistência.
- [ ] Alterar o orçamento para **R$ 20** mantendo itens acima desse total.
- [ ] Confirmar que o saldo previsto fica negativo.

### Critério de aprovação

A Sprint 2 passa quando os cálculos batem exatamente, a lista não perde nem mistura produtos, os estados funcionam e tudo persiste após atualização e novo login.

---

## Sprint 3 — Preços por filial e comparação de mercados

### Objetivo
Validar mercados, filiais físicas, preços observados e comparação determinística do custo da lista.

### Preparação

Ter uma lista de compras com pelo menos dois produtos, por exemplo Arroz e Feijão.

### Fluxo de teste

- [ ] Entrar com a conta Google.
- [ ] Confirmar que dados das Sprints anteriores continuam aparecendo normalmente.
- [ ] Cadastrar o primeiro mercado, por exemplo **Atacadão**.
- [ ] Cadastrar uma filial, por exemplo **Setor X**, informando a cidade.
- [ ] Cadastrar o segundo mercado, por exemplo **Assaí**.
- [ ] Cadastrar uma filial, por exemplo **Centro**.
- [ ] Registrar Arroz no Atacadão por `R$ 20,00`.
- [ ] Registrar Arroz no Assaí por `R$ 18,00`.
- [ ] Registrar Feijão no Atacadão por `R$ 8,00`.
- [ ] Registrar Feijão no Assaí por `R$ 10,00`.

### Teste matemático da comparação

Considerando uma lista com:

- 2 embalagens de Arroz
- 3 embalagens de Feijão

O resultado esperado é:

**Atacadão**

`2 × R$ 20 + 3 × R$ 8 = R$ 64`

**Assaí**

`2 × R$ 18 + 3 × R$ 10 = R$ 66`

- [ ] Confirmar que o Atacadão aparece com total de **R$ 64**.
- [ ] Confirmar que o Assaí aparece com total de **R$ 66**.
- [ ] Confirmar que o Atacadão é identificado como a opção mais barata entre os mercados com cobertura completa.

### Cobertura parcial

- [ ] Adicionar um terceiro produto à lista.
- [ ] Registrar preço desse produto somente em um dos mercados.
- [ ] Confirmar que o outro mercado informa que falta preço.
- [ ] Confirmar que o sistema **não inventa preço** para completar a comparação.

### Separação por filial

- [ ] Criar duas filiais do mesmo mercado.
- [ ] Registrar preços diferentes do mesmo produto nas duas filiais.
- [ ] Confirmar que os valores permanecem separados por filial física.

### Preço por embalagem e preço unitário

Exemplo: pacote de Arroz de `5 kg` custando `R$ 25`.

- [ ] Confirmar que o preço observado representa a embalagem inteira.
- [ ] Quando o preço unitário derivado for exibido, confirmar resultado equivalente a `R$ 5/kg`.

### Seleção do mercado

- [ ] Selecionar um mercado para realizar a compra.
- [ ] Selecionar outro mercado.
- [ ] Confirmar que apenas **um mercado** permanece selecionado para a lista.
- [ ] Atualizar a página e confirmar que a seleção permanece salva.
- [ ] Sair e entrar novamente e confirmar persistência.

### Validações de entrada

- [ ] Tentar cadastrar preço negativo e confirmar que é rejeitado.
- [ ] Tentar cadastrar preço zero e confirmar que é rejeitado quando não representar um preço válido.
- [ ] Tentar salvar mercado ou filial sem os campos obrigatórios.
- [ ] Confirmar que a interface não quebra e não grava dados inválidos.

### Critério de aprovação

A Sprint 3 passa quando:

- os totais são matematicamente corretos;
- preços ausentes nunca são inventados;
- filiais não têm seus preços misturados;
- somente um mercado pode ser selecionado para a compra;
- os dados persistem após atualização e novo login;
- entradas inválidas são rejeitadas;
- nenhuma funcionalidade validada nas Sprints 1 e 2 sofre regressão.

---

## Registro de validação

Ao finalizar cada Sprint, registrar o resultado abaixo.

| Sprint | Status | Data | Observações |
| --- | --- | --- | --- |
| Sprint 1 | Validada | — | Fluxo funcional aprovado antes da integração. |
| Sprint 2 | Validada | 29/08/2026 | Fluxo funcional aprovado antes da integração. |
| Sprint 3 | Pendente | — | Aguardando teste funcional autenticado. |

## Regra para próximas Sprints

A partir da Sprint 4, adicionar neste mesmo documento uma nova seção contendo:

1. objetivo da Sprint;
2. preparação necessária;
3. testes em ordem de execução;
4. valores de exemplo para cálculos quando aplicável;
5. resultados esperados;
6. testes de persistência;
7. testes de entradas inválidas;
8. regressão das funcionalidades anteriores;
9. critério objetivo de aprovação.
