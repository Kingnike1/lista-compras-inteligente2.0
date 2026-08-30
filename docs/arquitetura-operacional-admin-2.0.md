# Lista de Compras Inteligente 2.0 — Arquitetura Operacional do Administrador

## Objetivo

Este documento define a separação oficial de responsabilidades entre o **usuário final**, o **administrador/operador da plataforma** e o **próprio sistema** no Lista de Compras Inteligente 2.0.

A decisão central é simples:

> O usuário deve cuidar da sua casa e da sua compra. O administrador deve cuidar da plataforma. O sistema deve automatizar o máximo possível entre os dois.

Essa separação deve orientar as próximas decisões de produto, arquitetura, UX, integrações e segurança antes da implementação de novas features do 2.0.

---

## 1. Princípio oficial do 2.0

Toda nova funcionalidade deve responder primeiro:

**Essa responsabilidade pertence ao usuário, ao administrador ou ao sistema?**

### Pertence ao usuário quando

A funcionalidade ajuda uma pessoa ou família a:

- organizar a casa;
- controlar o estoque;
- montar a lista de compras;
- definir orçamento;
- decidir o que comprar;
- comparar opções de compra;
- realizar uma compra;
- consultar o próprio histórico;
- entender recomendações úteis para sua casa.

### Pertence ao administrador quando

A funcionalidade existe para:

- manter a plataforma funcionando;
- administrar integrações externas;
- controlar qualidade e confiabilidade dos dados;
- operar catálogo e estabelecimentos globais;
- investigar falhas;
- acompanhar sincronizações;
- prestar suporte operacional;
- configurar regras globais da plataforma.

### Pertence ao sistema quando

O trabalho pode ser executado automaticamente e não exige uma decisão do usuário ou do operador, por exemplo:

- normalizar dados recebidos de provedores;
- calcular cobertura de preços;
- detectar dados antigos ou inconsistentes;
- atualizar índices derivados;
- calcular totais e comparações determinísticas;
- classificar confiança de fontes segundo regras definidas;
- registrar falhas de integração;
- executar sincronizações programadas.

---

## 2. Área do usuário

A aplicação principal deve permanecer simples e orientada à rotina doméstica.

O usuário não deve precisar entender APIs, provedores, sincronizações, logs, estruturas internas ou processos técnicos para utilizar o produto.

### Responsabilidades do usuário

#### Casa

- configurar dados da própria casa;
- informar cidade/localização quando necessário;
- definir preferências domésticas;
- futuramente participar de uma casa compartilhada.

#### Estoque

- consultar produtos disponíveis em casa;
- informar ou corrigir quantidades quando necessário;
- acompanhar produtos em falta ou acabando.

#### Lista de compras

- adicionar e remover itens;
- informar quantidade desejada;
- definir orçamento;
- marcar prioridades quando fizer sentido;
- aceitar ou rejeitar recomendações.

#### Compra

- escolher onde comprar;
- utilizar o modo compra;
- confirmar itens comprados;
- consultar histórico de compras.

#### Preços

O usuário poderá contribuir com preços quando essa contribuição fizer sentido, mas **não deve ser responsável por manter a base de preços da plataforma funcionando**.

À medida que integrações externas forem implementadas, o cadastro manual de preços deve deixar de ser uma obrigação central do usuário e se tornar uma contribuição, correção ou fallback.

#### Confiança

O usuário deve receber informação suficiente para entender a qualidade da comparação, por exemplo:

- preço atualizado ou antigo;
- fonte quando relevante;
- cobertura da lista;
- itens sem preço;
- comparação completa ou parcial.

A complexidade técnica por trás dessas informações não deve ser exposta desnecessariamente.

---

## 3. Administrador como operador da plataforma

O administrador do 2.0 **não deve ser tratado como um superusuário da casa**.

Ele é o operador técnico e operacional da plataforma.

Seu painel deve ser separado conceitualmente — e preferencialmente também na interface — do aplicativo usado pelas famílias.

---

## 4. Módulos do painel administrativo

### 4.1 Integrações

Central para administrar todas as fontes externas de dados.

Deve permitir acompanhar:

- provedores configurados;
- status de cada integração;
- última sincronização;
- próxima sincronização, quando aplicável;
- quantidade de registros importados;
- erros recentes;
- latência e disponibilidade;
- limites de requisição/rate limit;
- credenciais por referência segura, nunca expostas na interface;
- ativação/desativação controlada de provedores.

Exemplos futuros de provedores:

- serviços de localização e estabelecimentos;
- catálogo de produtos;
- fontes de preços;
- parceiros comerciais;
- feeds oficiais;
- fontes relacionadas a NFC-e, quando legal e tecnicamente disponíveis.

A regra arquitetural será:

