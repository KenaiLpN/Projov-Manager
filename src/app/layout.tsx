import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PrivateLayout from "@/components/PrivateLayout";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProSis ",
  description: "Sistema de Gestão",
};

import { Toaster } from "react-hot-toast";
import { PrimeReactProvider } from "primereact/api";

// Estilos do PrimeReact
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
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
