# Arquitetura — MVP em 3 dias

## Decisão principal

O sistema começa como um **monólito modular em Next.js + TypeScript**, com PostgreSQL/Supabase e deploy na Vercel. Não teremos um microsserviço separado para cada domínio no MVP.

## Domínios internos

- auth
- households
- products
- inventory
- pricing
- shopping-list
- purchases
- ai

Cada domínio deve expor contratos claros e evitar dependência direta desnecessária entre módulos.

## Regras estruturais congeladas

1. A IA nunca inventa preços.
2. Preços, orçamento, totais e cálculos financeiros são determinísticos.
3. Preços preservam a filial física; médias de rede são apenas visões derivadas.
4. A política temporal de preços do 2.0 prevalece sobre a antiga regra fixa de 7 dias; validade, atualidade e elegibilidade serão definidas pelo contrato normativo de preço.
5. Fontes de preço entram por adaptadores compatíveis com `PriceProvider`.
6. O primeiro MVP concentra a compra em um único mercado; o modelo 2.0 não deve impedir um futuro plano de compra dividido entre múltiplas filiais.
7. A interface inicial pode localizar produtos por nome, marca, quantidade e unidade e não precisa oferecer scanner. Porém, o modelo de dados deve suportar identidade forte, múltiplos identificadores e EAN/GTIN desde a fundação, conforme `2.0-contrato-produto-identidade.md`.
8. Estoque guarda quantidade registrada e pode futuramente manter quantidade estimada separadamente.
9. A aplicação é mobile-first e preparada para PWA/offline, respeitando a decisão 2.0 de offline somente leitura no lançamento.

## Precedência 2.0

Este documento registra decisões do MVP original. Quando houver conflito entre uma regra antiga daqui e um contrato normativo 2.0 explicitamente congelado posteriormente, o contrato 2.0 prevalece.

## Evolução futura

`pricing` e `ai` são candidatos naturais a serviços separados se escala, filas ou processamento assíncrono justificarem. Até lá, permanecem módulos internos para reduzir custo operacional e velocidade de desenvolvimento.

## Sprint 0 — Gate

A Sprint 0 só pode ser considerada encerrada quando:

- projeto Next.js/TypeScript estiver estruturado;
- branch `develop` existir;
- schema inicial do Supabase estiver versionado;
- contratos de providers estiverem definidos;
- PWA tiver manifest inicial;
- testes tiverem configuração básica;
- aplicação puder ser instalada e compilada em um ambiente com as variáveis do Supabase configuradas.
