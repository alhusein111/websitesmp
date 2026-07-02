/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";

// PERBAIKAN: Gunakan Markdown Editor alih-alih HTML WYSIWYG (Quill)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function TambahBeritaPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState(""); 
  const [gambarCover, setGambarCover] = useState<File[]>([]);
  const [konten, setKonten] = useState(""); // Sekarang ini akan menyimpan string Markdown murni
  const [tanggal, setTanggal] = useState("");
  const [kategori, setKategori] = useState("");
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);
  
  const [loading, setLoading] = useState(false);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setJudul(value);

    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const jwtToken = (session as any)?.jwt;

    if (!jwtToken) {
      toast.error("Gagal: Anda tidak memiliki akses (Token tidak ditemukan).");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Mempublikasikan berita...");

    try {
      let imageIds: number[] = [];

      // 1. Upload Multiple Gambar Cover
      if (gambarCover.length > 0) {
        const formData = new FormData();
        gambarCover.forEach((file) => {
          formData.append("files", file);
        });

        const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Upload gagal (${uploadRes.status}): ${errText}`);
        }
        
        const uploadData = await uploadRes.json();
        imageIds = uploadData.map((item: any) => item.id);
      }

      // 2. Submit Data Berita ke Strapi (Kirim format Markdown ke Konten)
      const payload = {
        data: {
          Judul: judul,
          Slug: slug,
          Author: author || "Anonim",
          Konten: konten, // String Markdown murni, aman untuk Strapi Rich Text
          Tanggal: tanggal || null,
          Kategori: kategori || null,
          Likes: Number(likes),
          Dislikes: Number(dislikes),
          Gambar_Cover: imageIds.length > 0 ? imageIds : null,
        }
      };

      const res = await fetch(`${STRAPI_URL}/api/artikels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`, 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("Berhasil! Berita baru telah dipublikasikan.", { id: toastId });
        
        setTimeout(() => {
          router.push("/dashboard/berita");
          router.refresh();
        }, 1500);
      } else {
        const errText = await res.text();
        try {
          const errorData = JSON.parse(errText);
          toast.error(`Gagal menyimpan: ${errorData.error?.message || "Periksa form Anda"}`, { id: toastId });
        } catch {
          toast.error(`Gagal menyimpan (${res.status})`, { id: toastId });
        }
      }
    } catch (error: any) {
      console.error("Error submit:", error);
      toast.error(error.message || "Terjadi kesalahan jaringan atau server.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl pb-10">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/berita" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Tambah Berita Baru</h2>
          <p className="text-gray-500 text-sm">Sesuaikan dengan form data Strapi.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={judul}
                onChange={handleJudulChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                placeholder="Masukkan judul berita"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
              <div className="relative">
                <input 
                  type="text" 
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all font-mono text-sm"
                  placeholder="otomatis-dari-judul"
                  required 
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg cursor-pointer" title="Otomatis terisi dari Judul">refresh</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Penulis (Author)</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="Nama penulis atau biarkan kosong untuk Anonim"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Gambar Cover (Bisa pilih beberapa file)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setGambarCover(Array.from(e.target.files));
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined">add_to_photos</span>
                </div>
                <div className="text-sm text-gray-500 font-medium mt-2 max-w-xl mx-auto wrap-break-word">
                  {gambarCover.length > 0 ? (
                    <div className="text-blue-600">
                      <p className="font-bold mb-1">🔥 {gambarCover.length} File terpilih:</p>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {gambarCover.map((f) => f.name).join(", ")}
                      </p>
                    </div>
                  ) : (
                    "Klik untuk menambahkan file atau seret ke area ini"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PERBAIKAN: Area Konten menggunakan Markdown Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Konten <span className="text-red-500">*</span></label>
            {/* data-color-mode="light" memastikan editor tetap terang/terlihat bersih terlepas dari tema dark-mode OS bawaan user */}
            <div data-color-mode="light" className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <MDEditor
                value={konten}
                onChange={(val) => setKonten(val || "")}
                height={400}
                preview="live" 
                textareaProps={{
                  placeholder: "Tulis konten berita di sini dengan format Markdown...",
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
              <input 
                type="date" 
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white"
              >
                <option value="" disabled>Pilih Kategori</option>
                <option value="Akademik">Akademik</option>
                <option value="Prestasi">Prestasi</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Likes</label>
              <input 
                type="number" 
                min="0"
                value={likes}
                onChange={(e) => setLikes(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dislikes</label>
              <input 
                type="number" 
                min="0"
                value={dislikes}
                onChange={(e) => setDislikes(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-gray-100">
            <Link href="/dashboard/berita" className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span> Menyimpan...
                </>
              ) : (
                "Publikasikan Berita"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}