/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { strapi } from '@/lib/strapi';
import Link from 'next/link';
import CommentSection from './CommentSection';
import VoteSection from './VoteSection';
import ShareButtons from './ShareButtons';
import ImageGallery from './ImageGallery'; 
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getAllMediaInfo(media: any) {
  if (!media) return [];
  let items: any[] = [];
  
  if (Array.isArray(media)) items = media;
  else if (media.data && Array.isArray(media.data)) items = media.data;
  else if (media.data && !Array.isArray(media.data)) items = [media.data];
  else if (typeof media === 'object' && media.url) items = [media];
  else if (typeof media === 'string') items = [media];

  return items.map((item: any) => {
    let url = '';
    let mime = '';
    if (typeof item === 'string') url = item.startsWith('http') ? item : `${STRAPI_URL}${item}`;
    else if (item.url) {
      url = item.url.startsWith('http') ? item.url : `${STRAPI_URL}${item.url}`;
      mime = item.mime || '';
    } else if (item.attributes?.url) {
      url = item.attributes.url.startsWith('http') ? item.attributes.url : `${STRAPI_URL}${item.attributes.url}`;
      mime = item.attributes.mime || '';
    }
    const isVideo = mime.startsWith('video/') || url.match(/\.(mp4|webm|ogg)$/i) !== null;
    return { url, isVideo };
  }).filter(m => m.url !== '');
}

function getThumbnailUrl(media: any) {
  const items = getAllMediaInfo(media);
  if (items.length > 0 && !items[0].isVideo) return items[0].url;
  return "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400";
}

async function getRekomendasi(kategori: string, excludeId: string) {
  try {
    const res = await strapi.get(`/madings?filters[Kategori][$eq]=${kategori}&filters[documentId][$ne]=${excludeId}&pagination[limit]=3&populate=Gambar&sort=createdAt:desc`);
    return res.data?.data || [];
  } catch (error) {
    return [];
  }
}

export default async function MadingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const madingId = resolvedParams.id;

  let data: any = null;

  try {
    const isNumeric = /^\d+$/.test(madingId);
    const filterKey = isNumeric ? 'id' : 'documentId';
    const res = await strapi.get(`/madings?filters[${filterKey}][$eq]=${madingId}&populate=*`);
    const fetchedItem = res.data?.data?.[0];
    if (fetchedItem) {
      data = fetchedItem.attributes || fetchedItem;
      data.id = fetchedItem.id; 
      data.documentId = fetchedItem.documentId || fetchedItem.id;
    }
  } catch (error) {
    console.error("Gagal mengambil detail mading:", error);
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fb]">
        <h2 className="text-2xl font-bold mb-4">Karya Tidak Ditemukan</h2>
        <Link href="/mading" className="px-6 py-2 bg-black text-white rounded-full font-mono text-sm">
          Kembali ke Mading
        </Link>
      </div>
    );
  }

  const judul = data.Judul || "Tanpa Judul";
  const kategori = data.Kategori || "KARYA";
  const kontenMarkdown = data.Konten || ""; // Ambil raw markdown string
  const penulis = data.Penulis || "Siswa YAPI";
  const kelas = data.Kelas || "";
  const mediaItems = getAllMediaInfo(data.Gambar);
  const tanggalRaw = data.Tanggal || data.createdAt;
  const tanggalFormat = tanggalRaw ? new Date(tanggalRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "";

  const rekomendasi = await getRekomendasi(kategori, data.documentId);
  const isPuisi = kategori.toLowerCase() === 'puisi';

  const imageUrls = mediaItems.filter(m => !m.isVideo).map(m => m.url);
  const videoItems = mediaItems.filter(m => m.isVideo);

  // Styling wrapper tetap kita pertahankan agar desainnya tetap konsisten
  const containerStyle = isPuisi 
    ? "font-serif text-center italic text-xl text-gray-800 bg-gradient-to-b from-amber-50/40 to-orange-50/20 border-y border-amber-200/70 p-8 md:p-12 rounded-3xl max-w-xl mx-auto [&>p]:mb-4 [&>p]:leading-loose shadow-inner overflow-hidden"
    : "prose prose-cyan font-body text-base md:text-lg text-gray-800 leading-relaxed text-justify max-w-none [&_p]:mb-6 [&_p:last-child]:mb-0 [&_a]:text-cyan-600 [&_a]:underline [&_u]:underline overflow-hidden";

  return (
    <main className="w-full pb-20 pt-8 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <Link href="/mading" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-mono text-xs font-bold mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          KEMBALI KE MADING
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28">
              <ShareButtons title={judul} />
            </div>
          </div>

          <div className="lg:col-span-8">
            <article className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-cyan-100 text-cyan-800 font-mono text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                  {kategori}
                </span>
                <span className="font-mono text-xs text-gray-500">{tanggalFormat}</span>
              </div>
              
              <h1 className="font-display text-3xl md:text-5xl font-bold text-black mb-10 leading-tight">
                {judul}
              </h1>

              <div className="block lg:hidden mb-10 pb-10 border-b border-gray-100">
                <p className="font-mono text-[10px] text-gray-400 font-bold tracking-widest uppercase mb-4">Bagikan Karya</p>
                <ShareButtons title={judul} />
              </div>

              {videoItems.length > 0 && (
                <div className="mb-10 flex flex-col gap-6">
                  {videoItems.map((mediaInfo, idx) => (
                    <div key={idx} className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex justify-center items-center shadow-sm p-2">
                      <video controls className="w-full max-h-175 rounded-xl bg-black" preload="metadata">
                        <source src={mediaInfo.url} />
                      </video>
                    </div>
                  ))}
                </div>
              )}

              {imageUrls.length > 0 && (
                <div className="mb-10">
                  <ImageGallery images={imageUrls} alt={judul} />
                </div>
              )}

              {/* RENDER MARKDOWN DI SINI */}
              <div className={containerStyle}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {kontenMarkdown}
                </ReactMarkdown>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <VoteSection 
                  madingId={data.documentId || data.id || madingId} 
                  initialLikes={data.Likes || 0} 
                  initialDislikes={data.Dislikes || 0} 
                />
              </div>
            </article>

            <CommentSection madingId={String(data.id)} />
          </div>

          <div className="lg:col-span-3">
            <div className="sticky top-28 flex flex-col gap-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-linear-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
                  {penulis.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-display text-lg font-bold text-black mb-1">{penulis}</h3>
                <p className="font-mono text-[11px] text-gray-500 uppercase tracking-widest mb-4">
                  {kelas ? `Kreator Kelas ${kelas}` : 'Kreator Independen'}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-black text-white font-mono text-[10px] px-3 py-1.5 rounded-full">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Karya Tervalidasi
                </div>
              </div>

              {rekomendasi.length > 0 && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h4 className="font-mono text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-5 border-b border-gray-100 pb-3">
                    Karya {kategori} Lainnya
                  </h4>
                  <div className="flex flex-col gap-4">
                    {rekomendasi.map((rek: any) => {
                      const rekData = rek.attributes || rek;
                      const thumb = getThumbnailUrl(rekData.Gambar);
                      return (
                        <Link href={`/mading/${rek.documentId || rek.id}`} key={rek.id} className="group flex gap-3 items-center">
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                            <img src={thumb} alt={rekData.Judul} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <div>
                            <h5 className="font-display text-sm font-bold text-black line-clamp-2 group-hover:text-cyan-600 transition-colors leading-snug">
                              {rekData.Judul}
                            </h5>
                            <span className="font-mono text-[9px] text-gray-500 uppercase">{rekData.Penulis}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}