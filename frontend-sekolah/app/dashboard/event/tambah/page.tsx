"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahEventPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State untuk menangkap input form
  const [namaEvent, setNamaEvent] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan("");

    // Ambil JWT token dari session NextAuth
    const jwtToken = (session as any)?.jwt;

    if (!jwtToken) {
      setPesan("Gagal: Anda tidak memiliki akses (Token tidak ditemukan).");
      setLoading(false);
      return;
    }

    try {
      // Tembak API Strapi v5 (Sesuaikan endpoint jika nama collection di strapi berbeda, misal: kegiatans)
      const res = await fetch("http://localhost:1337/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`, 
        },
        // Bungkus data di dalam object "data" (Syarat wajib Strapi v5)
        body: JSON.stringify({
          data: {
            nama_event: namaEvent, // sesuaikan dengan nama field di Strapi
            tanggal_event: tanggal, // sesuaikan dengan nama field di Strapi
            lokasi: lokasi,
            deskripsi: deskripsi,
          }
        })
      });

      if (res.ok) {
        alert("Berhasil! Kegiatan baru telah dipublikasikan.");
        router.push("/dashboard/event");
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error(errorData);
        setPesan(`Gagal menyimpan: ${errorData.error?.message || "Periksa izin hak akses di Strapi"}`);
      }
    } catch (error) {
      console.error("Error submit event:", error);
      setPesan("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/event" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Tambah Agenda Kegiatan</h2>
          <p className="text-gray-500 text-sm">Publikasikan informasi acara sekolah mendatang.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        {pesan && (
          <div className="p-4 rounded-lg mb-6 text-sm font-bold bg-red-50 text-red-700">
            {pesan}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama / Judul Kegiatan</label>
            <input 
              type="text" 
              value={namaEvent}
              onChange={(e) => setNamaEvent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Contoh: Lomba Classmeeting Semester Ganjil"
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal Pelaksanaan</label>
              <input 
                type="date" 
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tempat / Lokasi</label>
              <input 
                type="text" 
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="Contoh: Lapangan Utama Sekolah"
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Detail Acara</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Tuliskan detail rundown, syarat peserta, atau info penting lainnya..."
              required 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link href="/dashboard/event" className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Menyimpan..." : "Publikasikan Acara"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}