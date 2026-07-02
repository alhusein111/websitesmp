/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // State untuk mengontrol modal terbuka/tertutup

  // Mengunci scroll body browser saat modal gambar terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!images || images.length === 0) return null;

  // Fungsi navigasi di dalam modal
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Cegah modal tertutup
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Cegah modal tertutup
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="w-full mb-8 space-y-3">
        {/* FRAME GAMBAR UTAMA */}
        <div 
          className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative group shadow-xs cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <img 
            src={images[activeIndex]} 
            alt={`${alt} - Foto ${activeIndex + 1}`} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" 
          />
          
          {/* OVERLAY HOVER ZOOM */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 bg-black/70 text-white font-mono text-xs px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0">
              <span className="material-symbols-outlined text-[16px]">zoom_in</span> Perbesar Gambar
            </span>
          </div>

          {/* INDIKATOR ANGKA (Hanya muncul jika gambar > 1) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md select-none tracking-wider">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* THUMBNAIL PILIHAN GAMBAR (Hanya muncul jika gambar > 1) */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
            {images.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden border-2 shrink-0 bg-gray-50 transition-all snap-start ${
                  activeIndex === idx 
                    ? 'border-cyan-500 scale-95 shadow-md opacity-100' 
                    : 'border-transparent opacity-50 hover:opacity-90'
                }`}
              >
                <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MODAL POPUP FULLSCREEN (Tampil saat diklik) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-8 backdrop-blur-sm"
          onClick={() => setIsOpen(false)} 
        >
          {/* Tombol Close (Silang) */}
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors flex items-center justify-center z-10"
            onClick={(e) => { 
              e.stopPropagation(); 
              setIsOpen(false); 
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          {/* Navigasi Kiri (Hanya muncul jika gambar > 1) */}
          {images.length > 1 && (
            <button 
              className="absolute left-2 md:left-8 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition-colors z-10"
              onClick={prevImage}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}

          {/* Gambar Full Size */}
          <img
            src={images[activeIndex]}
            alt={`${alt} - Layar Penuh`}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()} // Supaya klik di gambar tidak menutup modal
          />
          
          {/* Navigasi Kanan (Hanya muncul jika gambar > 1) */}
          {images.length > 1 && (
            <button 
              className="absolute right-2 md:right-8 bg-white/10 hover:bg-white/20 text-white p-2 md:p-3 rounded-full transition-colors z-10"
              onClick={nextImage}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}

          {/* Indikator Angka di Layar Bawah Modal */}
          {images.length > 1 && (
            <div className="absolute bottom-8 text-white/50 font-mono text-sm tracking-widest z-10">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}