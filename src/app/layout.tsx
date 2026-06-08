import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B2A5B",
};

export const metadata: Metadata = {
  title: "Camiseta Brasil Retrô | RR Uniformes",
  description:
    "Coleção Brasil Retrô da RR Uniformes. Camiseta retrô verde e amarelo por R$ 89,90. Escolha os tamanhos e peça a sua com pagamento via PIX, boleto ou cartão.",
  openGraph: {
    title: "Camiseta Brasil Retrô | RR Uniformes",
    description:
      "Coleção Brasil Retrô — camiseta retrô verde e amarelo por R$ 89,90.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
