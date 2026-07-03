/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";

// Menggunakan MDEditor bawaan untuk standardisasi format Markdown
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Interface untuk menampung data gambar existing dari Strapi
interface ExistingMedia {
  id: number;
  url: string;
  name: string;
}

export default function EditMadingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const madingId = params?.id; // Ambil ID dari URL

  // Ref hanya untuk input file gambar
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State form utama
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [penulis, setPenulis] = useState("");
  const [kelas, setKelas] = useState("");
  const [kategori, setKategori] = useState("");
  const [konten, setKonten] = useState("");
  const [tanggal, setTanggal] = useState("");
  
  // State Media: Pisahkan yang lama (dari server) dan yang baru (local files)
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]); 
  const [newMedia, setNewMedia] = useState<File[]>([]); 
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ==========================================
  // FETCH EXISTING DATA STRAPI
  // ==========================================
  useEffect(() => {
    const fetchMadingData = async () => {
      const jwtToken = (session as any)?.jwt;
      if (!jwtToken || !madingId) return;

      try {
        // Fetch data Mading beserta relasi Gambar-nya
        const res = await fetch(`http://localhost:1337/api/madings/${madingId}?populate=Gambar`, {
          headers: {
            "Authorization": `Bearer ${jwtToken}`
          }
        });

        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error?.message || "Gagal mengambil data mading.");

        // --- PERBAIKAN DI SINI ---
        const itemData = json.data;
        if (!itemData) throw new Error("Data mading tidak ditemukan dari server.");

        // Dukung Strapi v4 (pakai attributes) atau Strapi v5 / Flatten (langsung di object data)
        const attributes = itemData.attributes || itemData;
        // -------------------------

        // Set state form
        setJudul(attributes.Judul || "");
        setSlug(attributes.Slug || "");
        setPenulis(attributes.Penulis || "");
        setKelas(attributes.Kelas || "");
        setKategori(attributes.Kategori || "");
        setKonten(attributes.Konten || "");
        setTanggal(attributes.Tanggal || "");

        // Set existing media jika ada
        const gambarData = attributes.Gambar?.data || attributes.Gambar; // Handle relasi v4 vs v5
        
        if (gambarData && Array.isArray(gambarData)) {
          const formattedMedia = gambarData.map((img: any) => {
            const imgAttrs = img.attributes || img; // Sama, handle v4 vs v5
            return {
              id: img.id,
              url: imgAttrs.url.startsWith("http") ? imgAttrs.url : `http://localhost:1337${imgAttrs.url}`,
              name: imgAttrs.name
            };
          });
          setExistingMedia(formattedMedia);
        }

      } catch (error: any) {
        console.error("Fetch Error:", error);
        toast.error("Gagal memuat data Mading.");
      } finally {
        setFetching(false);
      }
    };

    if (session) {
      fetchMadingData();
    }
  }, [session, madingId]);

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

  // ==========================================
  // MANAJEMEN MEDIA (BARU & LAMA)
  // ==========================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const chosenFiles = Array.from(e.target.files);
      setNewMedia((prev) => [...prev, ...chosenFiles]);
    }
  };

  const removeNewMediaItem = (indexToRemove: number) => {
    setNewMedia((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeExistingMediaItem = (idToRemove: number) => {
    setExistingMedia((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  // ==========================================
  // SUBMIT UPDATE DATA
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const jwtToken = (session as any)?.jwt;

    if (!jwtToken) {
      toast.error("Gagal: Anda tidak memiliki akses (Token tidak ditemukan).");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Memperbarui data Mading...");

    try {
      let finalMediaIds: number[] = existingMedia.map(img => img.id);

      // TAHAP 1: Upload gambar baru (Jika Ada)
      if (newMedia.length > 0) {
        toast.loading("Mengunggah gambar baru...", { id: toastId });
        
        const formData = new FormData();
        newMedia.forEach((file) => {
          formData.append("files", file);
        });

        // Catatan: Saat edit, kita tidak pakai ref/refId di /upload, 
        // melainkan ambil ID hasil upload lalu di-attach ke PUT request di Tahap 2
        const resUpload = await fetch("http://localhost:1337/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
          },
          body: formData,
        });

        if (!resUpload.ok) {
          throw new Error("Gagal mengunggah gambar baru.");
        }

        const uploadedFiles = await resUpload.json();
        const uploadedIds = uploadedFiles.map((file: any) => file.id);
        
        // Gabungkan ID gambar lama yang masih dipertahankan + ID gambar baru
        finalMediaIds = [...finalMediaIds, ...uploadedIds];
      }

      // TAHAP 2: Update Payload Utama (termasuk relasi Gambar)
      toast.loading("Menyimpan pembaruan...", { id: toastId });

      const dataPayload: any = {
        Judul: judul,
        Slug: slug,
        Penulis: penulis,
        Kelas: kelas,
        Kategori: kategori,
        Konten: konten,
        Gambar: finalMediaIds // Overwrite field Gambar dengan kombinasi ID
      };

      if (tanggal) dataPayload.Tanggal = tanggal;

      const resUpdate = await fetch(`http://localhost:1337/api/madings/${madingId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${jwtToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: dataPayload }),
      });

      const updatedData = await resUpdate.json();

      if (!resUpdate.ok) {
        throw new Error(updatedData.error?.message || "Gagal memperbarui data Mading.");
      }

      toast.success("Berhasil! Mading telah diperbarui.", { id: toastId });
      
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

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
        <span className="ml-3 text-gray-600 font-medium">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl pb-12">
      <Toaster position="top-center" reverseOrder={false} />

      {/* HEADER PAGE */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/mading" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors shadow-xs">
          <span className="material-symbols-outlined text-gray-600">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Edit Entry Mading</h2>
          <p className="text-gray-500 text-xs md:text-sm">Perbarui informasi dan karya mading yang sudah ada.</p>
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
                
                {/* 1. List Thumbnail: EXISTING MEDIA (Dari Server) */}
                {existingMedia.map((img) => (
                  <div key={`existing-${img.id}`} className="relative aspect-square rounded-lg overflow-hidden border border-blue-200 bg-white group shadow-2xs">
                    <img src={img.url} alt="Server Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">EXISTING</div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeExistingMediaItem(img.id)}
                        className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
                        title="Hapus gambar ini (akan terhapus saat disimpan)"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white px-1.5 py-0.5 truncate font-mono">
                      {img.name}
                    </div>
                  </div>
                ))}

                {/* 2. List Thumbnail: NEW MEDIA (File Lokal Baru) */}
                {newMedia.map((file, idx) => {
                  const localUrl = URL.createObjectURL(file);
                  return (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-green-200 bg-white group shadow-2xs">
                      <img src={localUrl} alt="Local Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-green-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">NEW</div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeNewMediaItem(idx)}
                          className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-sm"
                          title="Batal upload gambar ini"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
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
                <><span className="material-symbols-outlined text-sm">save</span> Update Mading</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}