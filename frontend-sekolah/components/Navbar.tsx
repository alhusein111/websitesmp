'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react'; // 1. Import useSession dari NextAuth

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); 
  
  // 2. Ambil data session dan status login dari NextAuth
  const { data: session, status } = useSession();

  const activeClass = "text-black font-bold border-b-2 border-black pb-1 font-mono text-xs tracking-wider";
  const inactiveClass = "text-gray-600 hover:text-black font-mono text-xs tracking-wider transition-all px-3 py-2 rounded-lg hover:bg-gray-100";

  return (
    <header className="bg-white/80 backdrop-blur-xl sticky top-0 border-b border-gray-200/50 shadow-sm z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-20 w-full">
        
        {/* --- BAGIAN LOGO & JUDUL --- */}
        <Link href="/" className="flex items-center gap-3">
          <Image 
            src="/logo.png" 
            alt="Logo SMP YAPI AL-HUSAENI" 
            width={48} 
            height={48} 
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-black">
            SMP YAPI AL-HUSAENI
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={pathname === '/' ? activeClass : inactiveClass}>HOME</Link>
          <Link href="/berita" className={pathname.startsWith('/berita') ? activeClass : inactiveClass}>BERITA</Link>
          <Link href="/profil" className={pathname === '/profil' ? activeClass : inactiveClass}>PROFILE</Link>
          <Link href="/staf" className={pathname === '/staf' ? activeClass : inactiveClass}>STAF</Link>
          <Link href="/mading" className={pathname === '/mading' ? activeClass : inactiveClass}>MADING DIGITAL</Link>
          <Link href="/spmb" className={pathname === '/spmb' ? activeClass : inactiveClass}>SPMB</Link>
          <Link href="https://cbt.smpyapialhusaeni.sch.id/login" className={pathname === '' ? activeClass : inactiveClass}>CBT</Link>
        </nav>

        {/* --- BAGIAN TOMBOL LOGIN / DASHBOARD (DESKTOP) --- */}
        <div className="hidden md:flex items-center gap-4">
          {status === 'loading' ? (
            // Animasi loading skeleton saat mengecek session
            <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : session ? (
            // Tombol jika SUDAH login
            <Link href="/dashboard" className="flex items-center gap-2 bg-gray-100 text-black border border-gray-200 px-5 py-2.5 rounded-lg font-mono text-xs font-semibold hover:bg-gray-200 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Dashboard
            </Link>
          ) : (
            // Tombol jika BELUM login
            <Link href="/login" className="bg-black text-white px-6 py-3 rounded-lg font-mono text-xs font-semibold hover:bg-gray-800 transition-colors shadow-sm">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 p-2 md:hidden">
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-4 animate-fadeIn">
          <Link href="/" className={pathname === '/' ? "font-semibold text-black" : "text-gray-600"} onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/profil" className={pathname === '/profil' ? "font-semibold text-black" : "text-gray-600"} onClick={() => setIsOpen(false)}>Profile</Link>
          <Link href="/staf" className={pathname === '/staf' ? "font-semibold text-black" : "text-gray-600"} onClick={() => setIsOpen(false)}>Staf</Link>
          <Link href="/mading" className={pathname === '/mading' ? "font-semibold text-black" : "text-gray-600"} onClick={() => setIsOpen(false)}>Mading Digital</Link>
          <Link href="/spmb" className={pathname === '/spmb' ? "font-semibold text-black" : "text-gray-600"} onClick={() => setIsOpen(false)}>SPMB</Link>
          <Link href="/berita" className={pathname.startsWith('/berita') ? "font-semibold text-black" : "text-gray-600"} onClick={() => setIsOpen(false)}>BERITA</Link>
          
          {/* --- BAGIAN TOMBOL LOGIN / DASHBOARD (MOBILE) --- */}
          {status === 'loading' ? (
            <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg mt-2"></div>
          ) : session ? (
            <Link href="/dashboard" className="bg-gray-100 border border-gray-200 text-black flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-xs mt-2" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="bg-black text-white text-center py-3 rounded-lg font-mono text-xs block mt-2" onClick={() => setIsOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}