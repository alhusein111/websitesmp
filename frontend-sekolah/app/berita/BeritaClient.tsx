/* eslint-disable prefer-const */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import Link from 'next/link';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getImageUrl(media: any, defaultUrl: string): string {
  if (!media) return defaultUrl;
  
  let item = media;
  if (Array.isArray(media) && media.length > 0) item = media[0];
  else if (media.data && Array.isArray(media.data) && media.data.length > 0) item = media.data[0];
  else if (media.data && !Array.isArray(media.data)) item = media.data;

  if (!item) return defaultUrl;

  let url = '';
  if (typeof item === 'string') url = item;
  else if (item.url) url = item.url;
  else if (item.attributes?.url) url = item.attributes.url;

  if (url) return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  return defaultUrl;
}

function getAuthorName(authorData: any): string {
  if (!authorData) return "Anonim";
  if (typeof authorData === "string") return authorData;
  if (authorData?.data?.attributes?.username) return authorData.data.attributes.username;
  if (authorData?.data?.attributes?.name) return authorData.data.attributes.name;
  if (authorData?.username) return authorData.username;
  if (authorData?.name) return authorData.name;
  return "Anonim";
}

// PERBAIKAN: Fungsi ini sekarang akan membersihkan sintaks Markdown agar jadi teks murni
function extractText(content: any): string {
  if (!content) return "";
  let rawText = "";

  if (typeof content === 'string') {
    rawText = content;
  } else if (Array.isArray(content)) {
    rawText = content.map((block: any) => {
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || "").join(' ');
      }
      if (typeof block === 'string') return block;
      return "";
    }).join(' ');
  }

  if (!rawText) return "";

  let cleanText = rawText
    .replace(/!\[.*?\]\(.*?\)/g, '') // Hapus gambar dari markdown
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Ubah link markdown jadi teks biasa
    .replace(/[#*`_~>-]/g, '') // Hapus simbol markdown (#, *, dll)
    .replace(/<[^>]+>/g, '') // Hapus tag HTML jika ada
    .replace(/&nbsp;/g, ' ')
    .replace(/\n+/g, ' ') // Ubah enter jadi spasi
    .replace(/\s+/g, ' '); // Rapikan spasi ganda

  return cleanText.trim();
}

export default function BeritaClient({ articles }: { articles: any[] }) {
  const [activeCategory, setActiveCategory] = useState('Semua Berita');

  const categories = ['Semua Berita', ...Array.from(new Set(articles.map((a: any) => {
    const data = a.attributes || a;
    return data.Kategori;
  }).filter(Boolean)))];

  const filteredArticles = articles.filter((a: any) => {
    const data = a.attributes || a;
    if (activeCategory === 'Semua Berita') return true;
    return data.Kategori === activeCategory;
  });

  return (
    <div className="w-full">
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
            const authorName = getAuthorName(data.Author);

            return (
              <Link 
                href={`/berita/${slug}`} 
                key={article.id} 
                className="group flex flex-col bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
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
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">calendar_month</span>
                        {tanggal}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">edit</span>
                        {authorName}
                      </span>
                    </div>
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