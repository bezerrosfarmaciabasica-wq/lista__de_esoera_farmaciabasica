import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const sans = Figtree({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Farmácia Básica · Lista de Espera",
  description: "Gestão da lista de espera de insumos da Farmácia Básica",
  manifest: `${base}/manifest.json`,
  icons: { icon: `${base}/favicon.ico`, apple: `${base}/apple-touch-icon.png` },
  appleWebApp: { capable: true, title: "Farmácia Básica", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a2e24",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={sans.variable}>
      <body className="min-h-screen font-sans">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
