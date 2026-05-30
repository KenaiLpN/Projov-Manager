import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrivateLayout from "@/components/PrivateLayout";
import { Toaster } from "react-hot-toast";
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProSis — Gestão Jovem Aprendiz",
  description: "Sistema de Gestão do Programa Jovem Aprendiz",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lê o nonce injetado pelo middleware para este request.
  // O Next.js usa este valor para adicionar nonces nos scripts inline
  // que ele mesmo gera (hydration, chunk loader etc.), permitindo que
  // o CSP bloqueie 'unsafe-inline' em script-src.
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        {/* Informa ao Next.js o nonce atual para que ele o injete nos
            scripts inline gerados pelo framework (hydration, lazy chunks etc.) */}
        {nonce && <meta property="csp-nonce" content={nonce} />}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const storedTheme = localStorage.getItem("prosis-theme");
                  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const theme = storedTheme || (prefersDark ? "dark" : "light");
                  document.documentElement.classList.toggle("dark", theme === "dark");
                  document.documentElement.style.colorScheme = theme;
                } catch {
                  document.documentElement.classList.remove("dark");
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <PrimeReactProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#133c86",
                color: "#fff",
              },
            }}
          />
          <PrivateLayout>{children}</PrivateLayout>
        </PrimeReactProvider>
      </body>
    </html>
  );
}
