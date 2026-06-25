import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton"; 

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login"); 
  }

  const role = (session.user as any).role; 

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-display font-bold text-xl">Portal Panel</h2>
          <p className="text-xs text-gray-500 mt-1 font-mono">Role: {role}</p>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/dashboard" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">dashboard</span> Dashboard
          </Link>
          
          <Link href="/dashboard/mading" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">dashboard_customize</span> Kelola Mading
          </Link>

          {/* Perbaikan Icon Kelola Kegiatan */}
          <Link href="/dashboard/event" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span> Kelola Kegiatan
          </Link>

          {role !== "OSIS" && (
            <Link href="/dashboard/berita" className="px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">newspaper</span> Kelola Berita
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <LogoutButton />
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-display font-bold">Halo, {session.user?.name}!</h1>
        </header>
        {children}
      </main>
    </div>
  );
}