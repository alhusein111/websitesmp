'use client';
import { useState, useEffect } from 'react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface LikeSectionProps {
  articleDocId: string; // WAJIB Menggunakan documentId untuk Strapi v5
  initialLikes: number;
  initialDislikes: number;
}

export default function LikeSection({ articleDocId, initialLikes, initialDislikes }: LikeSectionProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cek localStorage saat halaman dimuat di browser siswa
  useEffect(() => {
    // Bungkus dengan setTimeout agar berjalan secara asynchronous
    const timer = setTimeout(() => {
      const savedVote = localStorage.getItem(`vote_berita_${articleDocId}`);
      if (savedVote) {
        setUserVote(savedVote as 'like' | 'dislike');
      }
      setIsLoaded(true);
    }, 0);

    // Bersihkan timer jika komponen dilepas (unmount)
    return () => clearTimeout(timer);
  }, [articleDocId]);

  const handleVote = async (type: 'like' | 'dislike') => {
    if (!isLoaded) return;

    let newLikes = likes;
    let newDislikes = dislikes;
    let nextVote: 'like' | 'dislike' | null = type;

    if (userVote === type) {
      // Jika mengklik tombol yang sama, batalkan vote (Unlike / Undislike)
      if (type === 'like') newLikes = Math.max(0, newLikes - 1);
      else newDislikes = Math.max(0, newDislikes - 1);
      nextVote = null;
      localStorage.removeItem(`vote_berita_${articleDocId}`);
    } else {
      // Jika sebelumnya sudah vote pilihan lain, kurangi dulu vote yang lama
      if (userVote === 'like') newLikes = Math.max(0, newLikes - 1);
      if (userVote === 'dislike') newDislikes = Math.max(0, newDislikes - 1);

      // Tambahkan ke pilihan yang baru
      if (type === 'like') newLikes++;
      else newDislikes++;
      
      // Simpan status vote ke perangkat siswa
      localStorage.setItem(`vote_berita_${articleDocId}`, type);
    }

    // Update tampilan UI secara instan
    setLikes(newLikes);
    setDislikes(newDislikes);
    setUserVote(nextVote);

    try {
      // Tembak menggunakan documentId agar terekam mulus di Strapi v5
      const res = await fetch(`${STRAPI_URL}/api/artikels/${articleDocId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            Likes: newLikes,
            Dislikes: newDislikes
          }
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Strapi menolak update likes:", errorData);
      }
    } catch (error) {
      console.error("Gagal mengirim vote ke database:", error);
    }
  };

  // Tampilkan loading placeholder sebentar selagi membaca localStorage
  if (!isLoaded) {
    return <div className="h-10 w-48 bg-gray-100 animate-pulse rounded-xl"></div>;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
      <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wider">Apakah berita ini bermanfaat?</span>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleVote('like')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-mono text-xs font-bold transition-all hover:scale-105 ${
            userVote === 'like' 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-black'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] leading-none">thumb_up</span>
          <span>{likes}</span>
        </button>

        <button 
          onClick={() => handleVote('dislike')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-mono text-xs font-bold transition-all hover:scale-105 ${
            userVote === 'dislike' 
              ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:border-black'
          }`}
        >
          <span className="material-symbols-outlined text-[18px] leading-none">thumb_down</span>
          <span>{dislikes}</span>
        </button>
      </div>
    </div>
  );
}