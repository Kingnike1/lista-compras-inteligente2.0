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
4. Preços expiram por padrão em 7 dias.
5. Fontes de preço entram por adaptadores compatíveis com `PriceProvider`.
6. O primeiro MVP escolhe um único mercado para a compra.
7. Produto é identificado inicialmente por nome, marca, quantidade e unidade; EAN fica fora do MVP.
8. Estoque guarda quantidade registrada e pode futuramente manter quantidade estimada separadamente.
9. A aplicação é mobile-first e preparada para PWA/offline.

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
