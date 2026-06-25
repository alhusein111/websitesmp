"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahMadingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State untuk form
  const [judul, setJudul] = useState("");
  const [penulis, setPenulis] = useState("");
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan("");

    // 1. Ambil JWT token dari session NextAuth
    const jwtToken = (session as any)?.jwt;

    if (!jwtToken) {
      setPesan("Gagal: Anda tidak memiliki akses (Token tidak ditemukan).");
      setLoading(false);
      return;
    }

    try {
      // 2. Tembak API Strapi dengan metode POST
      const res = await fetch("http://localhost:1337/api/madings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // INI KUNCINYA: Sisipkan token JWT di sini
          "Authorization": `Bearer ${jwtToken}`, 
        },
        // Strapi v4/v5 mewajibkan data dibungkus dalam object "data: {}"
        body: JSON.stringify({
          data: {
            Judul: judul,
            Penulis: penulis,
            Isi: isi,
          }
        })
      });

      if (res.ok) {
        alert("Berhasil! Mading baru telah ditambahkan.");
        router.push("/dashboard/mading");
        router.refresh();
      } else {
        const errorData = await res.json();
        console.error(errorData);
        setPesan(`Gagal menyimpan: ${errorData.error?.message || "Cek izin role di Strapi"}`);
      }
    } catch (error) {
      console.error("Error submit:", error);
      setPesan("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/mading" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Tambah Mading Baru</h2>
          <p className="text-gray-500 text-sm">Tulis karya baru untuk ditampilkan di website.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        {pesan && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${pesan.includes('Berhasil') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {pesan}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Judul Mading</label>
            <input 
              type="text" 
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Contoh: Puisi Keindahan Alam"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Penulis</label>
            <input 
              type="text" 
              value={penulis}
              onChange={(e) => setPenulis(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Contoh: Budi Santoso (Kelas 9A)"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Isi / Konten Mading</label>
            <textarea 
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Tuliskan isi karya di sini..."
              required 
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link href="/dashboard/mading" className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            >
              {loading ? "Menyimpan..." : "Simpan Mading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}