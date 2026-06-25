/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { strapi } from '@/lib/strapi';
import ScrollReveal from '@/components/ScrollReveal';

// Fungsi Fetching Data langsung ke Strapi CMS
async function getLandingPageData() {
  try {
    const hariIni = new Date().toISOString().split('T')[0];

    // Tarik data Homepage (Single Type), Berita, Mading, dan Kegiatan sekaligus
    const [homepageRes, artikelRes, madingRes, kegiatanRes] = await Promise.all([
      strapi.get('/homepage?populate=*'),
      strapi.get('/artikels?populate=*&pagination[limit]=3&sort=id:desc'),
      strapi.get('/madings?populate=*&pagination[limit]=3&sort=id:desc'),
      strapi.get(`/events?filters[TampilkanDiSidebar][$eq]=true&filters[$or][0][TanggalSelesai][$gte]=${hariIni}&filters[$or][1][TanggalMulai][$gte]=${hariIni}&sort=TanggalMulai:asc&pagination[limit]=4`)
    ]);

    return {
      homepage: homepageRes.data?.data || null,
      artikels: artikelRes.data?.data || [],
      madings: madingRes.data?.data || [],
      kegiatan: kegiatanRes.data?.data || [],
    };
  } catch (error) {
    console.error("Gagal menarik data dari Strapi:", error);
    return { homepage: null, artikels: [], madings: [], kegiatan: [] };
  }
}

