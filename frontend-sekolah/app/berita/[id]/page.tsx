/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LikeSection from './LikeSection';
import CommentSection from './CommentSection';
import FloatingShare from './FloatingShare'; // IMPORT KOMPONEN SHARE BARU
import { JSX } from 'react/jsx-runtime';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getImageUrl(media: any, defaultUrl: string): string {
  if (!media) return defaultUrl;
  if (typeof media === 'string') return media.startsWith('http') ? media : `${STRAPI_URL}${media}`;
  if (media.url) return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
  if (media.data?.attributes?.url) return `${STRAPI_URL}${media.data.attributes.url}`;
  return defaultUrl;
}

// Fungsi merender teks editor Strapi v4/v5 (Blocks)
function renderBlocks(content: any) {
  if (!content) return null;
  if (typeof content === 'string') return <p className="whitespace-pre-wrap">{content}</p>;
  
  if (Array.isArray(content)) {
    return content.map((block, index) => {
      switch (block.type) {
        case 'paragraph':
          return (
            <p key={index} className="font-body text-base text-gray-700 leading-relaxed mb-4">
              {block.children?.map((c: any, i: number) => {
                if (c.bold) return <strong key={i}>{c.text}</strong>;
                if (c.italic) return <em key={i}>{c.text}</em>;
                return c.text;
              })}
            </p>
          );
        case 'heading':
          const Level = `h${block.level || 3}` as keyof JSX.IntrinsicElements;
          const headingStyles = block.level === 1 ? "text-3xl font-bold mb-4" : block.level === 2 ? "text-2xl font-bold mb-3" : "text-xl font-bold mb-2";
          return (
            <Level key={index} className={`font-display text-black ${headingStyles} mt-6`}>
              {block.children?.map((c: any) => c.text).join('')}
            </Level>
          );
        case 'list':
          const ListTag = block.format === 'ordered' ? 'ol' : 'ul';
          const listStyle = block.format === 'ordered' ? 'list-decimal pl-6' : 'list-disc pl-6';
          return (
            <ListTag key={index} className={`${listStyle} font-body text-gray-700 mb-4 space-y-2`}>
              {block.items?.map((item: any, i: number) => (
                <li key={i}>{item.children?.map((c: any) => c.text).join('')}</li>
              ))}
            </ListTag>
          );
        default:
          return null;
      }
    });
  }
  return null;
}

// 1. Tarik Data Artikel Utama
async function getArticleDetail(idOrSlug: string) {
  try {
    let res = await fetch(`${STRAPI_URL}/api/artikels?filters[Slug][$eq]=${idOrSlug}&populate=*`, { cache: 'no-store' });
    let json = await res.json();

    if (!json.data || json.data.length === 0) {
      res = await fetch(`${STRAPI_URL}/api/artikels/${idOrSlug}?populate=*`, { cache: 'no-store' });
      json = await res.json();
      return json.data ? json.data : null;
    }
    return json.data[0];
  } catch (error) {
    console.error("Gagal menarik detail artikel:", error);
    return null;
  }
}

