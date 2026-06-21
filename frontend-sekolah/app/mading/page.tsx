import { strapi } from '@/lib/strapi';
import MadingClient from './MadingClient'; // Import komponen interaktif yang baru kita buat

async function getMadingData() {
  try {
    // Kita ambil banyak data sekaligus agar filternya instan (misal limit 100)
    const res = await strapi.get('/madings?populate=*&pagination[limit]=100&sort=createdAt:desc');
    return res.data?.data || [];
  } catch (error) {
    console.error("Gagal menarik data mading dari Strapi:", error);
    return [];
  }
}

export default async function MadingPage() {
  const madings = await getMadingData();

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen">
      
      {/* 1. HERO SECTION (Tetap di sini karena statis) */}
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

      {/* Panggil komponen interaktif untuk memegang Filter, Grid, dan Load More */}
      <MadingClient madings={madings} />

    </main>
  );
}