import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lista de Compras Inteligente",
    short_name: "Compras IA",
    description: "Assistente de compras com estoque, orçamento e comparação de preços.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f7",
    theme_color: "#171717",
    lang: "pt-BR",
  };
}
