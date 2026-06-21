/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Helper untuk memastikan URL gambar valid
function getImageUrl(media: any, defaultUrl: string): string {
  if (!media) return defaultUrl;
  if (typeof media === 'string') return media.startsWith('http') ? media : `${STRAPI_URL}${media}`;
  if (media.url) return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
  if (media.data?.attributes?.url) return `${STRAPI_URL}${media.data.attributes.url}`;
  return defaultUrl;
}

// Helper untuk ekstrak teks dari Rich Text Strapi
function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((block: any) => block.children?.map((c: any) => c.text || "").join('')).join(' ');
  }
  return "";
}

export default function BeritaClient({ articles }: { articles: any[] }) {
  const [activeCategory, setActiveCategory] = useState('Semua Berita');

  // 1. Ekstrak kategori unik dari data artikel
  const categories = ['Semua Berita', ...Array.from(new Set(articles.map((a: any) => {
    const data = a.attributes || a;
    return data.Kategori;
  }).filter(Boolean)))];

  // 2. Filter artikel berdasarkan kategori yang dipilih
  const filteredArticles = articles.filter((a: any) => {
    const data = a.attributes || a;
    if (activeCategory === 'Semua Berita') return true;
    return data.Kategori === activeCategory;
  });

  return (
    <div className="w-full">
      
      {/* FILTER KATEGORI - MENGGUNAKAN FLEX-WRAP */}
      {/* flex-wrap akan membuat tombol otomatis turun ke baris bawah jika tidak muat, menghilangkan scrollbar horizontal! */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((kategori: any) => (
          <button
            key={kategori}
            onClick={() => setActiveCategory(kategori)}
            className={`px-5 py-2 rounded-full font-mono text-xs font-bold transition-all ${
              activeCategory === kategori
                ? 'bg-black text-white border-transparent'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-black hover:text-black shadow-sm'
            }`}
          >
            {kategori}
          </button>
        ))}
      </div>

      {/* GRID ARTIKEL & THUMBNAIL KUNCIAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article: any) => {
            const data = article.attributes || article;
            const judul = data.Judul || "Tanpa Judul";
            const konten = extractText(data.Konten);
            const rawTanggal = data.Tanggal || data.tanggal || data.createdAt;
            const tanggal = new Date(rawTanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const imgUrl = getImageUrl(data.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=600');
            const kategori = data.Kategori || "Umum";
            const slug = data.Slug || article.documentId || article.id;

            return (
              <Link 
                href={`/berita/${slug}`} 
                key={article.id} 
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* THUMBNAIL GAMBAR: Dikunci dengan aspect-[4/3] dan object-cover */}
                <div className="relative w-full aspect-4/3 overflow-hidden bg-gray-100">
                  <img 
                    src={imgUrl} 
                    alt={judul} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-amber-50 text-amber-600 border border-amber-100 font-mono text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {kategori}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                      {tanggal}
                    </span>
                  </div>
                  
                  <h3 className="font-display text-xl font-bold text-black mb-2 line-clamp-2 group-hover:text-cyan-600 transition-colors">
                    {judul}
                  </h3>
                  <p className="font-body text-sm text-gray-500 line-clamp-3 mb-6 flex-1">
                    {konten}
                  </p>
                  
                  <span className="font-mono text-xs font-bold text-black flex items-center gap-2 group-hover:translate-x-2 transition-transform w-max mt-auto">
                    Baca Selengkapnya
                    <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">article</span>
            <p className="font-mono text-sm text-gray-500">Belum ada berita di kategori ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}