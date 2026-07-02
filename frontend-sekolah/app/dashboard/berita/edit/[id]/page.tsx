/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic"; 
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

// PERBAIKAN: Gunakan Markdown Editor alih-alih HTML WYSIWYG (Quill)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { data: session } = useSession();
  
  const [judul, setJudul] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState(""); 
  
  // State manajemen gambar (Multiple Media)
  const [existingImages, setExistingImages] = useState<{ id: number; url: string; name: string }[]>([]);
  const [gambarCover, setGambarCover] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [konten, setKonten] = useState(""); // Menyimpan string Markdown murni
  const [tanggal, setTanggal] = useState("");
  const [kategori, setKategori] = useState("");
  const [likes, setLikes] = useState<number>(0);
  const [dislikes, setDislikes] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // Cleanup object URLs untuk menghindari memory leak
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Ambil Data Berita
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/artikels/${id}?populate=*`, { cache: 'no-store' });
        const json = await res.json();
        
        if (json.data) {
          const dt = json.data;
          setJudul(dt.Judul || "");
          setSlug(dt.Slug || "");
          setAuthor(dt.Author || ""); 
          
          // Format data Konten disesuaikan. Jika sudah Markdown, langsung baca sebagai String.
          if (Array.isArray(dt.Konten)) {
            // Berjaga-jaga jika masih ada sisa data format Blocks lama
            const extractedText = dt.Konten[0]?.children?.[0]?.text || "";
            setKonten(extractedText);
          } else {
            setKonten(dt.Konten || "");
          }

          setTanggal(dt.Tanggal ? dt.Tanggal.split('T')[0] : ""); 
          setKategori(dt.Kategori || "");
          setLikes(dt.Likes || 0);
          setDislikes(dt.Dislikes || 0);

          // Ekstraksi data Gambar_Cover (Multiple Media)
          if (dt.Gambar_Cover) {
            const mediaData = Array.isArray(dt.Gambar_Cover) ? dt.Gambar_Cover : (dt.Gambar_Cover.data || []);
            const formattedImages = mediaData.map((img: any) => {
              const attrs = img.attributes || img;
              return {
                id: img.id,
                name: attrs.name || "",
                url: attrs.url?.startsWith("http") ? attrs.url : `${STRAPI_URL}${attrs.url}`
              };
            });
            setExistingImages(formattedImages);
          }
        } else {
          toast.error("Data tidak ditemukan");
          router.push("/dashboard/berita");
        }
      } catch (error) {
        toast.error("Gagal mengambil data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, router, STRAPI_URL]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setGambarCover((prev) => [...prev, ...filesArray]);

      const previewsArray = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  const handleRemoveExistingImage = (idToRemove: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  const handleRemoveNewImage = (indexToRemove: number) => {
    setGambarCover((prev) => prev.filter((_, i) => i !== indexToRemove));
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const jwtToken = (session as any)?.jwt;

    if (!jwtToken) {
      toast.error("Gagal: Anda tidak memiliki akses.");
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Menyimpan pembaruan...");

    try {
      let newUploadedIds: number[] = [];

      // 1. Upload Jika Ada File Gambar Baru
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

        if (!uploadRes.ok) throw new Error("Gagal mengupload gambar baru.");
        
        const uploadData = await uploadRes.json();
        newUploadedIds = uploadData.map((item: any) => item.id);
      }

      // Gabungkan ID gambar server yang dipertahankan dengan ID gambar yang baru diupload
      const finalImageIds = [...existingImages.map((img) => img.id), ...newUploadedIds];

      // 2. Submit Data Update Berita
      const payload: any = {
        data: {
          Judul: judul,
          Slug: slug,
          Author: author || "Anonim", 
          // PERBAIKAN: Konten sekarang dikirim sebagai string Markdown murni
          Konten: konten, 
          Tanggal: tanggal || null,
          Kategori: kategori || null,
          Likes: Number(likes),
          Dislikes: Number(dislikes),
          Gambar_Cover: finalImageIds.length > 0 ? finalImageIds : null // Sinkronisasi gambar terbaru
        }
      };

      const res = await fetch(`${STRAPI_URL}/api/artikels/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwtToken}`, 
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorDetail = await res.text();
        console.error("Server Response:", errorDetail);
        throw new Error("Gagal menyimpan data ke server.");
      }

      toast.success("Berita berhasil diperbarui!", { id: toastId });
      
      setTimeout(() => {
        router.push("/dashboard/berita");
        router.refresh();
      }, 1500);

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Terjadi kesalahan saat memperbarui.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-10 text-center text-gray-500 animate-pulse mt-10">Memuat data berita...</div>;

  return (
    <div className="max-w-4xl pb-10">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/berita" className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Edit Berita</h2>
          <p className="text-gray-500 text-sm">Perbarui informasi artikel atau pengumuman.</p>
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

          {/* MANAJEMEN MULTIPLE MEDIA IMAGE */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Gambar Cover (Multiple Media)</label>
            <p className="text-xs text-gray-500 mb-3">Kelola gambar yang diunggah untuk cover berita ini ({existingImages.length + gambarCover.length} Berkas).</p>
            
            {(existingImages.length > 0 || imagePreviews.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm transition-all">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                        title="Hapus dari cover"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                      Server
                    </span>
                  </div>
                ))}

                {imagePreviews.map((url, index) => (
                  <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-blue-200 bg-blue-50 shadow-sm transition-all">
                    <img src={url} alt="Preview baru" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(index)}
                        className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                        title="Batalkan berkas"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      Baru
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center border border-gray-200">
                  <span className="material-symbols-outlined">add_to_photos</span>
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  Klik atau seret file ke sini untuk menambahkan berkas gambar baru
                </div>
                <p className="text-xs text-gray-400">Mendukung file PNG, JPG, JPEG (Bisa pilih sekaligus banyak)</p>
              </div>
            </div>
          </div>

          {/* PERBAIKAN: Area Konten menggunakan Markdown Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Konten <span className="text-red-500">*</span></label>
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
                "Simpan Perubahan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}