// 2. Tarik Data untuk Sidebar (Berita Terbaru & Kegiatan)
async function getSidebarData() {
  try {
    // Berita Terbaru (Ambil 3)
    const resArtikels = await fetch(`${STRAPI_URL}/api/artikels?populate=*&sort=createdAt:desc&pagination[limit]=3`, { cache: 'no-store' });
    const jsonArtikels = await resArtikels.json();

    // Kegiatan Mendatang (Ambil 3, filter tanggal) - Ingat ya mas brow pakai /events
    const hariIni = new Date().toISOString().split('T')[0];
    const resKegiatan = await fetch(`${STRAPI_URL}/api/events?filters[TampilkanDiSidebar][$eq]=true&filters[$or][0][TanggalSelesai][$gte]=${hariIni}&filters[$or][1][TanggalMulai][$gte]=${hariIni}&sort=TanggalMulai:asc&pagination[limit]=3`, { cache: 'no-store' });
    const jsonKegiatan = await resKegiatan.json();

    return { 
      recentArticles: jsonArtikels.data || [], 
      upcomingEvents: jsonKegiatan.data || [] 
    };
  } catch (error) {
    return { recentArticles: [], upcomingEvents: [] };
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const [article, sidebarData] = await Promise.all([
    getArticleDetail(resolvedParams.id),
    getSidebarData()
  ]);

  if (!article) notFound();

  const data = article.attributes || article;
  const judul = data.Judul || "Tanpa Judul";
  const kategori = data.Kategori || "Umum";
  const rawTanggal = data.Tanggal || data.createdAt;
  const tanggal = new Date(rawTanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const imgUrl = getImageUrl(data.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=1200');


  return (
    <main className="w-full pb-20 pt-6 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* =======================================
            KOLOM KIRI: FLOATING ACTION BUTTONS
        ======================================= */}
        
        {/* PANGGIL KOMPONEN SHARE DI SINI */}
        <FloatingShare judul={judul} />

        {/* =======================================
            KOLOM TENGAH: KONTEN ARTIKEL & KOMENTAR
        ======================================= */}
        <div className="flex-1 w-full max-w-3xl">
          {/* Tombol Kembali (Hanya tampil di HP) */}
          <Link href="/berita" className="lg:hidden inline-flex items-center gap-2 font-mono text-xs font-bold text-gray-500 hover:text-black mb-6 transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> KEMBALI
          </Link>

          <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {kategori}
              </span>
              <span className="text-gray-400 text-xs font-mono">• {tanggal}</span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-black font-bold leading-tight mb-6">
              {judul}
            </h1>

            {/* Gambar Cover */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-8">
              <img src={imgUrl} alt={judul} className="w-full h-full object-cover" />
            </div>

            {/* Isi Konten Berita */}
            <div className="prose max-w-none border-b border-gray-100 pb-8 mb-6">
              {renderBlocks(data.Konten)}
            </div>

            {/* Area Rating (Like / Dislike) */}
            <LikeSection 
              articleDocId={article.documentId || article.id} 
              initialLikes={data.Likes || 0} 
              initialDislikes={data.Dislikes || 0} 
            />
          </article>

          {/* Kolom Diskusi */}
          <CommentSection beritaId={String(article.id)} />
        </div>

        {/* =======================================
            KOLOM KANAN: SIDEBAR WIDGETS
        ======================================= */}
        <aside className="w-full lg:w-[320px] xl:w-95 shrink-0 flex flex-col gap-8 lg:sticky lg:top-28">
          
          {/* Widget 1: Berita Terbaru */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-black flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <span className="material-symbols-outlined text-amber-500">newspaper</span>
              Berita Terbaru
            </h3>
            <ul className="flex flex-col gap-5">
              {sidebarData.recentArticles.map((item: any) => {
                const bData = item.attributes || item;
                const bImg = getImageUrl(bData.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=200');
                const bSlug = bData.Slug || item.documentId || item.id;
                
                return (
                  <li key={item.id}>
                    <Link href={`/berita/${bSlug}`} className="flex gap-4 items-center group">
                      <img src={bImg} alt={bData.Judul} className="w-16 h-16 rounded-xl object-cover border border-gray-100 group-hover:border-cyan-500 transition-colors shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm text-black line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">
                          {bData.Judul}
                        </h4>
                        <p className="text-[10px] font-mono text-gray-400 mt-1">
                          {new Date(bData.Tanggal || bData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Widget 2: Kegiatan Mendatang */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-black flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <span className="material-symbols-outlined text-cyan-600">event_note</span>
              Kegiatan Mendatang
            </h3>
            <ul className="flex flex-col gap-5">
              {sidebarData.upcomingEvents.length > 0 ? (
                sidebarData.upcomingEvents.map((item: any) => {
                  const kData = item.attributes || item;
                  const dateObj = new Date(kData.TanggalMulai);
                  
                  return (
                    <li key={item.id} className="flex gap-4 items-start group">
                      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl py-2 w-14 shrink-0 border border-gray-100 group-hover:border-cyan-500 group-hover:bg-cyan-50 transition-colors">
                        <span className="font-mono text-[9px] font-bold text-gray-500 uppercase">
                          {dateObj.toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                        <span className="font-display text-xl font-bold text-black group-hover:text-cyan-700">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-black line-clamp-2 mb-1 group-hover:text-cyan-600 transition-colors">
                          {kData.NamaKegiatan}
                        </h4>
                        {kData.Lokasi && (
                          <p className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">location_on</span> {kData.Lokasi}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })
              ) : (
                <li className="text-gray-400 text-xs italic font-mono text-center">Belum ada agenda terdekat.</li>
              )}
            </ul>
          </div>

        </aside>

      </div>
    </main>
  );
}