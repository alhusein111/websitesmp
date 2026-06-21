import KalenderClient from './KalenderClient';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

async function getSemuaKegiatan() {
  try {
    // Tarik maksimal 100 data kegiatan terbaru
    const res = await fetch(`${STRAPI_URL}/api/events?sort=TanggalMulai:asc&pagination[limit]=100`, { cache: 'no-store' });
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Gagal menarik data kegiatan:", error);
    return [];
  }
}

export default async function KalenderPage() {
  const events = await getSemuaKegiatan();

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-black font-bold mb-4">Kalender Akademik</h1>
          <p className="font-body text-gray-600 max-w-2xl mx-auto">
            Jadwal lengkap kegiatan, ujian, dan acara penting sekolah.
          </p>
        </div>

        {/* Serahkan urusan tampilan dan interaksi ke Client Component */}
        <KalenderClient initialEvents={events} />
      </div>
    </main>
  );
}