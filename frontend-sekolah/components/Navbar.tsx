'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  // State untuk melacak dropdown mana yang sedang terbuka di Mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(''); 
  
  const pathname = usePathname(); 
  const { data: session, status } = useSession();

  const activeClass = "text-black font-bold border-b-2 border-black pb-1 font-mono text-xs tracking-wider";
  const inactiveClass = "text-gray-600 hover:text-black font-mono text-xs tracking-wider transition-all px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center gap-1";

  // Fungsi toggle untuk mobile menu
  const toggleMobileMenu = (menuName: string) => {
    if (mobileMenuOpen === menuName) {
      setMobileMenuOpen(''); // Tutup jika di-klik lagi
    } else {
      setMobileMenuOpen(menuName); // Buka menu yang dipilih
    }
  };

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
            style={{ width: "auto" }}
          />
          {/* Bagian span di bawah ini yang diubah kelas Tailwind-nya */}
          <span className="font-display text-base md:text-lg font-bold tracking-tight text-black whitespace-nowrap">
            SMP YAPI AL-HUSAENI
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link href="/" className={pathname === '/' ? activeClass : inactiveClass}>HOME</Link>
          <Link href="/berita" className={pathname.startsWith('/berita') ? activeClass : inactiveClass}>BERITA</Link>

          {/* DROPDOWN PROFIL */}
          <div className="relative group py-6">
            <button className={pathname.startsWith('/profil') || pathname === '/staf' ? activeClass : inactiveClass}>
              PROFIL <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <div className="absolute top-16 left-0 w-48 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden">
              <Link href="/profil" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Profil Sekolah</Link>
              <Link href="/staf" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Staf</Link>
              <Link href="/fasilitas" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Fasilitas</Link>
              <Link href="/ekskul" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Ekskul</Link>
            </div>
          </div>

          {/* DROPDOWN PROGRAM */}
          <div className="relative group py-6">
            <button className={pathname.startsWith('/program') ? activeClass : inactiveClass}>
              PROGRAM <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <div className="absolute top-16 left-0 w-56 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden">
              <Link href="/program/kurikulum" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Kurikulum / KOSP</Link>
              <Link href="/program/keagamaan" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Kegiatan Keagamaan</Link>
              <Link href="/program/7kaih" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">7KAIH</Link>
              <Link href="/program/literasi" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Literasi & Numerasi</Link>
            </div>
          </div>

          <Link href="/mading" className={pathname === '/mading' ? activeClass : inactiveClass}>MADING DIGITAL</Link>
          <Link href="/spmb" className={pathname === '/spmb' ? activeClass : inactiveClass}>SPMB</Link>

          {/* DROPDOWN APLIKASI */}
          <div className="relative group py-6">
            <button className={pathname.startsWith('/aplikasi') ? activeClass : inactiveClass}>
              APLIKASI <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <div className="absolute top-16 left-0 w-40 bg-white border border-gray-100 shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col overflow-hidden right-0 md:left-auto">
              <Link href="https://cbt.smpyapialhusaeni.sch.id/login" target="_blank" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">CBT</Link>
              <Link href="/aplikasi/keuangan" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Keuangan</Link>
              <Link href="/aplikasi/absensi" className="px-4 py-3 text-xs font-mono text-gray-700 hover:bg-gray-50 hover:text-black">Absensi</Link>
            </div>
          </div>
        </nav>

        {/* --- BAGIAN TOMBOL LOGIN / DASHBOARD (DESKTOP) --- */}
        <div className="hidden md:flex items-center gap-4">
          {status === 'loading' ? (
            <div className="w-24 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
          ) : session ? (
            <Link href="/dashboard" className="flex items-center gap-2 bg-gray-100 text-black border border-gray-200 px-5 py-2.5 rounded-lg font-mono text-xs font-semibold hover:bg-gray-200 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Dashboard
            </Link>
          ) : (
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
        <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex flex-col gap-3 animate-fadeIn h-[calc(100vh-80px)] overflow-y-auto">
          <Link href="/" className="font-semibold text-gray-800 py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/berita" className="font-semibold text-gray-800 py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Berita</Link>
          
          {/* Mobile Profil Accordion */}
          <div className="flex flex-col border-b border-gray-50">
            <button onClick={() => toggleMobileMenu('profil')} className="flex justify-between items-center font-semibold text-gray-800 py-2">
              Profil <span className="material-symbols-outlined">{mobileMenuOpen === 'profil' ? 'expand_less' : 'expand_more'}</span>
            </button>
            {mobileMenuOpen === 'profil' && (
              <div className="flex flex-col gap-2 pl-4 pb-2">
                <Link href="/profil" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Profil Sekolah</Link>
                <Link href="/staf" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Staf</Link>
                <Link href="/fasilitas" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Fasilitas</Link>
                <Link href="/ekskul" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Ekskul</Link>
              </div>
            )}
          </div>

          {/* Mobile Program Accordion */}
          <div className="flex flex-col border-b border-gray-50">
            <button onClick={() => toggleMobileMenu('program')} className="flex justify-between items-center font-semibold text-gray-800 py-2">
              Program <span className="material-symbols-outlined">{mobileMenuOpen === 'program' ? 'expand_less' : 'expand_more'}</span>
            </button>
            {mobileMenuOpen === 'program' && (
              <div className="flex flex-col gap-2 pl-4 pb-2">
                <Link href="/program/kurikulum" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Kurikulum / KOSP</Link>
                <Link href="/program/keagamaan" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Kegiatan Keagamaan</Link>
                <Link href="/program/7kaih" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">7KAIH</Link>
                <Link href="/program/literasi" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Literasi & Numerasi</Link>
              </div>
            )}
          </div>

          <Link href="/mading" className="font-semibold text-gray-800 py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>Mading Digital</Link>
          <Link href="/spmb" className="font-semibold text-gray-800 py-2 border-b border-gray-50" onClick={() => setIsOpen(false)}>SPMB</Link>

          {/* Mobile Aplikasi Accordion */}
          <div className="flex flex-col border-b border-gray-50">
            <button onClick={() => toggleMobileMenu('aplikasi')} className="flex justify-between items-center font-semibold text-gray-800 py-2">
              Aplikasi <span className="material-symbols-outlined">{mobileMenuOpen === 'aplikasi' ? 'expand_less' : 'expand_more'}</span>
            </button>
            {mobileMenuOpen === 'aplikasi' && (
              <div className="flex flex-col gap-2 pl-4 pb-2">
                <Link href="https://cbt.smpyapialhusaeni.sch.id/login" target="_blank" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">CBT</Link>
                <Link href="/aplikasi/keuangan" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Keuangan</Link>
                <Link href="/aplikasi/absensi" onClick={() => setIsOpen(false)} className="text-gray-600 text-sm py-1">Absensi</Link>
              </div>
            )}
          </div>
          
          {/* --- BAGIAN TOMBOL LOGIN / DASHBOARD (MOBILE) --- */}
          {status === 'loading' ? (
            <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg mt-4"></div>
          ) : session ? (
            <Link href="/dashboard" className="bg-gray-100 border border-gray-200 text-black flex items-center justify-center gap-2 py-3 rounded-lg font-mono text-xs mt-4" onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="bg-black text-white text-center py-3 rounded-lg font-mono text-xs block mt-4" onClick={() => setIsOpen(false)}>
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}