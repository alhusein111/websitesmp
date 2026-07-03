/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

// Menggunakan MDEditor bawaan untuk standardisasi format Markdown
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function TambahMadingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Ref hanya untuk input file gambar
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State form
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [penulis, setPenulis] = useState("");
  const [kelas, setKelas] = useState("");
  const [kategori, setKategori] = useState("");
  const [media, setMedia] = useState<File[]>([]); 
  const [konten, setKonten] = useState("");
  const [tanggal, setTanggal] = useState("");
  
  const [loading, setLoading] = useState(false);

  // Handler konversi judul ke slug otomatis
  const handleJudulChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputJudul = e.target.value;
    setJudul(inputJudul);

    const generatedSlug = inputJudul
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
      
    setSlug(generatedSlug);
  };

  // Fungsi manajemen file media (Tambah & Hapus satuan)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosenFiles = Array.from(e.target.files);
      setMedia((prev) => [...prev, ...chosenFiles]);
    }
  };

  const removeMediaItem = (indexToRemove: number) => {
    setMedia((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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

    const toastId = toast.loading("Menyimpan data Mading...");

    try {
      // ==========================================
      // STRAPI MARKDOWN PAYLOAD (Direct String)
      // ==========================================
      const dataPayload: any = {
        Judul: judul,
        Slug: slug,
        Penulis: penulis,
        Kelas: kelas,
        Kategori: kategori,
        Konten: konten, // String markdown murni dari MDEditor
        Likes: 0,
        Dislikes: 0
      };

      if (tanggal) dataPayload.Tanggal = tanggal;

      // TAHAP 1: Simpan entri mading teks
      const resCreate = await fetch("http://localhost:1337/api/madings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: dataPayload }),
      });

      const createdData = await resCreate.json();

      if (!resCreate.ok) {
        throw new Error(createdData.error?.message || "Gagal menyimpan data teks Mading.");
      }

      const entryId = createdData.data.id;

      // TAHAP 2: Upload multiple media jika ada berkas terpilih
      if (media.length > 0) {
        toast.loading("Mengunggah berkas gambar...", { id: toastId });
        
        const formData = new FormData();
        media.forEach((file) => {
          formData.append("files", file);
        });

        formData.append("ref", "api::mading.mading");
        formData.append("refId", entryId.toString());
        formData.append("field", "Gambar");

        const resUpload = await fetch("http://localhost:1337/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
          },
          body: formData,
        });

        if (!resUpload.ok) {
          const uploadError = await resUpload.json();
          console.error("Error Upload Gambar:", uploadError);
          toast.error("Mading tersimpan, namun beberapa gambar gagal diunggah.", { id: toastId });
          return;
        }
      }

      toast.success("Berhasil! Mading baru telah ditambahkan.", { id: toastId });
      
      setTimeout(() => {
        router.push("/dashboard/mading");
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error("Error catch:", error);
      toast.error(`Gagal menyimpan: ${error.message || "Terjadi kesalahan sistem."}`, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl pb-12">
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER PAGE */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/mading" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs">
          <span className="material-symbols-outlined text-gray-600">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tambah Entry Mading</h2>
          <p className="text-gray-500 text-xs md:text-sm">Konfigurasi kolom diselaraskan penuh dengan Strapi Content Manager.</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* BOX 1: INFO UTAMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Judul Mading <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={judul}
                onChange={handleJudulChange}
                placeholder="Masukkan judul karya mading..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Slug <span className="font-normal lowercase italic">(Otomatis generated)</span></label>
              <input 
                type="text" 
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 outline-none text-sm cursor-not-allowed"
                readOnly
              />
            </div>
          </div>

          {/* BOX 2: PENULIS & KELAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Nama Penulis / Pembuat</label>
              <input 
                type="text" 
                value={penulis}
                onChange={(e) => setPenulis(e.target.value)}
                placeholder="Contoh: Ahmad Subarjo"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Kelas / Ruang</label>
              <input 
                type="text" 
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: 7A / 8B / 9C"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* BOX 3: KATEGORI & STRAPI MULTIPLE ASSET MANAGER */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Kategori Karya</label>
              <select 
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all bg-white text-sm"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="Puisi">Puisi</option>
                <option value="Cerpen">Cerpen</option>
                <option value="Komik">Komik</option>
                <option value="Poster">Poster</option>
                <option value="Lukisan">Lukisan</option>
                <option value="Video">Video</option>
                <option value="Artikel Siswa">Artikel Siswa</option>
              </select>
            </div>

            {/* STRAPI ASSET MANAGER REPLICA */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Gambar / Media Mading (Multiple)</label>
              
              <input 
                type="file" 
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 min-h-30">
                {/* Thumbnails list */}
                {media.map((file, idx) => {
                  const localUrl = URL.createObjectURL(file);
                  return (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-2xs">
                      <img src={localUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeMediaItem(idx)}
                          className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
                          title="Hapus gambar ini"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white px-1.5 py-0.5 truncate font-mono">
                        {file.name}
                      </div>
                    </div>
                  );
                })}

                {/* Upload Trigger Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border border-dashed border-gray-300 bg-white hover:bg-gray-50 flex flex-col items-center justify-center text-gray-500 transition-all group"
                >
                  <span className="material-symbols-outlined text-2xl text-gray-400 group-hover:text-cyan-600 transition-colors">add_photo_alternate</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-gray-400 group-hover:text-cyan-600">Tambah Media</span>
                </button>
              </div>
            </div>
          </div>

          {/* BOX 4: STRAPI MARKDOWN TEXT EDITOR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Konten Mading <span className="text-red-500">*</span></label>
            <div data-color-mode="light" className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <MDEditor
                value={konten}
                onChange={(val) => setKonten(val || "")}
                height={400}
                preview="live" 
                textareaProps={{
                  placeholder: "Tulis konten mading di sini dengan format Markdown...",
                }}
              />
            </div>
          </div>

          {/* BOX 5: TIMING CONFIG */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Tanggal Publikasi</label>
              <input 
                type="date" 
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-sm text-gray-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">Likes (Default)</label>
              <input type="number" value="0" disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 outline-none text-sm cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">Dislikes (Default)</label>
              <input type="number" value="0" disabled className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 outline-none text-sm cursor-not-allowed" />
            </div>
          </div>

          {/* AKSI TOMBOL SUBMIT */}
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Link href="/dashboard/mading" className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
              Batal
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2 shadow-xs"
            >
              {loading ? "Memproses..." : (
                <><span className="material-symbols-outlined text-sm">save</span> Simpan Mading</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}