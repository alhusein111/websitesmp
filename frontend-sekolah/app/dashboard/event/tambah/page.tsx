/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function TambahEventPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State form sesuai Screenshot Strapi
  const [namaKegiatan, setNamaKegiatan] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsiSingkat, setDeskripsiSingkat] = useState("");
  const [tampilkanDiSidebar, setTampilkanDiSidebar] = useState(false);
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const jwtToken = (session as any)?.jwt;

    if (!jwtToken) {
      toast.error("Gagal: Anda tidak memiliki akses (Token tidak ditemukan).");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Menyimpan kegiatan...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`, 
        },
        body: JSON.stringify({
          data: {
            NamaKegiatan: namaKegiatan,
            TanggalMulai: tanggalMulai,
            TanggalSelesai: tanggalSelesai,
            Lokasi: lokasi,
            DeskripsiSingkat: deskripsiSingkat,
            TampilkanDiSidebar: tampilkanDiSidebar
          }
        })
      });

      if (res.ok) {
        toast.success("Berhasil! Kegiatan baru telah dipublikasikan.", { id: toastId });
        setTimeout(() => {
          router.push("/dashboard/event");
          router.refresh();
        }, 1500);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Periksa izin hak akses di Strapi");
      }
    } catch (error: any) {
      console.error("Error submit event:", error);
      toast.error(`Gagal menyimpan: ${error.message}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl pb-12">
      <Toaster position="top-center" />
      
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/event" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
          <span className="material-symbols-outlined text-gray-600">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Tambah Agenda Kegiatan</h2>
          <p className="text-gray-500 text-sm">Publikasikan informasi acara sekolah mendatang.</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Nama Kegiatan <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={namaKegiatan}
                onChange={(e) => setNamaKegiatan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                placeholder="Contoh: Lomba Classmeeting Semester Ganjil"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm bg-white"
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Tanggal Selesai</label>
              <input 
                type="date" 
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Lokasi / Tempat</label>
              <input 
                type="text" 
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                placeholder="Contoh: Lapangan Utama Sekolah"
              />
            </div>

            <div className="flex flex-col justify-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Tampilkan di Sidebar (Highlight)?</label>
              <label className="relative inline-flex items-center cursor-pointer w-max">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={tampilkanDiSidebar}
                  onChange={(e) => setTampilkanDiSidebar(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {tampilkanDiSidebar ? "Ya, Tampilkan" : "Tidak"}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Deskripsi Singkat (Markdown) <span className="text-red-500">*</span></label>
            <div data-color-mode="light" className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <MDEditor
                value={deskripsiSingkat}
                onChange={(val) => setDeskripsiSingkat(val || "")}
                height={300}
                preview="live"
                textareaProps={{
                  placeholder: "Tuliskan detail deskripsi kegiatan di sini...",
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link href="/dashboard/event" className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2 shadow-sm"
            >
              {loading ? "Menyimpan..." : (
                <><span className="material-symbols-outlined text-sm">save</span> Publikasikan Acara</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}