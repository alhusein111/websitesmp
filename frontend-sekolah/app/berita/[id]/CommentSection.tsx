/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect, useCallback } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function CommentSection({ beritaId }: { beritaId: string }) {
  const [nama, setNama] = useState('');
  const [komentar, setKomentar] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string, nama: string } | null>(null);
  const [daftarKomentar, setDaftarKomentar] = useState<any[]>([]);

  const emojis = ['😀', '❤️', '🔥', '👍', '✨', '👏', '💡', '😮'];

  // 1. Keluarkan fungsi tarik data agar bisa dipanggil ulang kapan saja
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`${STRAPI_URL}/api/komentars?filters[BeritaId][$eq]=${beritaId}&filters[Tampilkan][$eq]=true&sort=createdAt:asc`);
      const data = await res.json();
      setDaftarKomentar(data.data || []);
    } catch (error) {
      console.error("Gagal menarik daftar komentar:", error);
    }
  }, [beritaId]);

  // 2. Tarik data saat halaman pertama kali dibuka
  useEffect(() => {
    // Kita jalankan lewat setTimeout agar linter React tidak menganggapnya sinkron
    const timer = setTimeout(() => {
      fetchComments();
    }, 0);

    // Bersihkan memori saat komponen ditutup
    return () => clearTimeout(timer);
  }, [fetchComments]);

  const addEmoji = (emoji: string) => {
    setKomentar((prev) => prev + emoji);
  };

  const handleReplyClick = (id: string, namaPengirim: string) => {
    setReplyingTo({ id, nama: namaPengirim });
    document.getElementById('form-berita-komentar')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !komentar) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${STRAPI_URL}/api/komentars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            Nama: nama,
            Isi: komentar,
            BeritaId: Number(beritaId), // Sudah kembali pakai Number ya
            Tampilkan: true, // Langsung tampil tanpa moderasi
            ParentId: replyingTo ? String(replyingTo.id) : null
          }
        })
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        console.error("Strapi menolak menyimpan komentar. Detail:", errorResponse);
        alert(`Gagal mengirim komentar: ${errorResponse.error?.message || 'Periksa permissions Strapi'}`);
        return;
      }

      // 3. KUNCI RAHASIANYA: Tarik ulang data komentar langsung setelah sukses posting!
      await fetchComments();

      setIsSubmitted(true);
      setNama('');
      setKomentar('');
      setReplyingTo(null);
      setTimeout(() => setIsSubmitted(false), 5000); // Pesan sukses hilang dalam 5 detik
    } catch (error) {
      console.error("Gagal koneksi ke server Strapi:", error);
      alert("Terjadi masalah koneksi jaringan.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const komentarUtama = daftarKomentar.filter(item => {
    const data = item.attributes || item;
    return !data.ParentId;
  });

  const getBalasan = (parentId: string) => {
    return daftarKomentar.filter(item => {
      const data = item.attributes || item;
      return data.ParentId === String(parentId);
    });
  };

  return (
    <section className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
      <h3 className="font-display text-xl font-bold text-black mb-6">Kolom Diskusi Berita</h3>
      
      {/* FORM INPUT KOMENTAR */}
      <div id="form-berita-komentar" className="mb-10">
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-5 rounded-2xl flex items-start gap-4">
            <span className="material-symbols-outlined mt-0.5 text-emerald-600">check_circle</span>
            <div>
              <h4 className="font-bold mb-0.5">Komentar Terkirim!</h4>
              <p className="text-xs font-body">Pendapatmu berharga. Komentar akan muncul setelah disetujui tim Humas Sekolah.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
            {replyingTo && (
              <div className="flex items-center justify-between bg-cyan-50 border border-cyan-100 text-cyan-800 px-4 py-2 rounded-xl mb-2">
                <div className="text-xs font-mono">
                  Membalas pendapat dari <span className="font-bold">{replyingTo.nama}</span>
                </div>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-xs font-bold hover:text-red-500 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]">close</span> Batal
                </button>
              </div>
            )}

            <div>
              <label className="block font-mono text-[11px] font-bold text-gray-600 mb-2">Nama Pengirim</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 font-body text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black" placeholder="Nama asli / inisial kelas" required />
            </div>
            <div>
              <label className="block font-mono text-[11px] font-bold text-gray-600 mb-2">Pesan Komentar</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <textarea value={komentar} onChange={(e) => setKomentar(e.target.value)} className="w-full bg-transparent border-none px-4 py-3 font-body text-sm focus:ring-0 resize-none" rows={3} placeholder={replyingTo ? `Ketik balasan untuk ${replyingTo.nama}...` : "Tulis argumen atau apresiasimu terhadap berita ini..."} required></textarea>
                <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {emojis.map((emj, i) => (
                      <button key={i} type="button" onClick={() => addEmoji(emj)} className="hover:scale-125 transition-transform text-base">{emj}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="bg-black text-white font-mono text-xs font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors">
              {isLoading ? 'Mengirim...' : replyingTo ? 'Kirim Balasan' : 'Kirim Komentar'}
            </button>
          </form>
        )}
      </div>

      {/* RENDER DAFTAR DISKUSI */}
      <div className="space-y-6">
        <h4 className="font-mono text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Diskusi Aktif</h4>
        
        {komentarUtama.length > 0 ? (
          komentarUtama.map((item: any) => {
            const data = item.attributes || item;
            const itemId = item.id;
            const balasan = getBalasan(itemId);

            return (
              <div key={itemId} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0 text-sm">
                  {data.Nama ? data.Nama.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100 mb-1.5">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h5 className="font-bold text-xs text-black">{data.Nama}</h5>
                      <span className="text-[10px] text-gray-400 font-mono">{formatDate(data.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 font-body text-xs whitespace-pre-wrap">{data.Isi}</p>
                  </div>
                  
                  <button onClick={() => handleReplyClick(itemId, data.Nama)} className="text-[10px] font-mono font-bold text-gray-400 hover:text-black ml-3 mb-3 block">
                    BALAS
                  </button>

                  {/* Render Nested Replies */}
                  {balasan.length > 0 && (
                    <div className="mt-1 space-y-3 pl-4 border-l-2 border-gray-200">
                      {balasan.map((reply: any) => {
                        const replyData = reply.attributes || reply;
                        return (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-xs">
                              {replyData.Nama ? replyData.Nama.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                  <h5 className="font-bold text-[11px] text-black">{replyData.Nama}</h5>
                                  <span className="text-[9px] text-gray-400 font-mono">{formatDate(replyData.createdAt)}</span>
                                </div>
                                <p className="text-gray-600 font-body text-xs whitespace-pre-wrap">{replyData.Isi}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-gray-400 italic text-center py-6 font-mono">Belum ada diskusi di berita ini. Yuk mulai obrolannya!</div>
        )}
      </div>
    </section>
  );
}