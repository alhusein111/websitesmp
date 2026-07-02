 
import { strapi } from '@/lib/strapi';
import StaffDirectoryClient from './StaffDirectoryClient'; // Sesuaikan path ini jika beda folder

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

export default async function StafPage() {
  const { gurus, tataUsahas } = await getStaffData();

  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen overflow-hidden">
      {/* Kita memanggil Client Component di sini dan mengirim data 
        yang sudah berhasil di-fetch dari server. 
      */}
      <StaffDirectoryClient 
        gurus={gurus} 
        tataUsahas={tataUsahas} 
        strapiUrl={STRAPI_URL} 
      />
    </main>
  );
}