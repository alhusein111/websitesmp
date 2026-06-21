/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { strapi } from '@/lib/strapi';

// Konfigurasi URL dasar Strapi (Sesuaikan jika port Strapi mas brow berbeda)
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Fungsi Fetching Data Profil & Guru dari Strapi
async function getProfilData() {
  try {
    const [profilRes, guruRes] = await Promise.all([
      strapi.get('/profil-sekolah?populate=*'),
      strapi.get('/gurus?populate=*&sort=id:asc'),
    ]);

    return {
      profil: profilRes.data?.data || null,
      gurus: guruRes.data?.data || [],
    };
  } catch (error) {
    console.error("Gagal menarik data profil dari Strapi:", error);
    return { profil: null, gurus: [] };
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

// Fungsi pembantu pintar agar gambar dari Strapi/External dijamin muncul tanpa crash
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
  return defaultUrl;
}

export default async function ProfilPage() {
  const { profil, gurus } = await getProfilData();

  // Ekstrak data dari Strapi dengan fallback teks bawaan Stitch jika CMS masih kosong
  const sejarah = extractText(profil?.Sejarah) || 
    `Berdiri sejak puluhan tahun silam, SMP YAPI AL-HUSAENI bermula dari sebuah visi luhur para pendiri untuk menyediakan akses pendidikan berkualitas bagi masyarakat sekitar. Dimulai dari sebuah bangunan sederhana, semangat untuk terus belajar dan berinovasi telah mendorong sekolah ini tumbuh menjadi institusi yang disegani.\n\nPerjalanan panjang ini diwarnai dengan dedikasi tiada henti dari para tenaga pendidik, adaptasi terhadap kurikulum nasional yang dinamis, serta komitmen untuk tidak hanya mencetak siswa berprestasi akademis, tetapi juga berkarakter kuat dan berakhlak mulia. Kini, dengan fasilitas modern, kami terus melanjutkan tongkat estafet perjuangan tersebut.`;

  const visi = extractText(profil?.Visi) || 
    "Menjadi institusi pendidikan terdepan yang menghasilkan lulusan beriman, berakhlak mulia, cerdas, terampil, dan berwawasan global.";

  const misi = extractText(profil?.Misi) || [
    "Menyelenggarakan pembelajaran yang aktif, inovatif, kreatif, efektif, dan menyenangkan (PAIKEM).",
    "Menumbuhkembangkan karakter peserta didik melalui pembiasaan nilai-nilai agama dan budaya bangsa.",
    "Meningkatkan profesionalisme pendidik dan tenaga kependidikan secara berkelanjutan."
  ];

  // Mengambil gambar hero dari Strapi jika ada, jika tidak gunakan placeholder pemandangan sekolah yang indah
  const heroImage = getImageUrl(profil?.Hero_Gambar, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop");

  return (
    <main className="w-full pb-12 bg-[#f7f9fb]">
      
      {/* 1. HERO EDITORIAL SECTION */}
      <section className="relative w-full h-153.5 min-h-125 flex items-end pb-12 px-6 md:px-12 bg-surface-container-high overflow-hidden">
        <img 
          src={heroImage} 
          alt="Hero Banner Profil" 
          className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-multiply transition-all duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-6 text-white">
          <div className="md:col-span-8 flex flex-col gap-3">
            <span className="font-mono text-xs text-secondary-fixed tracking-widest uppercase font-semibold">
              Profil Sekolah
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white">
              Membangun Karakter,<br/>Menginspirasi Masa Depan.
            </h1>
            <p className="font-body text-lg text-white/80 max-w-2xl mt-4 leading-relaxed">
              SMP YAPI AL-HUSAENI hadir sebagai institusi pendidikan yang memadukan nilai-nilai luhur tradisional dengan pendekatan pembelajaran modern yang progresif.
            </p>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID: HISTORY & VISION/MISSION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-auto">
          
          {/* SEJARAH CARD (Large Left) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.05)] border border-gray-200/50 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-cyan-400 to-black transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-black text-3xl">history_edu</span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-black">Sejarah Perjalanan</h2>
            </div>
            <div className="space-y-4 font-body text-base text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              <p>{sejarah}</p>
            </div>
          </div>

          {/* VISION & MISSION STACK (Right) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Visi Card */}
            <div className="bg-black text-white rounded-2xl p-8 shadow-sm flex flex-col h-full justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-600/20 rounded-full blur-2xl transition-all group-hover:bg-yellow-600/40"></div>
              <div className="relative z-10">
                <h3 className="font-mono text-xs text-secondary-fixed tracking-wider uppercase font-bold mb-2">Visi Kami</h3>
                <p className="font-display text-xl md:text-2xl leading-snug text-white font-bold">
                  {visi}
                </p>
              </div>
            </div>

            {/* Misi Card */}
            <div className="bg-surface-container-low rounded-2xl p-8 border border-gray-200/50 shadow-sm flex flex-col h-full justify-center">
              <h3 className="font-mono text-xs text-on-surface-variant tracking-wider uppercase font-bold mb-4">Misi Utama</h3>
              <ul className="space-y-3 font-body text-sm md:text-base text-on-surface-variant">
                {Array.isArray(misi) ? (
                  misi.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-black text-sm mt-1">arrow_forward</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <div className="whitespace-pre-wrap">{extractText(profil?.Misi)}</div>
                )}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 3. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-2xl border border-gray-200/50 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.03)]">
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <span className="font-mono text-5xl md:text-6xl text-black font-bold mb-2">35+</span>
            <span className="font-body text-sm text-on-surface-variant font-medium">Tahun Berdiri</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 text-center md:border-l border-gray-100">
            <span className="font-mono text-5xl md:text-6xl text-black font-bold mb-2">98<span className="text-3xl">%</span></span>
            <span className="font-body text-sm text-on-surface-variant font-medium">Tingkat Kelulusan</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 text-center lg:border-l border-gray-100">
            <span className="font-mono text-5xl md:text-6xl text-black font-bold mb-2">45</span>
            <span className="font-body text-sm text-on-surface-variant font-medium">Tenaga Pendidik</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 text-center md:border-l border-gray-100">
            <span className="font-mono text-5xl md:text-6xl text-black font-bold mb-2">800+</span>
            <span className="font-body text-sm text-on-surface-variant font-medium">Siswa Aktif</span>
          </div>
        </div>
      </section>

      {/* 4. TEACHER / STAFF DIRECTORY SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-4">Tim Pendidik Kami</h2>
            <p className="font-body text-base md:text-lg text-on-surface-variant leading-relaxed">
              Di balik prestasi setiap siswa, terdapat dedikasi tanpa batas dari para guru dan staf kami. Mereka bukan sekadar pengajar, melainkan mentor dan teladan.
            </p>
          </div>
        </div>

        {/* Directory Grid (Asymmetric Layout via index mapping) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gurus.length > 0 ? (
            gurus.map((guru: any, index: number) => {
              // Deteksi foto dari Strapi, jika kosong berikan avatar placeholder berkelas dari Unsplash
              const fallbackAvatar = index % 2 === 0 
                ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" // Guru Perempuan
                : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400"; // Guru Laki-laki

              const fotoGuru = getImageUrl(guru.Foto, fallbackAvatar);
              
              // Efek asimetris (Staggered layout) dari Stitch: Beri margin top pada kartu ke-2 dan ke-4 dalam satu baris desktop
              const isStaggered = index % 4 === 1 || index % 4 === 3;

              return (
                <div 
                  key={guru.id} 
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 border border-gray-200/50 ${isStaggered ? 'mt-0 lg:mt-8' : ''}`}
                >
                  <div className="aspect-3/4 w-full relative overflow-hidden bg-surface-container-high">
                    <img 
                      src={fotoGuru} 
                      alt={guru.Nama || "Foto Guru"} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="p-6 bg-white relative z-10 border-t border-gray-100 group-hover:border-cyan-200 transition-colors">
                    <h3 className="font-display text-lg font-bold text-black mb-1 line-clamp-1">
                      {guru.Nama || "Nama Tenaga Pendidik"}
                    </h3>
                    <p className="font-mono text-[11px] tracking-wider uppercase text-on-surface-variant font-bold">
                      {guru.Mata_Pelajaran || "Staff Pengajar"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            // Tampilan Cadangan Elegan jika belum ada data sama sekali di database Strapi
            <>
              {[
                { nama: "Dra. Hj. Siti Aminah", mapel: "Kepala Sekolah", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" },
                { nama: "Drs. Ahmad Fauzi", mapel: "Wakasek Kurikulum", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400" },
                { nama: "Rizky Pratama, S.Pd", mapel: "Guru IPA Terpadu", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" },
                { nama: "Nadia Safira, S.S", mapel: "Guru Bahasa Inggris", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400" }
              ].map((fallbackGuru, index) => (
                <div 
                  key={index} 
                  className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 border border-gray-200/50 ${index % 4 === 1 || index % 4 === 3 ? 'mt-0 lg:mt-8' : ''}`}
                >
                  <div className="aspect-3/4 w-full relative overflow-hidden bg-surface-container-high">
                    <img 
                      src={fallbackGuru.img} 
                      alt={fallbackGuru.nama} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <div className="p-6 bg-white relative z-10 border-t border-gray-100 group-hover:border-cyan-200 transition-colors">
                    <h3 className="font-display text-lg font-bold text-black mb-1">{fallbackGuru.nama}</h3>
                    <p className="font-mono text-[11px] tracking-wider uppercase text-on-surface-variant font-bold">{fallbackGuru.mapel}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

    </main>
  );
}