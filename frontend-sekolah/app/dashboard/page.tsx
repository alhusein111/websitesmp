import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "User";

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Selamat Datang di Portal Internal</h2>
      <p className="text-gray-600 mb-6">
        Anda login sebagai <span className="font-bold text-black bg-gray-100 px-2 py-1 rounded">{role}</span>. 
        Gunakan menu di sebelah kiri untuk mengelola konten website sekolah.
      </p>
      
      {/* Mengubah grid agar lebih rapi menampung 3 kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Kartu Mading (Tampil untuk semua role) */}
        <div className="bg-cyan-50 p-6 rounded-xl border border-cyan-100">
          <span className="material-symbols-outlined text-cyan-600 text-3xl mb-2">dashboard_customize</span>
          <h3 className="font-bold text-cyan-900">Kelola Mading</h3>
          <p className="text-sm text-cyan-700 mt-1">Tambah, edit, dan hapus karya siswa di mading digital.</p>
        </div>

        {/* Kartu Kegiatan (Tampil untuk semua role) */}
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
          <span className="material-symbols-outlined text-emerald-600 text-3xl mb-2">calendar_month</span>
          <h3 className="font-bold text-emerald-900">Kelola Kegiatan</h3>
          <p className="text-sm text-emerald-700 mt-1">Publikasikan agenda dan event mendatang sekolah.</p>
        </div>
        
        {/* Kartu Berita (Sembunyikan jika role OSIS) */}
        {role !== "OSIS" && (
          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
            <span className="material-symbols-outlined text-amber-600 text-3xl mb-2">newspaper</span>
            <h3 className="font-bold text-amber-900">Kelola Berita</h3>
            <p className="text-sm text-amber-700 mt-1">Publikasikan berita dan pengumuman resmi sekolah.</p>
          </div>
        )}

      </div>
    </div>
  );
}