> Cada provedor externo possui um adapter. O restante do sistema consome nosso modelo interno, e não o formato específico da API externa.

---

### 4.2 Catálogo global

O catálogo global representa produtos conhecidos pela plataforma e deve ser diferente do estoque particular de cada casa.

O painel administrativo poderá futuramente permitir:

- pesquisar produtos globais;
- visualizar EAN/GTIN;
- revisar nome e marca;
- revisar categoria;
- revisar peso, volume e unidade;
- verificar origem dos dados;
- identificar duplicidades;
- unir registros duplicados de forma controlada;
- corrigir produtos inconsistentes;
- acompanhar produtos ainda não normalizados.

Uma casa referencia produtos do catálogo, mas seu estoque continua privado.

---

### 4.3 Redes, mercados e filiais

O sistema deve separar claramente:

- **rede**;
- **estabelecimento/filial**;
- **endereço/localização**.

O painel administrativo deverá permitir:

- visualizar redes conhecidas;
- revisar filiais importadas;
- corrigir localização;
- detectar filiais duplicadas;
- acompanhar a fonte que originou o estabelecimento;
- ativar/desativar registros problemáticos;
- relacionar identificadores externos ao estabelecimento interno.

APIs de localização descobrem estabelecimentos. Elas não devem ser tratadas automaticamente como fontes de preços.

---

### 4.4 Qualidade dos dados

Esse será um dos módulos mais importantes do 2.0.

Deve identificar automaticamente situações como:

- preço muito antigo;
- preço estatisticamente suspeito;
- produto sem EAN;
- produto duplicado;
- embalagem inconsistente;
- unidade incompatível;
- estabelecimento duplicado;
- preço sem estabelecimento confiável;
- importação incompleta;
- divergência entre fontes;
- produto recebido de uma API sem correspondência segura no catálogo.

O administrador atua sobre exceções. O sistema deve resolver automaticamente os casos determinísticos e seguros.

---

### 4.5 Monitoramento

Área operacional para entender a saúde da plataforma.

Indicadores possíveis:

- APIs disponíveis/indisponíveis;
- taxa de erro;
- sincronizações concluídas e falhas;
- filas pendentes;
- tempo de resposta;
- quantidade de preços válidos;
- quantidade de preços expirados;
- cobertura por cidade;
- cobertura por mercado;
- cobertura do catálogo;
- falhas recentes importantes.

O objetivo não é construir observabilidade complexa imediatamente, mas garantir que o 2.0 tenha um local natural para ela crescer.

---

### 4.6 Suporte

A área administrativa poderá auxiliar usuários sem transformar o administrador em proprietário dos dados da casa.

Possíveis funções:

- localizar uma conta para atendimento;
- visualizar estado operacional mínimo necessário para diagnóstico;
- identificar falhas de onboarding ou integração;
- acompanhar erros relacionados à conta;
- bloquear ou reativar contas quando houver justificativa e política definida;
- orientar recuperação de acesso.

Dados privados da casa não devem ser expostos ao suporte sem necessidade, autorização e controle apropriados.

---

### 4.7 Configurações globais

Configurações que afetam a plataforma inteira e não pertencem a uma casa específica.

Exemplos:

- provedores habilitados;
- validade padrão de determinadas fontes de preço;
- regras de confiança;
- limites operacionais;
- cidades/regiões piloto;
- feature flags;
- parâmetros de recomendação global que não sejam preferências domésticas.

Mudanças importantes devem ser auditáveis.

---

## 5. O sistema entre usuário e administrador

O objetivo não é transferir todo trabalho manual do usuário para o administrador.

O objetivo é que **o sistema execute o trabalho repetitivo**, enquanto:

- o usuário toma decisões sobre sua casa;
- o administrador trata exceções e opera a plataforma.

Fluxo conceitual:

```text
FONTES EXTERNAS
      │
      ▼
INTEGRATIONS / ADAPTERS
      │
      ▼
NORMALIZAÇÃO E VALIDAÇÃO
      │
      ├── problema / baixa confiança ──► ADMIN
      │
      ▼
MODELO INTERNO CONFIÁVEL
      │
      ▼
CATÁLOGO / MERCADOS / PREÇOS
      │
      ▼
INTELIGÊNCIA DETERMINÍSTICA
      │
      ▼
APP DO USUÁRIO
```

O usuário não conversa diretamente com uma API externa. O app consome dados já normalizados pela plataforma.

---

## 6. Consumidores agora, produtores depois

No início do 2.0, a estratégia será prioritariamente **consumir dados externos confiáveis**.

Isso reduz a necessidade imediata de resolver problemas complexos de:

- reputação de contribuidores;
- fraude;
- moderação em escala;
- validação comunitária;
- governança de dados públicos;
- segurança de contribuições;
- auditoria avançada.

