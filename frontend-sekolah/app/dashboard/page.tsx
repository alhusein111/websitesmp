import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role || "User";

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
      <h2 className="text-xl md:text-2xl font-bold mb-3">Selamat Datang di Portal Internal</h2>
      <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
        Anda login sebagai <span className="font-bold text-black bg-gray-100 px-2 py-1 rounded text-xs md:text-sm">{role}</span>. 
        Gunakan menu di sebelah kiri atau ketuk kartu di bawah ini untuk mengelola konten website sekolah.
      </p>
      
      {/* Grid Menu Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Kartu Mading (Bisa Diklik) */}
        <Link href="/dashboard/mading" className="bg-cyan-50 p-6 rounded-xl border border-cyan-100 hover:bg-cyan-100/60 transition-all duration-200 block group shadow-xs">
          <span className="material-symbols-outlined text-cyan-600 text-3xl mb-2 block group-hover:scale-110 transition-transform w-fit">dashboard_customize</span>
          <h3 className="font-bold text-cyan-900 flex items-center gap-1">
            Kelola Mading 
            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
          </h3>
          <p className="text-sm text-cyan-700 mt-1">Tambah, edit, dan hapus karya siswa di mading digital.</p>
        </Link>

        {/* Kartu Kegiatan (Bisa Diklik) */}
        <Link href="/dashboard/event" className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 hover:bg-emerald-100/60 transition-all duration-200 block group shadow-xs">
          <span className="material-symbols-outlined text-emerald-600 text-3xl mb-2 block group-hover:scale-110 transition-transform w-fit">calendar_month</span>
          <h3 className="font-bold text-emerald-900 flex items-center gap-1">
            Kelola Kegiatan 
            <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
          </h3>
          <p className="text-sm text-emerald-700 mt-1">Publikasikan agenda dan event mendatang sekolah.</p>
        </Link>
        
        {/* Kartu Berita (Bisa Diklik - Sembunyikan jika role OSIS) */}
        {role !== "OSIS" && (
          <Link href="/dashboard/berita" className="bg-amber-50 p-6 rounded-xl border border-amber-100 hover:bg-amber-100/60 transition-all duration-200 block group shadow-xs">
            <span className="material-symbols-outlined text-amber-600 text-3xl mb-2 block group-hover:scale-110 transition-transform w-fit">newspaper</span>
            <h3 className="font-bold text-amber-900 flex items-center gap-1">
              Kelola Berita 
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
            </h3>
            <p className="text-sm text-amber-700 mt-1">Publikasikan berita dan pengumuman resmi sekolah.</p>
          </Link>
        )}

      </div>
    </div>
  );
}