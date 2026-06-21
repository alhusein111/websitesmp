import { strapi } from '@/lib/strapi';
import MadingClient from './MadingClient';
import ScrollReveal from '@/components/ScrollReveal';

async function getMadingData() {
  try {
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
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-12">
        <ScrollReveal delay={0.1} direction="down">
          <div className="inline-block bg-cyan-100 text-cyan-800 font-mono text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase">
            CREATIVE PORTAL
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2} direction="up">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
            Mading Digital.
          </h1>
        </ScrollReveal>
        
        <ScrollReveal delay={0.3} direction="up">
          <p className="font-body text-lg text-gray-500 max-w-2xl mx-auto">
            Ruang ekspresi, karya, dan imajinasi siswa-siswi SMP YAPI AL-HUSAENI. 
          </p>
        </ScrollReveal>
      </section>

      {/* Panggil komponen interaktif untuk memegang Filter, Grid, dan Load More */}
      <MadingClient madings={madings} />

    </main>
  );
}