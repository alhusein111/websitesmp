'use client';

import { useState, useEffect } from 'react';

interface VoteSectionProps {
  madingId: string;
  initialLikes?: number;
  initialDislikes?: number;
}

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export default function VoteSection({ madingId, initialLikes = 0, initialDislikes = 0 }: VoteSectionProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Dibungkus menggunakan setTimeout dengan delay 0 agar berjalan asinkron.
    // Trik ini dijamin akan menghilangkan error "synchronous setState" dari React.
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const savedVote = localStorage.getItem(`vote_mading_${madingId}`);
        if (savedVote === 'like' || savedVote === 'dislike') {
          setUserVote(savedVote);
        }
      }
    }, 0);

    // Bersihkan timer jika komponen dilepas (unmount)
    return () => clearTimeout(timer);
  }, [madingId]);

  const updateStrapi = async (newLikes: number, newDislikes: number) => {
    try {
      const response = await fetch(`${STRAPI_URL}/api/madings/${madingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            Likes: newLikes,
            Dislikes: newDislikes,
          }
        })
      });

      if (!response.ok) {
        console.error("Gagal update ke Strapi");
      }
    } catch (error) {
      console.error("Gagal menghubungi API Strapi:", error);
    }
  };

  const handleVote = async (type: 'like' | 'dislike') => {
    if (isLoading) return;
    setIsLoading(true);

    let newLikes = likes;
    let newDislikes = dislikes;

    if (userVote === type) {
      // Batal vote
      if (type === 'like') newLikes -= 1;
      if (type === 'dislike') newDislikes -= 1;
      setUserVote(null);
      localStorage.removeItem(`vote_mading_${madingId}`); // Hapus jejak di browser
    } else if (userVote === 'like' && type === 'dislike') {
      // Pindah dari like ke dislike
      newLikes -= 1;
      newDislikes += 1;
      setUserVote('dislike');
      localStorage.setItem(`vote_mading_${madingId}`, 'dislike'); // Simpan jejak baru
    } else if (userVote === 'dislike' && type === 'like') {
      // Pindah dari dislike ke like
      newDislikes -= 1;
      newLikes += 1;
      setUserVote('like');
      localStorage.setItem(`vote_mading_${madingId}`, 'like'); // Simpan jejak baru
    } else {
      // Vote pertama kali
      if (type === 'like') newLikes += 1;
      if (type === 'dislike') newDislikes += 1;
      setUserVote(type);
      localStorage.setItem(`vote_mading_${madingId}`, type); // Simpan jejak
    }

    setLikes(newLikes);
    setDislikes(newDislikes);
    await updateStrapi(newLikes, newDislikes);
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-4 py-6 border-y border-gray-100 mb-10">
      <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">
        Berikan Suara:
      </div>
      
      <button 
        onClick={() => handleVote('like')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm font-bold transition-all ${
          userVote === 'like' 
            ? 'bg-black text-white shadow-md scale-105' 
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="material-symbols-outlined text-[20px]">thumb_up</span>
        {likes}
      </button>

      <button 
        onClick={() => handleVote('dislike')}
        disabled={isLoading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-sm font-bold transition-all ${
          userVote === 'dislike' 
            ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm scale-105' 
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="material-symbols-outlined text-[20px]">thumb_down</span>
        {dislikes}
      </button>
    </div>
  );
}