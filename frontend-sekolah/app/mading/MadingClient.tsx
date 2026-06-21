/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from '@/components/ScrollReveal';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((block: any) => {
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || "").join('');
      }
      return "";
    }).join('\n\n');
  }
  return "";
}

// Mengambil satu media (gambar pertama) dari format Multiple Media
function getMediaInfo(media: any, defaultUrl: string) {
  if (!media) return { url: defaultUrl, isVideo: false };
  
  let item = media;
  
  // Jika formatnya Array (Multiple Media flat v5)
  if (Array.isArray(media) && media.length > 0) {
    item = media[0];
  } 
  // Jika formatnya Array di dalam data (Multiple Media v4)
  else if (media.data && Array.isArray(media.data) && media.data.length > 0) {
    item = media.data[0];
  } 
  // Jika single media v4
  else if (media.data && !Array.isArray(media.data)) {
    item = media.data;
  }

  let url = '';
  let mime = '';

  if (typeof item === 'string') {
    url = item.startsWith('http') ? item : `${STRAPI_URL}${item}`;
  } else if (item.url) {
    url = item.url.startsWith('http') ? item.url : `${STRAPI_URL}${item.url}`;
    mime = item.mime || '';
  } else if (item.attributes?.url) {
    const attr = item.attributes;
    url = attr.url.startsWith('http') ? attr.url : `${STRAPI_URL}${attr.url}`;
    mime = attr.mime || '';
  } else {
    return { url: defaultUrl, isVideo: false };
  }

  const isVideo = mime.startsWith('video/') || url.match(/\.(mp4|webm|ogg)$/i) !== null;
  return { url, isVideo };
}

// FITUR BARU: Fungsi untuk menentukan warna badge berdasarkan nama kategori
function getCategoryColor(kategori: string): string {
  const normalizedCategory = kategori.toLowerCase();
  
  switch (normalizedCategory) {
    case 'puisi':
      return 'bg-purple-100 text-purple-700'; // Ungu
    case 'cerpen':
      return 'bg-blue-100 text-blue-700';     // Biru
    case 'komik':
      return 'bg-orange-100 text-orange-800'; // Oranye
    case 'poster':
      return 'bg-rose-100 text-rose-700';     // Pink/Rose
    case 'lukisan':
      return 'bg-emerald-100 text-emerald-800';// Hijau Emerald
    case 'video':
      return 'bg-red-100 text-red-700';       // Merah
    case 'artikel siswa':
      return 'bg-cyan-100 text-cyan-800';     // Cyan/Teal
    default:
      return 'bg-gray-100 text-gray-700';     // Abu-abu (Default)
  }
}

const CATEGORIES = ["All", "Puisi", "Cerpen", "Komik", "Poster", "Lukisan", "Video", "Artikel Siswa"];
const ITEMS_PER_PAGE = 6;

export default function MadingClient({ madings }: { madings: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredMadings = madings.filter((item) => {
    if (activeCategory === "All") return true;
    const data = item.attributes || item;
    const kategori = data.Kategori || "Lainnya";
    return kategori.toLowerCase() === activeCategory.toLowerCase();
  });

  const displayedMadings = filteredMadings.slice(0, visibleCount);
  const hasMore = visibleCount < filteredMadings.length;

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <>
      <ScrollReveal delay={0.4} direction="up">
        <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`font-mono text-xs font-bold px-6 py-2.5 rounded-full shadow-sm hover:scale-105 transition-all ${
                activeCategory === cat
                  ? "bg-black text-white" 
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100" 
              }`}
            >
              {cat}
            </button>
          ))}
        </section>
      </ScrollReveal>

      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayedMadings.length > 0 ? (
            displayedMadings.map((item: any, index: number) => {
              const data = item.attributes || item; 
              const judul = data.Judul || "Tanpa Judul";
              const konten = extractText(data.Konten) || "Deskripsi karya...";
              const kategori = data.Kategori || "KARYA";
              const penulis = data.Penulis || "Siswa YAPI";
              const kelas = data.Kelas || "";
              const mediaInfo = getMediaInfo(data.Gambar, "");
              
              const tanggalRaw = data.Tanggal || data.createdAt;
              const tanggalFormat = tanggalRaw 
                ? new Date(tanggalRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                : "";
              
              const isDark = index % 4 === 3; 
              const isGlass = index % 4 === 0; 
              
              // Animasi Staggered Mading
              const staggerDelay = 0.1 * (index % 3 + 1);
              
              // Ambil warna kategori spesifik
              const badgeColor = getCategoryColor(kategori);

              return (
                <ScrollReveal delay={staggerDelay} direction="up" key={item.id}>
                  <Link href={`/mading/${item.documentId || item.id}`} className={`block break-inside-avoid rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl border group ${isDark ? 'bg-black text-white border-black' : isGlass ? 'bg-white/60 backdrop-blur-xl border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)]' : 'bg-white border-gray-100 text-black'}`}>
                    {mediaInfo.url && (
                      <div className="relative w-full overflow-hidden bg-gray-100">
                        {mediaInfo.isVideo ? (
                          <>
                            <video src={`${mediaInfo.url}#t=0.1`} className="w-full object-cover max-h-80" preload="metadata" muted playsInline />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all duration-300 group-hover:bg-black/50">
                              <span className="material-symbols-outlined text-white text-[64px] drop-shadow-md opacity-90 group-hover:scale-110 transition-transform">play_circle</span>
                            </div>
                          </>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mediaInfo.url} alt={judul} className="w-full object-cover max-h-80" />
                        )}
                      </div>
                    )}

                    <div className="p-8">
                      <div className="flex justify-between items-center mb-4">
                        {/* PENERAPAN WARNA KATEGORI DI SINI */}
                        <span className={`font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${badgeColor}`}>
                          {kategori}
                        </span>
                        {tanggalFormat && <span className={`font-mono text-[10px] tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tanggalFormat}</span>}
                      </div>
                      <h3 className={`font-display text-2xl font-bold mb-3 leading-snug ${isDark ? 'text-white' : 'text-black'}`}>{judul}</h3>
                      <p className={`font-body text-sm mb-6 line-clamp-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{konten}</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/20">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>{penulis.charAt(0).toUpperCase()}</div>
                        <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{penulis} {kelas ? `(${kelas})` : ''}</span>
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })
          ) : (
            <div className="text-center w-full py-10 font-mono text-sm text-gray-500">
              Belum ada karya untuk kategori ini.
            </div>
          )}
        </div>
      </section>

      {hasMore && (
        <ScrollReveal delay={0.2} direction="up" className="mt-16 text-center">
          <button 
            onClick={handleLoadMore}
            className="border-2 border-gray-300 text-black font-mono text-xs font-bold px-8 py-4 rounded-full hover:border-black hover:bg-gray-100 transition-all duration-300"
          >
            MUAT LEBIH BANYAK
          </button>
        </ScrollReveal>
      )}
    </>
  );
}