/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { strapi } from '@/lib/strapi';
import ScrollReveal from '@/components/ScrollReveal'; // <-- IMPORT ANIMASI KITA

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function getStaffData() {
  try {
    // Memanggil 2 tabel sekaligus (Guru dan Tata Usaha)
    const [guruRes, tuRes] = await Promise.all([
      strapi.get('/gurus?populate=*&sort=Nama:asc'),
      strapi.get('/tata-usahas?populate=*&sort=Nama:asc') 
    ]);

    return {
      gurus: guruRes.data?.data || [],
      tataUsahas: tuRes.data?.data || [],
    };
  } catch (error) {
    console.error("Gagal menarik data staf dari Strapi:", error);
    return { gurus: [], tataUsahas: [] };
  }
}

function getImageUrl(media: any, fallbackStr: string): string {
  if (!media) return fallbackStr;
  let url = media;
  if (media.url) url = media.url;
  else if (media.attributes?.url) url = media.attributes.url;
  
  if (typeof url === 'string') {
    return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
  }
  return fallbackStr;
}

export default async function StafPage() {
  const { gurus, tataUsahas } = await getStaffData();

  // Komponen Reusable untuk Kartu Orang
  const PersonCard = ({ data, roleLabel, isTu = false, index }: { data: any, roleLabel: string, isTu?: boolean, index: number }) => {
    const item = data.attributes || data;
    const fallbackImage = index % 2 === 0 
      ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" 
      : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400";
    
    const fotoUrl = getImageUrl(item.Foto, fallbackImage);
    const jabatanAtauMapel = isTu ? item.Jabatan : item.Mata_Pelajaran;

    // Menghitung delay berdasarkan index agar munculnya bergiliran (staggered)
    const staggerDelay = 0.1 * (index % 4 + 1);

    return (
      <ScrollReveal delay={staggerDelay} direction="up" className="h-full">
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 h-full flex flex-col">
          <div className="aspect-3/4 w-full relative overflow-hidden bg-gray-100">
            <img 
              src={fotoUrl} 
              alt={item.Nama} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          </div>
          <div className="p-6 bg-white relative z-10 border-t border-gray-50 flex-1 flex flex-col">
            <h3 className="font-display text-lg font-bold text-black mb-1 line-clamp-1">{item.Nama}</h3>
            <p className="font-mono text-[11px] tracking-wider uppercase text-cyan-600 font-bold mt-auto">{jabatanAtauMapel || roleLabel}</p>
          </div>
        </div>
      </ScrollReveal>
    );
  };

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* HEADER */}
        <ScrollReveal delay={0.1} direction="up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs text-cyan-600 tracking-widest uppercase font-bold bg-cyan-50 px-3 py-1 rounded-full">
              Direktori Staf
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-black mt-4 mb-4">
              Tim Pendidik & Administrasi
            </h1>
            <p className="font-body text-gray-600 text-lg">
              Mengenal lebih dekat para pahlawan tanpa tanda jasa yang berdedikasi penuh untuk kemajuan siswa dan sekolah.
            </p>
          </div>
        </ScrollReveal>

        {/* SECTION 1: GURU */}
        <div className="mb-20">
          <ScrollReveal delay={0.2} direction="left">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
              <span className="material-symbols-outlined text-3xl text-black">school</span>
              <h2 className="font-display text-3xl font-bold text-black">Dewan Guru</h2>
            </div>
          </ScrollReveal>
          
          {gurus.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {gurus.map((guru: any, i: number) => (
                <PersonCard key={guru.id} data={guru} roleLabel="Guru" index={i} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 font-body text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">Belum ada data guru di database.</p>
          )}
        </div>

        {/* SECTION 2: TATA USAHA */}
        <div>
          <ScrollReveal delay={0.2} direction="left">
            <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
              <span className="material-symbols-outlined text-3xl text-black">support_agent</span>
              <h2 className="font-display text-3xl font-bold text-black">Tata Usaha & Administrasi</h2>
            </div>
          </ScrollReveal>

          {tataUsahas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {tataUsahas.map((tu: any, i: number) => (
                <PersonCard key={tu.id} data={tu} roleLabel="Staf Administrasi" isTu={true} index={i} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 font-body text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">Belum ada data Tata Usaha di database.</p>
          )}
        </div>

      </div>
    </main>
  );
}