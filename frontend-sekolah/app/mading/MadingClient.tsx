'use client';

import { useState } from 'react';
import Link from 'next/link';

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

function getMediaInfo(media: any, defaultUrl: string) {
  if (!media) return { url: defaultUrl, isVideo: false };
  let url = '';
  let mime = '';

  if (typeof media === 'string') {
    url = media.startsWith('http') ? media : `${STRAPI_URL}${media}`;
  } else if (media.url) {
    url = media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
    mime = media.mime || '';
  } else if (media.data?.attributes?.url) {
    const attr = media.data.attributes;
    url = attr.url.startsWith('http') ? attr.url : `${STRAPI_URL}${attr.url}`;
    mime = attr.mime || '';
  } else {
    return { url: defaultUrl, isVideo: false };
  }

  const isVideo = mime.startsWith('video/') || url.match(/\.(mp4|webm|ogg)$/i) !== null;
  return { url, isVideo };
}

// Daftar kategori sesuai permintaan mas brow
const CATEGORIES = ["All", "Puisi", "Cerpen", "Komik", "Poster", "Lukisan", "Video", "Artikel Siswa"];
const ITEMS_PER_PAGE = 6; // Jumlah mading yang muncul pertama kali

export default function MadingClient({ madings }: { madings: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Fungsi memfilter data berdasarkan kategori yang diklik
  const filteredMadings = madings.filter((item) => {
    if (activeCategory === "All") return true;
    const data = item.attributes || item;
    const kategori = data.Kategori || "Lainnya";
    // Cocokkan kategori (case-insensitive)
    return kategori.toLowerCase() === activeCategory.toLowerCase();
  });

  // Potong data sesuai jumlah yang boleh ditampilkan (Load More logic)
  const displayedMadings = filteredMadings.slice(0, visibleCount);
  
  // Cek apakah masih ada sisa data yang belum ditampilkan
  const hasMore = visibleCount < filteredMadings.length;

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE); // Reset jumlah tampilan ke 6 lagi kalau ganti kategori
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <>
      {/* 2. CATEGORY FILTERS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`font-mono text-xs font-bold px-6 py-2.5 rounded-full shadow-sm hover:scale-105 transition-all ${
              activeCategory === cat
                ? "bg-black text-white" // Tombol aktif
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100" // Tombol pasif
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* 3. MASONRY GRID */}
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

              return (
                <Link href={`/mading/${item.documentId || item.id}`} key={item.id} className={`block break-inside-avoid rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl border group ${isDark ? 'bg-black text-white border-black' : isGlass ? 'bg-white/60 backdrop-blur-xl border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)]' : 'bg-white border-gray-100 text-black'}`}>
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
                      <span className={`font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${isDark ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{kategori}</span>
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
              );
            })
          ) : (
            <div className="text-center w-full py-10 font-mono text-sm text-gray-500">
              Belum ada karya untuk kategori ini.
            </div>
          )}
        </div>
      </section>

      {/* 4. LOAD MORE BUTTON */}
      {hasMore && (
        <div className="mt-16 text-center animate-fadeIn">
          <button 
            onClick={handleLoadMore}
            className="border-2 border-gray-300 text-black font-mono text-xs font-bold px-8 py-4 rounded-full hover:border-black hover:bg-gray-100 transition-all duration-300"
          >
            MUAT LEBIH BANYAK
          </button>
        </div>
      )}
    </>
  );
}