export default async function Home() {
  const { homepage, artikels, madings, kegiatan } = await getLandingPageData();

  // Definisikan nilai default jika data CMS masih kosong/gagal fetch
  const teksHero = homepage?.Teks_Hero || "Selamat Datang di SMP YAPI AL-HUSAENI";
  const sambutanKepsek = homepage?.Sambutan_Kepsek || "Selamat datang di portal resmi sekolah kami.";
  const videoUrl = homepage?.Video_URL || "#";

  // Penanganan URL Foto Kepala Sekolah yang aman (Support format Strapi v4 maupun v5 flat)
  let fotoKepsekUrl = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600";
  if (homepage?.Foto_Kepsek?.url) {
    fotoKepsekUrl = `http://localhost:1337${homepage.Foto_Kepsek.url}`;
  } else if (homepage?.Foto_Kepsek?.data?.attributes?.url) {
    fotoKepsekUrl = `http://localhost:1337${homepage.Foto_Kepsek.data.attributes.url}`;
  }

  return (
    <div className="overflow-hidden"> {/* Tambahan overflow-hidden agar animasi dari samping tidak merusak layout */}
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-[70vh] min-h-125 flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/50 z-10 mix-blend-multiply"></div>
          {/* Gambar Latar Belakang Sekolah */}
          <img 
            alt="School Campus" 
            className="w-full h-full object-cover opacity-80"
            src="/masjid.jpg" 
          />
        </div>
        
        <div className="relative z-20 text-center max-w-4xl px-6">
          <ScrollReveal delay={0.1} direction="down">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-mono text-xs mb-6 border border-white/20">
              Tahun Ajaran 2026/2027
            </span>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3} direction="up">
            <h1 className="font-display text-3xl md:text-5xl text-white font-bold mb-6 drop-shadow-lg leading-tight">
              {teksHero}
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={0.5} direction="up">
            <p className="font-body text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
              Membentuk karakter, menginspirasi kreativitas, dan membangun fondasi prestasi untuk masa depan generasi penerus bangsa dalam lingkungan belajar yang islami dan modern.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.7} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/spmb" className="w-full sm:w-auto bg-secondary text-white px-8 py-4 rounded-xl font-mono text-xs font-semibold hover:bg-secondary-container hover:text-black transition-all shadow-lg hover:-translate-y-1">
                Jelajahi Program
              </Link>
              <a href={videoUrl} target="_blank" className="w-full sm:w-auto bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-mono text-xs font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">play_circle</span>
                Video Profil
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. STATISTIC COUNTER PANEL */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <ScrollReveal delay={0.1} direction="up">
              <div className="flex flex-col items-center text-center p-6 bg-[#f7f9fb] rounded-2xl ambient-shadow border border-gray-100 hover-lift-glow">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">groups</span>
                </div>
                <div className="font-display text-2xl font-bold text-black mb-1">600+</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Siswa Aktif</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up">
              <div className="flex flex-col items-center text-center p-6 bg-[#f7f9fb] rounded-2xl ambient-shadow border border-gray-100 hover-lift-glow">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div className="font-display text-2xl font-bold text-black mb-1">35+</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Guru & Staf</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} direction="up">
              <div className="flex flex-col items-center text-center p-6 bg-[#f7f9fb] rounded-2xl ambient-shadow border border-gray-100 hover-lift-glow">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">sports_soccer</span>
                </div>
                <div className="font-display text-2xl font-bold text-black mb-1">5+</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Ekstrakurikuler</div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4} direction="up">
              <div className="flex flex-col items-center text-center p-6 bg-[#f7f9fb] rounded-2xl ambient-shadow border border-gray-100 hover-lift-glow">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-900 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined">emoji_events</span>
                </div>
                <div className="font-display text-2xl font-bold text-black mb-1">50+</div>
                <div className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Prestasi</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID QUICK NAVIGATION */}
      <section className="py-20 bg-[#f7f9fb]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <ScrollReveal delay={0.1} direction="up">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-black mb-3">Eksplorasi Kampus Kami</h2>
              <p className="font-body text-gray-500 text-sm">Akses cepat ke informasi terkini dan layanan utama sekolah.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Berita */}
            <ScrollReveal delay={0.2} direction="left">
              <Link href="/berita" className="group relative overflow-hidden rounded-3xl bg-white aspect-4/5 ambient-shadow border border-gray-100 block">
                <div className="absolute inset-0">
                  <img alt="News" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600" />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 p-8 flex flex-col justify-end h-full w-full">
                  <div className="mb-4 bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="material-symbols-outlined text-white">newspaper</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Berita Terbaru</h3>
                  <p className="font-body text-xs text-gray-300 transition-opacity duration-300">Ikuti perkembangan dan kegiatan terbaru dari civitas akademika kami.</p>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 2: SPMB Highlight */}
            <ScrollReveal delay={0.4} direction="up">
              <Link href="/spmb" className="group relative overflow-hidden rounded-3xl bg-black aspect-4/5 ambient-shadow border border-black block">
                <div className="absolute inset-0">
                  <img 
                    alt="Registration" 
                    className="w-full h-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110" 
                    src="/bg-spmb.png" 
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 p-8 flex flex-col justify-end h-full w-full">
                  <div className="inline-flex items-center gap-2 bg-secondary text-white px-3 py-1 rounded-full font-mono text-[9px] font-bold w-max mb-auto mt-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    PENDAFTARAN BUKA
                  </div>
                  <div className="mb-4 bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="material-symbols-outlined text-white">assignment</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">SPMB 2026</h3>
                  <p className="font-body text-xs text-gray-300 mb-4">Bergabunglah menjadi bagian dari keluarga besar SMP YAPI AL-HUSAENI. Kuota terbatas.</p>
                  <span className="text-amber-300 font-mono text-xs font-semibold flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                    <span>Daftar Sekarang</span>
                    <span className="material-symbols-outlined text-xs leading-none">arrow_forward</span>
                  </span>
                </div>
              </Link>
            </ScrollReveal>

            {/* Card 3: Mading Digital */}
            <ScrollReveal delay={0.6} direction="right">
              <Link href="/mading" className="group relative overflow-hidden rounded-3xl bg-white aspect-4/5 ambient-shadow border border-gray-100 block">
                <div className="absolute inset-0">
                  <img alt="Digital Board" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600" />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 p-8 flex flex-col justify-end h-full w-full">
                  <div className="mb-4 bg-white/20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
                    <span className="material-symbols-outlined text-white">dashboard</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">Mading Digital</h3>
                  <p className="font-body text-xs text-gray-300 transition-opacity duration-300">Ruang kreasi dan ekspresi karya tulis serta seni siswa siswi kami.</p>
                </div>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. KEGIATAN MENDATANG */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <ScrollReveal delay={0.1} direction="left">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-cyan-600 bg-cyan-50 p-2 rounded-full">event_note</span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-black">Agenda & Kegiatan</h2>
                </div>
                <p className="font-body text-gray-500 text-sm max-w-xl">
                  Jangan lewatkan berbagai kegiatan penting, seminar, dan acara ekstrakurikuler yang akan datang di sekolah kami.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} direction="right">
              <Link href="/kalender" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-black rounded-full font-mono text-xs font-bold hover:bg-black hover:text-white transition-colors border border-gray-200">
                Lihat Kalender Penuh
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kegiatan.length > 0 ? (
              kegiatan.map((item: any, index: number) => {
                const data = item.attributes || item;
                const dateObj = new Date(data.TanggalMulai);
                const tgl = dateObj.getDate();
                const bln = dateObj.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
                const startDateFull = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                const endDateFull = data.TanggalSelesai ? new Date(data.TanggalSelesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
                const rentangTanggal = endDateFull && startDateFull !== endDateFull ? `${startDateFull} - ${endDateFull}` : startDateFull;

                return (
                  <ScrollReveal key={item.id} delay={0.1 * (index + 1)} direction="up">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 ambient-shadow hover:border-cyan-500 hover:shadow-lg transition-all group h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                        <div className="flex flex-col items-center justify-center bg-cyan-50 text-cyan-700 rounded-xl w-14 h-14 shrink-0 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                          <span className="font-mono text-[10px] font-bold uppercase">{bln}</span>
                          <span className="font-display text-xl font-bold leading-none">{tgl}</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">calendar_month</span> 
                            {rentangTanggal}
                          </p>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-black text-lg leading-tight mb-2 group-hover:text-cyan-600 transition-colors">
                        {data.NamaKegiatan}
                      </h4>
                      <p className="font-body text-sm text-gray-500 line-clamp-3 mb-4 grow">
                        {data.DeskripsiSingkat}
                      </p>
                      
                      {data.Lokasi && (
                        <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-mono text-gray-500">
                          <span className="material-symbols-outlined text-[16px] text-gray-400">location_on</span>
                          <span className="truncate">{data.Lokasi}</span>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
                <p className="text-gray-500 font-body">Belum ada agenda terdekat.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. SAMBUTAN KEPALA SEKOLAH */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <ScrollReveal delay={0.2} direction="left">
                <div className="absolute inset-0 bg-gray-200 translate-x-4 translate-y-4 rounded-3xl z-0"></div>
                <img 
                  alt="Kepala Sekolah" 
                  className="relative z-10 w-full aspect-3/4 object-cover rounded-3xl shadow-xl filter grayscale hover:grayscale-0 transition-all duration-700"
                  src={fotoKepsekUrl} 
                />
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7 lg:pl-8">
              <ScrollReveal delay={0.4} direction="right">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-px bg-black"></div>
                  <span className="font-mono text-xs font-bold tracking-widest text-black">SAMBUTAN</span>
                </div>
                <h2 className="font-display text-2xl md:text-4xl text-black font-bold mb-6 leading-tight">
                  &quot;Membangun generasi cerdas berakhlak mulia untuk masa depan yang lebih baik.&quot;
                </h2>
                <div className="text-gray-600 font-body text-sm md:text-base space-y-4 leading-relaxed whitespace-pre-wrap">
                  <p>{sambutanKepsek}</p>
                </div>
                <div className="mt-8">
                  <h4 className="font-display text-lg font-bold text-black">Kasanudin, S.Pd</h4>
                  <p className="font-mono text-xs text-gray-500 mt-1">Kepala Sekolah SMP YAPI AL-HUSAENI</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}