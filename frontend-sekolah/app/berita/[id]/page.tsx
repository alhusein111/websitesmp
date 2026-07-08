/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LikeSection from './LikeSection';
import CommentSection from './CommentSection';
import FloatingShare from './FloatingShare'; 
import ImageGallery from './ImageGallery'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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

function getAllImageUrls(media: any, defaultUrl: string): string[] {
  if (!media) return [defaultUrl];
  let items: any[] = [];
  
  if (Array.isArray(media)) items = media;
  else if (media.data && Array.isArray(media.data)) items = media.data;
  else if (media.data && !Array.isArray(media.data)) items = [media.data];
  else items = [media];

  const urls = items.map((item: any) => {
    let url = '';
    if (typeof item === 'string') url = item;
    else if (item.url) url = item.url;
    else if (item.attributes?.url) url = item.attributes.url;
    
    if (url) return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
    return null;
  }).filter(Boolean) as string[];

  return urls.length > 0 ? urls : [defaultUrl];
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

async function getSidebarData() {
  try {
    const resArtikels = await fetch(`${STRAPI_URL}/api/artikels?populate=*&sort=createdAt:desc&pagination[limit]=3`, { cache: 'no-store' });
    const jsonArtikels = await resArtikels.json();

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

// Metadata untuk halaman berita detail

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Kita manfaatkan fungsi getArticleDetail yang sudah kamu buat!
  const article = await getArticleDetail(resolvedParams.id);
  
  if (!article) {
    return { title: 'Berita Tidak Ditemukan' };
  }

  const data = article.attributes || article;
  const judul = data.Judul || "Berita SMP YAPI Al-Husaeni";
  const deskripsi = data.Konten ? data.Konten.substring(0, 150).replace(/[#*`_>]/g, '') + '...' : "Baca selengkapnya di portal resmi SMP YAPI Al-Husaeni.";
  
  // Ambil gambar pertama menggunakan fungsi yang sudah kamu buat
  const imgUrls = getAllImageUrls(data.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=1200');
  const coverUrl = imgUrls[0];

  return {
    title: judul,
    description: deskripsi,
    openGraph: {
      title: judul,
      description: deskripsi,
      url: `https://smpyapialhusaeni.sch.id/berita/${resolvedParams.id}`,
      siteName: 'Portal Berita SMP YAPI Al-Husaeni',
      images: [{ url: coverUrl, width: 1200, height: 630, alt: judul }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: judul,
      description: deskripsi,
      images: [coverUrl],
    },
  };
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
  const authorName = getAuthorName(data.Author);
  const kontenMarkdown = data.Konten || "";

  const imgUrls = getAllImageUrls(data.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=1200');

  return (
    <main className="w-full pb-20 pt-6 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col lg:flex-row gap-8 items-start">
        
        <FloatingShare judul={judul} />

        <div className="flex-1 w-full max-w-3xl">
          <Link href="/berita" className="lg:hidden inline-flex items-center gap-2 font-mono text-xs font-bold text-gray-500 hover:text-black mb-6 transition-colors">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span> KEMBALI
          </Link>

          <article className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 p-6 md:p-10 mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {kategori}
              </span>
              <span className="text-gray-400 text-xs font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span> {tanggal}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 font-medium text-xs font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">edit</span> Oleh: {authorName}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl text-black font-bold leading-tight mb-6">
              {judul}
            </h1>

            <ImageGallery images={imgUrls} alt={judul} />

            {/* RENDER MARKDOWN DI SINI */}
            <div className="prose prose-cyan font-body text-base md:text-lg text-gray-800 leading-relaxed text-justify max-w-none [&_p]:mb-6 [&_p:last-child]:mb-0 [&_a]:text-cyan-600 [&_a]:underline [&_u]:underline border-b border-gray-100 pb-8 mb-6 mt-8 overflow-hidden">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {kontenMarkdown}
              </ReactMarkdown>
            </div>

            <LikeSection 
              articleDocId={article.documentId || article.id} 
              initialLikes={data.Likes || 0} 
              initialDislikes={data.Dislikes || 0} 
            />
          </article>

          <CommentSection beritaId={String(article.id)} />
        </div>

        <aside className="w-full lg:w-[320px] xl:w-95 shrink-0 flex flex-col gap-8 lg:sticky lg:top-28">
          
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