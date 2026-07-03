/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton"; 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); 
  }

  const role = (session.user as any).role; 

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* 💥 TRICK SAKTI: Checkbox rahasia untuk mengontrol buka/tutup menu di mobile */}
      <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />

      {/* HEADER KHUSUS MOBILE (Muncul hanya di layar HP) */}
      <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-xs">
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg text-black">Portal Panel</span>
          <span className="text-[10px] text-gray-500 font-mono">Role: {role}</span>
        </div>
        {/* Tombol Hamburger (Memicu Checkbox) */}
        <label htmlFor="mobile-menu-toggle" className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer select-none active:bg-gray-200">
          <span className="material-symbols-outlined text-gray-700">menu</span>
        </label>
      </div>

      {/* BACKDROP/OVERLAY (Latar hitam transparan saat menu HP terbuka) */}
      <label 
        htmlFor="mobile-menu-toggle" 
        className="fixed inset-0 bg-black/40 z-40 hidden peer-checked:block md:hidden backdrop-blur-xs transition-all"
      />

      {/* ========================================================= */}
      {/* 📱 SIDEBAR MOBILE (Meluncur dari kiri ke kanan saat diklik) */}
      {/* ========================================================= */}
      <aside className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col shadow-2xl -translate-x-full peer-checked:translate-x-0 transition-transform duration-300 md:hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-display font-bold text-xl">Portal Panel</h2>
            <p className="text-xs text-cyan-600 mt-1 font-mono font-bold">Role: {role}</p>
          </div>
          {/* Tombol Close */}
          <label htmlFor="mobile-menu-toggle" className="w-8 h-8 bg-gray-200/70 rounded-full flex items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined text-gray-600 text-sm">close</span>
          </label>
        </div>
        
        {/* Menu Navigasi Mobile */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {/* Menggunakan label htmlFor agar ketika link diklik, menu otomatis menutup sendiri */}
          <label htmlFor="mobile-menu-toggle">
            <Link href="/dashboard" className="w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard Utama
            </Link>
          </label>
          
          <label htmlFor="mobile-menu-toggle">
            <Link href="/dashboard/mading" className="w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">dashboard_customize</span> Kelola Mading
            </Link>
          </label>

          <label htmlFor="mobile-menu-toggle">
            <Link href="/dashboard/event" className="w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span> Kelola Kegiatan
            </Link>
          </label>

          {role !== "OSIS" && (
            <label htmlFor="mobile-menu-toggle">
              <Link href="/dashboard/berita" className="w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px]">newspaper</span> Kelola Berita
              </Link>
            </label>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
           <LogoutButton />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 💻 SIDEBAR DESKTOP (Normal tetap tampil seperti biasa) */}
      {/* ========================================================= */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-display font-bold text-xl">Portal Panel</h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">Role: {role}</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
          </Link>
          
          <Link href="/dashboard/mading" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">dashboard_customize</span> Kelola Mading
          </Link>

          <Link href="/dashboard/event" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span> Kelola Kegiatan
          </Link>

          {role !== "OSIS" && (
            <Link href="/dashboard/berita" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">newspaper</span> Kelola Berita
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <LogoutButton />
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 md:p-8">
        <header className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-display font-bold">Halo, {session.user?.name}!</h1>
        </header>
        {children}
      </main>
    </div>
  );
}