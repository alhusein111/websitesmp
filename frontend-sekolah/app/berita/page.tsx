/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import BeritaClient from './BeritaClient';
import ScrollReveal from '@/components/ScrollReveal'; // <-- IMPORT ANIMASI KITA

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getImageUrl(media: any, defaultUrl: string): string {
  if (!media) return defaultUrl;
  if (typeof media === 'string') return media.startsWith('http') ? media : `${STRAPI_URL}${media}`;
  if (media.url) return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
  if (media.data?.attributes?.url) return `${STRAPI_URL}${media.data.attributes.url}`;
  return defaultUrl;
}

function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((block: any) => block.children?.map((c: any) => c.text || "").join('')).join('\n\n');
  }
  return "";
}

// Tarik data Artikel dan Kegiatan secara bersamaan
async function getData() {
  try {
    const resArtikels = await fetch(`${STRAPI_URL}/api/artikels?populate=*&sort=createdAt:desc&pagination[limit]=100`, { cache: 'no-store' });
    const jsonArtikels = await resArtikels.json();
    
    // Tarik Kegiatan Mendatang (Filter: TanggalMulai >= hari ini & TampilkanDiSidebar == true)
    const hariIni = new Date().toISOString().split('T')[0]; 
    const resKegiatan = await fetch(`${STRAPI_URL}/api/events?filters[TampilkanDiSidebar][$eq]=true&filters[$or][0][TanggalSelesai][$gte]=${hariIni}&filters[$or][1][TanggalMulai][$gte]=${hariIni}&sort=TanggalMulai:asc&pagination[limit]=5`, { cache: 'no-store' });
    const jsonKegiatan = await resKegiatan.json();

    return { 
      articles: jsonArtikels.data || [], 
      kegiatan: jsonKegiatan.data || [] 
    };
  } catch (error) {
    console.error("Gagal menarik data:", error);
    return { articles: [], kegiatan: [] };
  }
}

export default async function NewsPage() {
  const { articles, kegiatan } = await getData();

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full space-y-12">
        
        {/* HERO SECTION: BERITA TERBARU (HIGHLIGHT) */}
        {articles.length > 0 && (() => {
          const heroArticle = articles[0].attributes || articles[0];
          const heroJudul = heroArticle.Judul || "Tanpa Judul";
          const heroKonten = extractText(heroArticle.Konten);
          const rawTanggal = heroArticle.Tanggal || heroArticle.tanggal || heroArticle.createdAt;
          const heroTanggal = new Date(rawTanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const heroImg = getImageUrl(heroArticle.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=1200');
          const slug = heroArticle.Slug || articles[0].documentId || articles[0].id;

          return (
            <ScrollReveal delay={0.1} direction="up">
              <Link href={`/berita/${slug}`} className="relative rounded-3xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 h-100 md:h-125 border border-gray-100 block">
                <img alt={heroJudul} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={heroImg} />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3 z-10 flex flex-col justify-end h-full">
                  <div className="inline-flex bg-cyan-500 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-full mb-4 tracking-wider w-max uppercase">
                    Berita Utama
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-4 leading-tight group-hover:text-cyan-300 transition-colors">
                    {heroJudul}
                  </h2>
                  <p className="font-body text-gray-300 mb-6 line-clamp-2 md:line-clamp-3 text-sm md:text-base">
                    {heroKonten}
                  </p>
                  <div className="flex items-center gap-6 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] leading-none">calendar_month</span> 
                      {heroTanggal}
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          );
        })()}

        {/* LAYOUT: BERITA (KIRI) & UPCOMING EVENTS (KANAN) */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* BAGIAN KIRI: DAFTAR BERITA DISERAHKAN KE CLIENT COMPONENT */}
          <div className="w-full lg:w-2/3">
            <ScrollReveal delay={0.3} direction="left">
              <BeritaClient articles={articles.slice(1)} />
            </ScrollReveal>
          </div>

          {/* BAGIAN KANAN: SIDEBAR UPCOMING EVENTS */}
          <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-28">
            <ScrollReveal delay={0.5} direction="right">
               <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h3 className="font-display text-xl font-bold text-black flex items-center gap-2">
                    <span className="material-symbols-outlined text-cyan-600 leading-none">event_note</span>
                    Kegiatan Mendatang
                  </h3>
                </div>
                
                <ul className="flex flex-col gap-6">
                  {kegiatan.length > 0 ? (
                    kegiatan.map((item: any, index: number) => {
                      const data = item.attributes || item;
                      
                      const dateObj = new Date(data.TanggalMulai);
                      const tgl = dateObj.getDate();
                      const bln = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                      
                      const startDateFull = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                      const endDateFull = data.TanggalSelesai 
                        ? new Date(data.TanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) 
                        : null;
                      
                      const rentangTanggal = endDateFull ? `${startDateFull} - ${endDateFull}` : startDateFull;
                      
                      return (
                        <li key={item.id} className="flex gap-4 items-start group">
                          {/* Kotak Tanggal Kiri */}
                          <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl py-3 w-16 shrink-0 border border-gray-100 group-hover:border-cyan-500 group-hover:bg-cyan-50 transition-colors shadow-sm">
                            <span className="font-mono text-[10px] font-bold text-gray-500 uppercase">{bln}</span>
                            <span className="font-display text-2xl font-bold text-black group-hover:text-cyan-700">{tgl}</span>
                          </div>
                          
                          {/* Detail Kegiatan Kanan */}
                          <div className="flex-1">
                            <h4 className="font-bold text-black text-base leading-tight mb-1 group-hover:text-cyan-600 transition-colors">
                              {data.NamaKegiatan}
                            </h4>
                            <p className="font-body text-sm text-gray-600 line-clamp-2 mb-2">
                              {data.DeskripsiSingkat}
                            </p>
                            
                            {/* Wrapper untuk info tambahan (Tanggal & Lokasi) */}
                            <div className="flex flex-col gap-1.5 mt-2">
                              <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px]">calendar_month</span> 
                                {rentangTanggal}
                              </p>
                              
                              {data.Lokasi && (
                                <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[14px]">location_on</span> 
                                  {data.Lokasi}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="text-gray-500 text-sm italic font-mono text-center py-4">Belum ada agenda terdekat.</li>
                  )}
                </ul>
                
                <Link href="/kalender" className="mt-8 flex items-center justify-center w-full py-3 bg-black text-white rounded-xl font-mono text-xs font-bold hover:bg-gray-800 transition-colors gap-2 group">
                  <span className="material-symbols-outlined text-[18px] leading-none group-hover:scale-110 transition-transform">calendar_month</span>
                  Lihat Kalender Penuh
                </Link>
              </div>
            </ScrollReveal>
          </aside>

        </div>
      </div>
    </main>
  );
}