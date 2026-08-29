import type { Metadata } from "next";
import "./globals.css";
import "./ux-refinements.css";

export const metadata: Metadata = {
  title: "Lista de Compras Inteligente",
  description: "Assistente inteligente para compras, estoque, orçamento e preços.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
