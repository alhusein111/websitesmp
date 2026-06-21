/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { strapi } from '@/lib/strapi';
import ScrollReveal from '@/components/ScrollReveal'; // <-- IMPORT ANIMASI KITA

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Hanya Fetching Data Profil
async function getProfilData() {
  try {
    const profilRes = await strapi.get('/profil-sekolah?populate=*');
    return profilRes.data?.data || null;
  } catch (error) {
    console.error("Gagal menarik data profil dari Strapi:", error);
    return null;
  }
}

// Fungsi pembantu untuk mengubah Strapi Blocks menjadi Teks Biasa (Mendukung Bullet Points)
function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === 'string') return content;
  
  if (Array.isArray(content)) {
    return content.map((block: any) => {
      // Penanganan khusus untuk tipe "list" (Bullet points / Numbered list)
      if (block.type === 'list' && Array.isArray(block.children)) {
        return block.children.map((listItem: any) => {
          const itemText = listItem.children?.map((child: any) => child.text || "").join('') || "";
          return `• ${itemText}`; // Menambahkan simbol bullet point
        }).join('\n');
      }
      
      // Penanganan untuk paragraf biasa, heading, dll
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || "").join('');
      }
      
      return "";
    }).join('\n\n');
  }
  return "";
}

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
  const profil = await getProfilData();

  // Pastikan field sesuai dengan database: sejarah, Visi, Misi
  const sejarah = extractText(profil?.attributes?.Sejarah || profil?.Sejarah) || "Sejarah sekolah belum ditambahkan di database.";
  const visi = extractText(profil?.attributes?.Visi || profil?.Visi) || "Visi sekolah belum ditambahkan di database.";
  
  // Misi bisa saja berupa paragraf panjang atau list
  const rawMisi = extractText(profil?.attributes?.Misi || profil?.Misi);
  const misi = rawMisi ? rawMisi.split('\n').filter(item => item.trim() !== '') : ["Misi sekolah belum ditambahkan di database."];

  const heroImage = getImageUrl(profil?.attributes?.Hero_Gambar || profil?.Hero_Gambar, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop");

  return (
    <main className="w-full pb-12 bg-[#f7f9fb] min-h-screen overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-125 flex items-end pb-12 px-6 md:px-12 bg-gray-600">
        <img src={heroImage} alt="Hero Banner Profil" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <ScrollReveal delay={0.1} direction="up">
            <div className="text-white">
              <span className="font-mono text-2xl text-cyan-400 tracking-widest uppercase font-bold">Profil Sekolah</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mt-2 mb-4">
                Membangun Karakter,<br/>Menginspirasi Masa Depan.
              </h1>
              <p className="font-body text-lg text-gray-300 max-w-2xl leading-relaxed">
                Mengenal lebih dekat identitas, sejarah, dan tujuan mulia yang menjadi fondasi SMP YAPI AL-HUSAENI.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. BENTO GRID: SEJARAH & VISI MISI */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SEJARAH CARD (KIRI) */}
          <div className="lg:col-span-7">
            <ScrollReveal delay={0.2} direction="left" className="h-full">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-black text-3xl">history_edu</span>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-black">Sejarah Perjalanan</h2>
                </div>
                <div className="prose max-w-none font-body text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {sejarah}
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* VISI & MISI STACK (KANAN) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Visi */}
            <ScrollReveal delay={0.4} direction="right">
              <div className="bg-black text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-center h-full min-h-50">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-600/30 rounded-full blur-2xl"></div>
                <h3 className="font-mono text-xs text-yellow-500 tracking-wider uppercase font-bold mb-3">Visi Kami</h3>
                <p className="font-display text-xl leading-snug text-white font-bold">{visi}</p>
              </div>
            </ScrollReveal>

            {/* Misi */}
            <ScrollReveal delay={0.6} direction="right" className="flex-1">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl h-full">
                <h3 className="font-mono text-xs text-gray-500 tracking-wider uppercase font-bold mb-4">Misi Utama</h3>
                <ul className="space-y-4">
                  {misi.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-cyan-600 text-sm mt-1 shrink-0">check_circle</span>
                      <span className="font-body text-sm md:text-base text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

          </div>

        </div>
      </section>

    </main>
  );
}