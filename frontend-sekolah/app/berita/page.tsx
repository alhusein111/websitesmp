import Link from 'next/link';

// Konfigurasi URL dasar Strapi
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Fungsi pembantu pintar untuk Gambar
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
  if (media.data?.attributes?.url) {
    return `${STRAPI_URL}${media.data.attributes.url}`;
  }
  return defaultUrl;
}

// Fungsi pembantu untuk mengubah Strapi Blocks (Rich Text) menjadi Teks Biasa
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

// Fungsi untuk menarik data dari Strapi
async function getArticles() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/artikels?populate=*`, {
      cache: 'no-store' // Agar Next.js selalu menarik data terbaru
    });
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Gagal menarik data artikel:", error);
    return [];
  }
}

export default async function NewsPage() {
  const articles = await getArticles();

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full space-y-12">
        
        {/* 1. HEADER TITLE */}
        <div className="text-center md:text-left space-y-4">
          <h1 className="font-display text-4xl md:text-5xl text-black font-bold tracking-tight">
            Berita & Kegiatan
          </h1>
          <p className="font-body text-lg text-gray-600 max-w-2xl">
            Ikuti terus pembaruan terkini, pengumuman, prestasi, dan berbagai kegiatan seru dari keluarga besar SMP YAPI AL-HUSAENI.
          </p>
        </div>

        {/* 2. HERO SECTION: BERITA TERBARU (HIGHLIGHT) */}
        {articles.length > 0 && (() => {
          // Akses data langsung tanpa .attributes
          const heroArticle = articles[0].attributes || articles[0]; // Support format lama & baru
          
          const heroJudul = heroArticle.Judul || "Tanpa Judul";
          const heroKonten = extractText(heroArticle.Konten);
          const heroTanggal = heroArticle.Tanggal || heroArticle.tanggal || "-";
          const heroImg = getImageUrl(heroArticle.Gambar_Cover, 'https://images.unsplash.com/photo-1511629091441-ee46146481b6?q=80&w=1200');

          return (
            <section className="relative rounded-3xl overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 h-[400px] md:h-[500px] border border-gray-100 block">
              <img 
                alt={heroJudul} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                src={heroImg} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              
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
            </section>
          );
        })()}

        {/* 3. LAYOUT: BERITA (KIRI) & UPCOMING EVENTS (KANAN) */}
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          
          {/* BAGIAN KIRI: DAFTAR BERITA */}
          <div className="w-full lg:w-2/3 flex flex-col gap-8">
            
            {/* Filter Kategori */}
            <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar border-b border-gray-200">
              <button className="px-5 py-2 font-mono text-xs font-bold rounded-full bg-black text-white whitespace-nowrap transition-colors">Semua Berita</button>
              <button className="px-5 py-2 font-mono text-xs font-bold rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors">Akademik</button>
              <button className="px-5 py-2 font-mono text-xs font-bold rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors">Prestasi</button>
              <button className="px-5 py-2 font-mono text-xs font-bold rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors">Kegiatan</button>
              <button className="px-5 py-2 font-mono text-xs font-bold rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 whitespace-nowrap transition-colors">Umum</button>
            </div>

            {/* Grid Berita (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {articles.length > 0 ? (
                // Kita skip index ke-0 karena sudah dipakai di Hero Section atas
                articles.slice(1).map((item: any) => {
                  // Bypass pembungkus .attributes jika Strapi v5
                  const data = item.attributes || item;
                  
                  const judul = data.Judul || "Tanpa Judul";
                  const slug = data.Slug || item.id;
                  const kategori = data.Kategori || "Umum";
                  const kontenText = extractText(data.Konten);
                  const tanggal = data.Tanggal || data.tanggal || "-";
                  const imgUrl = getImageUrl(data.Gambar_Cover, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800');

                  return (
                    <Link key={item.id} href={`/berita/${slug}`} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                      <div className="relative w-full h-48 overflow-hidden">
                        <img src={imgUrl} alt={judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-amber-100 text-amber-800 font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                            {kategori}
                          </span>
                          <span className="text-gray-500 text-xs font-mono flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] leading-none">calendar_today</span> 
                            {tanggal}
                          </span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-black leading-snug mb-3 group-hover:text-cyan-600 transition-colors">
                          {judul}
                        </h3>
                        <p className="font-body text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                          {kontenText}
                        </p>
                        <span className="text-black font-mono text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                          Baca Selengkapnya <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="col-span-full py-10 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                  <p className="text-gray-500 font-mono">Belum ada artikel yang diterbitkan.</p>
                </div>
              )}

            </div>

            {/* Tombol Load More disembunyikan jika artikel masih sedikit */}
            {articles.length > 5 && (
              <div className="text-center mt-4">
                <button className="bg-white border-2 border-gray-200 hover:border-black text-black font-mono text-xs font-bold px-8 py-3 rounded-xl transition-colors">
                  Muat Lebih Banyak Berita
                </button>
              </div>
            )}
          </div>

          {/* BAGIAN KANAN: SIDEBAR UPCOMING EVENTS (Masih Dummy) */}
          <aside className="w-full lg:w-1/3 flex flex-col gap-6 lg:sticky lg:top-28">
             <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h3 className="font-display text-xl font-bold text-black flex items-center gap-2">
                  <span className="material-symbols-outlined text-cyan-600 leading-none">event_note</span>
                  Kegiatan Mendatang
                </h3>
              </div>
              
              <ul className="flex flex-col gap-6">
                <li className="flex gap-4 items-start group">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl py-3 w-[64px] shrink-0 border border-gray-100 group-hover:border-cyan-500 group-hover:bg-cyan-50 transition-colors shadow-sm">
                    <span className="font-mono text-[10px] font-bold text-gray-500 uppercase">Jun</span>
                    <span className="font-display text-2xl font-bold text-black group-hover:text-cyan-700">05</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-black text-base leading-tight mb-1 group-hover:text-cyan-600 transition-colors">Ujian Akhir Semester</h4>
                    <p className="font-body text-sm text-gray-600 line-clamp-2">Pelaksanaan penilaian akhir tahun untuk seluruh siswa kelas VII dan VIII.</p>
                  </div>
                </li>
              </ul>
              
              <Link href="#" className="mt-8 flex items-center justify-center w-full py-3 bg-black text-white rounded-xl font-mono text-xs font-bold hover:bg-gray-800 transition-colors gap-2 group">
                <span className="material-symbols-outlined text-[18px] leading-none group-hover:scale-110 transition-transform">calendar_month</span>
                Lihat Kalender Penuh
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}