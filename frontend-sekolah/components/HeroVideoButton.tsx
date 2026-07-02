/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';

interface HeroVideoButtonProps {
  videoUrl: string;
}

export default function HeroVideoButton({ videoUrl }: HeroVideoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mencegah hydration error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mengunci scroll background saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Fungsi pintar untuk mengekstrak ID YouTube dan mengubahnya jadi URL Embed
  const getEmbedUrl = (url: string) => {
    if (!url || url === '#') return '';
    let videoId = '';
    
    // Format: https://youtu.be/ID
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } 
    // Format: https://www.youtube.com/watch?v=ID
    else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    // Jika sudah format embed, kembalikan apa adanya
    else if (url.includes('/embed/')) {
      return url;
    }

    // Tambahkan parameter autoplay=1 agar video langsung jalan saat pop-up dibuka
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  if (!isMounted) return null;

  return (
    <>
      {/* TOMBOL PEMICU (Sama dengan desain Anda sebelumnya) */}
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-mono text-xs font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2 group"
      >
        <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">
          play_circle
        </span>
        Video Profil
      </button>

      {/* MODAL POP-UP (LIGHTBOX) */}
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Latar Belakang Gelap (Backdrop) */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)} // Tutup saat background di-klik
          ></div>

          {/* Kontainer Video */}
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 animate-in fade-in zoom-in-95 duration-300">
            
            {/* Tombol Tutup (X) di pojok kanan atas */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20"
              aria-label="Tutup Video"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Area Iframe 16:9 */}
            <div className="relative w-full aspect-video bg-gray-900 flex items-center justify-center">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Video Profil Sekolah"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-white flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-gray-500">videocam_off</span>
                  <p className="font-mono text-sm text-gray-400">Video belum tersedia</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}