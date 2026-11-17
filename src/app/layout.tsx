// src/app/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer"; // <--- Importamos el Footer
import "./globals.css";

export const metadata: Metadata = {
  title: "RE.Control - Residencia Tacuarembó",
  description: "Sistema de control de huéspedes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <div className="flex-grow">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
        <Footer /> {/* <--- Agregamos el Footer aquí */}
      </body>
    </html>
  );
}