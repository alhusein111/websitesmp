/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';

export default function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Ambil URL saat komponen dimuat di browser
  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Lihat karya keren ini: ${title}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInstagramShare = () => {
    handleCopy(); // Otomatis salin link dulu
    // Beri sedikit delay sebelum buka tab baru supaya user melihat tulisan "Tersalin!"
    setTimeout(() => {
      window.open('https://instagram.com', '_blank');
    }, 600);
  };

  return (
    <div className="flex lg:flex-col gap-4 items-center">
      <span className="hidden lg:block font-mono text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-2">
        Share
      </span>

      {/* WhatsApp */}
      <a 
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 group"
        title="Bagikan ke WhatsApp"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.124.553 4.195 1.604 6.01L.068 23.518l5.632-1.477a11.977 11.977 0 006.331 1.782h.004c6.645 0 12.03-5.385 12.03-12.03S18.676 0 12.031 0zm0 19.82a9.921 9.921 0 01-5.066-1.385l-.363-.215-3.766.987.999-3.673-.236-.375A9.923 9.923 0 012.115 12.03c0-5.485 4.464-9.95 9.92-9.95 2.659 0 5.158 1.036 7.037 2.915a9.92 9.92 0 012.913 7.036c-.001 5.485-4.466 9.949-9.954 9.949zM17.48 14.1c-.299-.15-1.767-.873-2.04-.973-.271-.101-.47-.15-.668.15-.199.3-.77 1.05-.944 1.272-.174.225-.348.25-.646.1-1.334-.672-2.316-1.282-3.21-2.527-.23-.32-.025-.494.123-.643.133-.133.298-.35.447-.525.15-.175.2-.299.3-.5.1-.2.05-.375-.025-.525-.075-.15-.668-1.61-.915-2.203-.242-.58-.487-.5-.668-.51-.174-.01-.373-.01-.572-.01-.2 0-.523.075-.797.375-.274.3-1.045 1.021-1.045 2.49 0 1.469 1.07 2.888 1.219 3.088.15.2 2.106 3.212 5.101 4.505 2.016.87 2.602.75 3.167.633.64-.132 1.767-.723 2.016-1.423.249-.7.249-1.3.174-1.423-.074-.125-.273-.2-.572-.35z"/>
        </svg>
      </a>

      {/* X / Twitter */}
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-800 hover:bg-black hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 group"
        title="Bagikan ke X (Twitter)"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.09H5.078z"/>
        </svg>
      </a>

      {/* Facebook */}
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 group"
        title="Bagikan ke Facebook"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>

      {/* Instagram (Salin Link + Buka Tab Baru) */}
      <button 
        onClick={handleInstagramShare}
        className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-pink-600 hover:bg-linear-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300 group"
        title="Salin Tautan dan Buka Instagram"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      </button>

      {/* Copy Link */}
      <div className="relative">
        <button 
          onClick={handleCopy}
          className="w-12 h-12 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-500 hover:bg-cyan-500 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
          title="Salin Tautan"
        >
          <span className="material-symbols-outlined text-[20px]">link</span>
        </button>
        
        {/* Tooltip Copied */}
        <div className={`absolute top-1/2 -translate-y-1/2 left-full ml-4 bg-black text-white font-mono text-[10px] px-2 py-1 rounded-md whitespace-nowrap transition-all duration-300 pointer-events-none ${copied ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}>
          Tersalin!
        </div>
      </div>
    </div>
  );
}