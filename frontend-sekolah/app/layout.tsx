/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from './Providers';

export const metadata: Metadata = {
  title: {
    default: 'SMP YAPI Al-Husaeni | Cerdas, Islami, Berprestasi',
    template: '%s | SMP YAPI Al-Husaeni', // Jika halaman lain punya title, akan ditambah akhiran ini
  },
  description: 'Website resmi SMP YAPI Al-Husaeni. Informasi pendaftaran siswa baru, berita sekolah, mading digital, dan prestasi siswa.',
  keywords: ['SMP YAPI Al-Husaeni', 'SMP Swasta Terbaik', 'Sekolah Menengah Pertama', 'Pendidikan Islam', 'Sekolah Berprestasi'],
  authors: [{ name: 'SMP YAPI Al-Husaeni' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://smpyapialhusaeni.sch.id',
    siteName: 'SMP YAPI Al-Husaeni',
    images: [
      {
        url: '/logo-sekolah.png', // Pastikan kamu punya gambar logo/gedung di folder /public
        width: 1200,
        height: 630,
        alt: 'SMP YAPI Al-Husaeni',
      },
    ],
  },
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