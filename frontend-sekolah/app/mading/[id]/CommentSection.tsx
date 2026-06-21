/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function CommentSection({ madingId }: { madingId: string }) {
  const [nama, setNama] = useState('');
  const [komentar, setKomentar] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // FITUR BARU: Menyimpan data komentar yang sedang dibalas
  const [replyingTo, setReplyingTo] = useState<{ id: string, nama: string } | null>(null);
  
  const [daftarKomentar, setDaftarKomentar] = useState<any[]>([]);

  const emojis = ['😀', '❤️', '🔥', '👍', '✨', '👏', '😂', '💡'];

  useEffect(() => {
    const fetchComments = async () => {
      try {
        // Tarik semua komentar yang sudah di-ACC (diurutkan dari yang terlama ke terbaru agar bacanya enak)
        const res = await fetch(`${STRAPI_URL}/api/komentars?filters[MadingId][$eq]=${madingId}&filters[Tampilkan][$eq]=true&sort=createdAt:asc`);
        const data = await res.json();
        setDaftarKomentar(data.data || []);
      } catch (error) {
        console.error("Gagal menarik komentar:", error);
      }
    };
    fetchComments();
  }, [madingId]);

  const addEmoji = (emoji: string) => {
    setKomentar((prev) => prev + emoji);
  };

  const handleReplyClick = (id: string, namaPengirim: string) => {
    setReplyingTo({ id, nama: namaPengirim });
    // Otomatis scroll ke form komentar
    document.getElementById('form-komentar')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !komentar) return;

    setIsLoading(true);

    try {
      await fetch(`${STRAPI_URL}/api/komentars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            Nama: nama,
            Isi: komentar,
            MadingId: String(madingId),
            Tampilkan: false,
            // Jika ada nilai replyingTo, kirim ID-nya. Jika tidak, kirim null
            ParentId: replyingTo ? String(replyingTo.id) : null 
          }
        })
      });

      setIsSubmitted(true);
      setNama('');
      setKomentar('');
      setReplyingTo(null); // Reset status balasan
      
      // Sembunyikan notifikasi sukses setelah 5 detik agar bisa komen lagi
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Gagal mengirim komentar:", error);
      alert("Terjadi kesalahan saat mengirim komentar.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // PISAHKAN KOMENTAR UTAMA DAN BALASAN
  const komentarUtama = daftarKomentar.filter(item => {
    const data = item.attributes || item;
    return !data.ParentId; // Yang tidak punya ParentId adalah komentar utama
  });

  const getBalasan = (parentId: string) => {
    return daftarKomentar.filter(item => {
      const data = item.attributes || item;
      return data.ParentId === String(parentId);
    });
  };

  return (
    <section className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
      <h3 className="font-display text-2xl font-bold text-black mb-6">Kolom Komentar</h3>
      
      {/* FORM KOMENTAR */}
      <div id="form-komentar" className="mb-12">
        {isSubmitted ? (
          <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-2xl flex items-start gap-4">
            <span className="material-symbols-outlined mt-0.5">check_circle</span>
            <div>
              <h4 className="font-bold mb-1">Komentar Terkirim!</h4>
              <p className="text-sm font-body">Terima kasih atas partisipasinya. Komentar kamu sedang dimoderasi oleh admin.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            {/* Indikator Sedang Membalas */}
            {replyingTo && (
              <div className="flex items-center justify-between bg-cyan-50 border border-cyan-100 text-cyan-800 px-4 py-2 rounded-lg mb-4">
                <div className="text-sm font-mono">
                  Membalas komentar <span className="font-bold">{replyingTo.nama}</span>
                </div>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-xs font-bold hover:text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">close</span> Batal
                </button>
              </div>
            )}

            <div>
              <label className="block font-mono text-xs font-bold text-gray-700 mb-2">Nama Panggilan</label>
              <input 
                type="text" 
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 font-body text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                placeholder="Cth: Budi 8A"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-xs font-bold text-gray-700 mb-2">Komentar</label>
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <textarea 
                  value={komentar}
                  onChange={(e) => setKomentar(e.target.value)}
                  className="w-full bg-transparent border-none px-4 py-3 font-body text-sm focus:ring-0 resize-none"
                  rows={4}
                  placeholder={replyingTo ? `Tulis balasan untuk ${replyingTo.nama}...` : "Tulis pendapat atau apresiasimu di sini..."}
                  required
                ></textarea>
                <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 flex items-center justify-between">
                  <div className="flex gap-2">
                    {emojis.map((emj, i) => (
                      <button key={i} type="button" onClick={() => addEmoji(emj)} className="hover:scale-125 transition-transform text-lg">
                        {emj}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`bg-black text-white font-mono text-xs font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isLoading ? 'Mengirim...' : replyingTo ? 'Kirim Balasan' : 'Kirim Komentar'}
            </button>
          </form>
        )}
      </div>

      {/* DAFTAR KOMENTAR & BALASAN */}
      <div className="space-y-8">
        <h4 className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100 pb-2">Komentar Terbaru</h4>
        
        {komentarUtama.length > 0 ? (
          komentarUtama.map((item: any) => {
            const data = item.attributes || item;
            const itemId = item.documentId || item.id; // Support Strapi v4 & v5
            const balasan = getBalasan(itemId);

            return (
              <div key={itemId} className="flex gap-4">
                {/* Avatar Komentar Utama */}
                <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-bold shrink-0">
                  {data.Nama ? data.Nama.charAt(0).toUpperCase() : 'A'}
                </div>
                
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-baseline gap-2">
                        <h5 className="font-bold text-sm text-black">{data.Nama}</h5>
                        <span className="text-[10px] text-gray-400 font-mono">{formatDate(data.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 font-body text-sm whitespace-pre-wrap">{data.Isi}</p>
                  </div>
                  
                  {/* Tombol Balas */}
                  <button 
                    onClick={() => handleReplyClick(itemId, data.Nama)}
                    className="text-xs font-mono font-bold text-gray-500 hover:text-black ml-4 mb-4 transition-colors"
                  >
                    BALAS
                  </button>

                  {/* Render Balasan (Nested Comments) */}
                  {balasan.length > 0 && (
                    <div className="mt-2 space-y-4 pl-4 border-l-2 border-gray-100">
                      {balasan.map((reply: any) => {
                        const replyData = reply.attributes || reply;
                        return (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0 text-xs">
                              {replyData.Nama ? replyData.Nama.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <h5 className="font-bold text-xs text-black">{replyData.Nama}</h5>
                                  <span className="text-[10px] text-gray-400 font-mono">{formatDate(replyData.createdAt)}</span>
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
          <div className="text-sm text-gray-500 italic text-center py-8">Belum ada komentar. Jadilah yang pertama berkomentar!</div>
        )}
      </div>
    </section>
  );
}