Porém, a arquitetura deve nascer preparada para a plataforma futuramente também produzir sua própria base.

Fontes futuras possíveis:

- preços informados por usuários;
- compras confirmadas;
- leitura de NFC-e;
- parceiros;
- dados próprios derivados de histórico validado.

A mudança de consumidor para consumidor + produtor não deve exigir reescrever o núcleo da aplicação.

---

## 7. NFC-e e notas fiscais

Notas fiscais constituem uma frente própria do 2.0 e não devem ser misturadas prematuramente com o módulo de compras.

Conceitualmente:

- uma **compra** é um evento privado da casa;
- uma **nota fiscal** é uma evidência/documento que pode confirmar informações dessa compra e gerar observações de preço.

Por isso, uma arquitetura futura deve considerar um domínio específico de `receipts`.

Possível fluxo futuro:

```text
QR Code / NFC-e
      ↓
Leitura segura
      ↓
Extração
      ↓
Estabelecimento + produtos + quantidades + preços + data
      ↓
Normalização dos produtos
      ↓
Confirmação quando necessária
      ↓
Compra privada da casa
      +
Observações de preço aproveitáveis pela plataforma
```

Dados pessoais presentes em documentos fiscais não devem ser transformados automaticamente em dados públicos.

---

## 8. Segurança e privacidade

A separação usuário/admin também é uma separação de segurança.

Princípios:

1. **Menor privilégio** — administrador recebe apenas permissões necessárias para sua função.
2. **RLS continua protegendo dados domésticos** — acesso administrativo não deve depender de desativar as políticas do usuário.
3. **Credenciais de APIs ficam no servidor** — nunca no frontend.
4. **Operações administrativas sensíveis devem ser auditáveis.**
5. **Dados privados da casa permanecem privados por padrão.**
6. **Dados compartilháveis devem ser explicitamente modelados como compartilháveis.**
7. **Nenhuma informação de preço deve ser inventada para completar cobertura.**
8. **Fontes externas devem ser tratadas como não confiáveis até passarem por validação.**

---

## 9. Separação de dados

Direção inicial para o 2.0:

### Compartilháveis pela plataforma

- catálogo global de produtos;
- redes;
- filiais;
- localizações comerciais;
- observações públicas de preço devidamente validadas;
- metadados necessários para comparação.

### Privados por casa

- membros;
- estoque;
- listas;
- orçamento;
- histórico de compras;
- preferências;
- documentos fiscais originais;
- dados pessoais.

Essa distinção deve aparecer também no modelo de dados e nas políticas de acesso.

---

## 10. Frontends

A direção preferida é separar conceitualmente dois produtos:

### App do usuário

Mobile-first e orientado às tarefas domésticas.

### Painel administrativo

Web-first e orientado à operação da plataforma.

Inicialmente eles podem compartilhar o mesmo repositório, componentes e backend quando isso reduzir complexidade.

A separação em aplicações/deploys independentes deve acontecer apenas quando houver benefício real de segurança, manutenção, equipes ou ciclo de deploy.

A separação de **responsabilidades e autorização**, porém, deve existir desde o início.

---

## 11. Regra para as próximas features

Antes de qualquer nova implementação do Lista de Compras Inteligente 2.0, devemos registrar:

```text
Feature:
Responsável principal: usuário | administrador | sistema
Dados utilizados:
Dados privados envolvidos:
Fonte externa envolvida:
Nível de confiança necessário:
Comportamento quando os dados não existirem:
Comportamento quando a integração falhar:
```

Se essas respostas não estiverem claras, a feature ainda não está pronta para entrar em Sprint.

---

## 12. Próximas decisões arquiteturais — ainda sem Sprint

Antes de transformar o 2.0 em Sprints, ainda precisamos discutir e decidir:

1. cidade/região piloto;
2. estratégia de descoberta de mercados;
3. provedores iniciais de catálogo;
4. fontes iniciais de preço;
5. modelo do catálogo global;
6. modelo de confiança dos preços;
7. arquitetura de adapters/providers;
8. papel futuro da NFC-e;
9. regras para dados compartilháveis;
10. autorização do painel administrativo;
11. auditoria administrativa;
12. limites entre suporte e acesso a dados privados;
13. quando uma contribuição de usuário pode beneficiar outros usuários;
14. critérios para considerar um preço válido para comparação.

Somente depois dessas decisões o roadmap do 2.0 deve ser quebrado em Sprints.

---

## Decisão registrada

O **Lista de Compras Inteligente 2.0** terá uma separação explícita entre:

- **Usuário:** administra sua casa e toma decisões de compra.
- **Administrador/Operador:** administra a plataforma e trata exceções.
- **Sistema:** automatiza integrações, validações, cálculos e processamento sempre que possível.

Essa separação passa a ser um princípio arquitetural para as próximas funcionalidades do projeto.