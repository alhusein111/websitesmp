import { strapi } from '@/lib/strapi';
import Link from 'next/link';
import CommentSection from './CommentSection';
import VoteSection from './VoteSection';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// FITUR BARU: Deteksi Gambar vs Video (Support Strapi v4 & v5)
function getMediaInfo(media: any) {
  if (!media) return { url: '', isVideo: false };
  
  let url = '';
  let mime = '';

  // Jika URL berupa string langsung
  if (typeof media === 'string') {
    url = media.startsWith('http') ? media : `${STRAPI_URL}${media}`;
  } 
  // Jika format Strapi v5 (langsung media.url)
  else if (media.url) {
    url = media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
    mime = media.mime || '';
  } 
  // Jika format Strapi v4 (nested attributes)
  else if (media.data?.attributes?.url) {
    const attr = media.data.attributes;
    url = attr.url.startsWith('http') ? attr.url : `${STRAPI_URL}${attr.url}`;
    mime = attr.mime || '';
  }

  // Cek apakah file ini adalah video berdasarkan tipe file (mime) atau akhiran nama file
  const isVideo = mime.startsWith('video/') || url.match(/\.(mp4|webm|ogg)$/i) !== null;

  return { url, isVideo };
}

function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map(block => {
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || "").join('');
      }
      return "";
    }).join('\n\n');
  }
  return "";
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MadingDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const madingId = resolvedParams.id;

  let data = null;

  try {
    // Deteksi apakah madingId murni angka atau huruf acak (documentId)
    const isNumeric = /^\d+$/.test(madingId);
    const filterKey = isNumeric ? 'id' : 'documentId';

    // Panggil Strapi dengan filter yang tepat
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
  const konten = extractText(data.Konten);
  const kategori = data.Kategori || "KARYA";
  const penulis = data.Penulis || "Siswa YAPI";
  const kelas = data.Kelas || "";
  
  // Ambil info media pintar
  const mediaInfo = getMediaInfo(data.Gambar);
  
  const tanggalRaw = data.Tanggal || data.createdAt;
  const tanggalFormat = tanggalRaw 
    ? new Date(tanggalRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : "";

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        
        <Link href="/mading" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-mono text-xs font-bold mb-8 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          KEMBALI KE MADING
        </Link>

        <article className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-cyan-100 text-cyan-800 font-mono text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
              {kategori}
            </span>
            <span className="font-mono text-xs text-gray-500">{tanggalFormat}</span>
          </div>
          
          <h1 className="font-display text-3xl md:text-5xl font-bold text-black mb-8 leading-tight">
            {judul}
          </h1>

          <div className="flex items-center gap-3 pb-8 border-b border-gray-100 mb-8">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
              {penulis.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-black">{penulis}</div>
              <div className="font-mono text-[10px] text-gray-500">{kelas ? `Kelas ${kelas}` : 'Kreator'}</div>
            </div>
          </div>

          {/* RENDER MEDIA PINTAR DI SINI */}
          {mediaInfo.url && (
            <div className="mb-10 rounded-2xl overflow-hidden bg-gray-100 flex justify-center items-center">
              {mediaInfo.isVideo ? (
                <video 
                  controls 
                  className="w-full max-h-[700px] object-contain bg-black"
                  preload="metadata"
                >
                  <source src={mediaInfo.url} />
                  Browser Anda tidak mendukung pemutar video.
                </video>
              ) : (
                <img 
                  src={mediaInfo.url} 
                  alt={judul} 
                  className="w-full h-auto max-h-[800px] object-contain" 
                />
              )}
            </div>
          )}

          <div className="font-body text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
            {konten}
          </div>

          <div className="mt-10">
            <VoteSection 
              madingId={data.documentId || data.id || madingId} 
              initialLikes={data.Likes || 0} 
              initialDislikes={data.Dislikes || 0} 
            />
          </div>
        </article>

        <CommentSection madingId={String(data.id)} />

      </div>
    </main>
  );
}