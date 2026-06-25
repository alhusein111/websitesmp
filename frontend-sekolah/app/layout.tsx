/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: "SMP YAPI AL-HUSAENI",
  description: "Membentuk karakter, menginspirasi kreativitas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        {/* Memanggil Material Symbols persis seperti di referensi HTML */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen antialiased">
        {/* INI PERUBAHANNYA: Dibungkus Providers supaya session NextAuth aktif di seluruh halaman website */}
        <Providers>
          <Navbar />
          <main className="grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}