import { strapi } from '@/lib/strapi';

// Konfigurasi URL dasar Strapi
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Fungsi Fetching Data Mading dari Strapi
async function getMadingData() {
  try {
    // Menarik semua data mading, diurutkan dari yang terbaru
    const res = await strapi.get('/madings?populate=*&sort=id:desc');
    return res.data?.data || [];
  } catch (error) {
    console.error("Gagal menarik data mading dari Strapi:", error);
    return [];
  }
}

// Fungsi pembantu untuk mengubah Strapi Blocks (Rich Text JSON) menjadi Teks Biasa
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

// Fungsi pembantu pintar agar gambar dari Strapi/External dijamin muncul
function getImageUrl(media: any, defaultUrl: string): string {
  if (!media) return defaultUrl;
  if (typeof media === 'string') {
    if (media.startsWith('http')) return media;
    return `${STRAPI_URL}${media}`;
  }
  if (media.url) {
    if (media.url.startsWith('http')) return media.url;
    return `${STRAPI_URL}${media.url}`;
  }
  // Support format Strapi v5 flat (media.data.attributes.url)
  if (media.data?.attributes?.url) {
    return `${STRAPI_URL}${media.data.attributes.url}`;
  }
  return defaultUrl;
}

export default async function MadingPage() {
  const madings = await getMadingData();

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-12 animate-fadeIn">
        <div className="inline-block bg-cyan-100 text-cyan-800 font-mono text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
          CREATIVE PORTAL
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
          Mading Digital.
        </h1>
        <p className="font-body text-lg text-gray-500 max-w-2xl mx-auto">
          Ruang ekspresi, karya, dan imajinasi siswa-siswi SMP YAPI AL-HUSAENI. 
        </p>
      </section>

      {/* 2. CATEGORY FILTERS (Tampilan Statis) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-12 flex flex-wrap justify-center gap-3">
        <button className="bg-black text-white font-mono text-xs font-bold px-6 py-2.5 rounded-full shadow-sm hover:scale-105 transition-transform">All</button>
        <button className="bg-white text-gray-700 border border-gray-200 font-mono text-xs font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform">Artikel</button>
        <button className="bg-white text-gray-700 border border-gray-200 font-mono text-xs font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform">Puisi</button>
        <button className="bg-white text-gray-700 border border-gray-200 font-mono text-xs font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform">Cerpen</button>
        <button className="bg-white text-gray-700 border border-gray-200 font-mono text-xs font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 hover:scale-105 transition-transform">Komik</button>
      </section>

      {/* 3. MASONRY GRID (Tampilan Pinterest) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          
          {madings.length > 0 ? (
            madings.map((item: any, index: number) => {
              // Menyesuaikan dengan struktur Strapi Mas Brow
              // Menggunakan item.attributes?.NamaField untuk Strapi v4 atau item.NamaField untuk Strapi v5
              const data = item.attributes || item; 

              const judul = data.Judul || "Tanpa Judul";
              const konten = extractText(data.Konten) || "Deskripsi karya...";
              const kategori = data.Kategori || "KARYA";
              const penulis = data.Penulis || "Siswa YAPI";
              const kelas = data.Kelas || "";
              const gambar = getImageUrl(data.Gambar, "");
              
              // Format Tanggal menjadi format Indonesia (Contoh: 20 Juni 2026)
              // Jika field Tanggal kosong, fallback ke tanggal dibuatnya post tersebut (createdAt)
              const tanggalRaw = data.Tanggal || data.createdAt;
              const tanggalFormat = tanggalRaw 
                ? new Date(tanggalRaw).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                : "";
              
              // Variasi background berdasarkan index agar layout terlihat dinamis dan estetik
              const isDark = index % 4 === 3; // Setiap kartu ke-4 warnanya hitam
              const isGlass = index % 4 === 0; // Setiap kartu ke-1 bergaya glassmorphism

              return (
                <div key={item.id} className={`break-inside-avoid rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl border ${isDark ? 'bg-black text-white border-black' : isGlass ? 'bg-white/60 backdrop-blur-xl border-white shadow-[0_8px_32px_rgba(0,0,0,0.04)]' : 'bg-white border-gray-100 text-black'}`}>
                  {gambar && (
                    <img src={gambar} alt={judul} className="w-full object-cover max-h-80" />
                  )}
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full ${isDark ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {kategori}
                      </span>
                      {tanggalFormat && (
                        <span className={`font-mono text-[10px] tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {tanggalFormat}
                        </span>
                      )}
                    </div>
                    <h3 className={`font-display text-2xl font-bold mb-3 leading-snug ${isDark ? 'text-white' : 'text-black'}`}>
                      {judul}
                    </h3>
                    <p className={`font-body text-sm mb-6 line-clamp-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {konten}
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-200/20">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                        {penulis.charAt(0).toUpperCase()}
                      </div>
                      <span className={`font-mono text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                        {penulis} {kelas ? `(${kelas})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* --- FALLBACK DATA DARI REFERENSI STITCH JIKA STRAPI KOSONG --- */
            <>
              {/* Card 1: Artwork (Glass) */}
              <div className="break-inside-avoid bg-white/60 backdrop-blur-xl border border-white shadow-sm rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
                <img className="w-full h-64 object-cover" alt="Artwork" src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800"/>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="inline-block font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-cyan-100 text-cyan-800">ARTWORK</span>
                    <span className="font-mono text-[10px] tracking-wide text-gray-500">20 Juni 2026</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-black mb-3 leading-snug">Mimpi Di Atas Kanvas</h3>
                  <p className="text-gray-600 font-body text-sm mb-6 leading-relaxed">Eksplorasi warna dan bentuk yang terinspirasi dari semangat belajar tanpa batas.</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-200/50">
                    <div className="w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center text-white font-bold text-xs">AA</div>
                    <span className="font-mono text-xs font-bold text-black">Alya (Kelas 9A)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Poetry (Solid) */}
              <div className="break-inside-avoid bg-white border border-gray-100 shadow-sm rounded-3xl p-8 hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                    <span className="inline-block font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-amber-100 text-amber-800">PUISI</span>
                    <span className="font-mono text-[10px] tracking-wide text-gray-500">18 Juni 2026</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-black mb-4 italic">"Jejak Waktu di Perpustakaan"</h3>
                <div className="text-gray-600 font-body text-sm mb-8 italic border-l-2 border-amber-400 pl-4 py-2 leading-relaxed whitespace-pre-wrap">
                  Debu menari di sela cahaya,<br/>
                  Halaman usang berbisik cerita,<br/>
                  Aku menemukan duniaku,<br/>
                  Di sudut ruang yang hening ini...
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-xs">BR</div>
                  <span className="font-mono text-xs font-bold text-black">Bima R. (Kelas 8B)</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 4. LOAD MORE BUTTON */}
      <div className="mt-16 text-center">
        <button className="border-2 border-gray-300 text-black font-mono text-xs font-bold px-8 py-4 rounded-full hover:border-black hover:bg-gray-100 transition-all duration-300">
          MUAT LEBIH BANYAK
        </button>
      </div>

    </main>
  );
}