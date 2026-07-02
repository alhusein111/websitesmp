/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import ScrollReveal from '@/components/ScrollReveal';

export default function StaffDirectoryClient({ gurus, tataUsahas, strapiUrl }: any) {
  // State untuk Modal
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [isTuModal, setIsTuModal] = useState<boolean>(false);

  // Fungsi Helper untuk URL Gambar
  const getImageUrl = (media: any, fallbackStr: string) => {
    if (!media) return fallbackStr;
    let url = media;
    if (media.url) url = media.url;
    else if (media.attributes?.url) url = media.attributes.url;
    
    if (typeof url === 'string') {
      return url.startsWith('http') ? url : `${strapiUrl}${url}`;
    }
    return fallbackStr;
  };

  // Handler Buka/Tutup Modal
  const handleOpenModal = (data: any, isTu: boolean) => {
    setSelectedPerson(data.attributes || data);
    setIsTuModal(isTu);
  };

  const handleCloseModal = () => {
    setSelectedPerson(null);
  };

  // Komponen Reusable untuk Kartu
  const PersonCard = ({ data, roleLabel, isTu = false, index }: { data: any, roleLabel: string, isTu?: boolean, index: number }) => {
    const item = data.attributes || data;
    const fallbackImage = index % 2 === 0 
      ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" 
      : "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400";
    
    const fotoUrl = getImageUrl(item.Foto, fallbackImage);
    const jabatanAtauMapel = isTu ? item.Jabatan : item.Mata_Pelajaran;
    const staggerDelay = 0.1 * (index % 4 + 1);

    return (
      <ScrollReveal delay={staggerDelay} direction="up" className="h-full">
        {/* Tambahkan onClick dan cursor-pointer di sini */}
        <div 
          onClick={() => handleOpenModal(data, isTu)}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 h-full flex flex-col cursor-pointer"
        >
          <div className="aspect-3/4 w-full relative overflow-hidden bg-gray-100">
            <img 
              src={fotoUrl} 
              alt={item.Nama} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            {/* Overlay Icon Klik */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl">visibility</span>
            </div>
          </div>
          <div className="p-6 bg-white relative z-10 border-t border-gray-50 flex-1 flex flex-col">
            <h3 className="font-display text-lg font-bold text-black mb-1 line-clamp-1">{item.Nama}</h3>
            <p className="font-mono text-[11px] tracking-wider uppercase text-cyan-600 font-bold mt-auto">{jabatanAtauMapel || roleLabel}</p>
          </div>
        </div>
      </ScrollReveal>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12">
      {/* HEADER */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 text-center mb-12"> 
        <ScrollReveal delay={0.1} direction="down">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <span className="inline-block bg-cyan-100 text-cyan-800 font-mono text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
              Direktori Staf
            </span>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.2} direction="up">  
            <h1 className="font-display text-4xl md:text-6xl font-bold text-black mb-6 tracking-tight">
              Tim Pendidik & Administrasi
            </h1>
        </ScrollReveal>
        <ScrollReveal delay={0.3} direction="up">
            <p className="font-body text-gray-600 text-lg">
              Mengenal lebih dekat para pahlawan tanpa tanda jasa yang berdedikasi penuh untuk kemajuan siswa dan sekolah.
            </p>
        </ScrollReveal>
      </section>

      {/* SECTION 1: GURU */}
      <div className="mb-20">
        <ScrollReveal delay={0.2} direction="left">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
            <span className="material-symbols-outlined text-3xl text-black">school</span>
            <h2 className="font-display text-3xl font-bold text-black">Dewan Guru</h2>
          </div>
        </ScrollReveal>
        
        {gurus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {gurus.map((guru: any, i: number) => (
              <PersonCard key={guru.id || i} data={guru} roleLabel="Guru" index={i} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 font-body text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">Belum ada data guru di database.</p>
        )}
      </div>

      {/* SECTION 2: TATA USAHA */}
      <div>
        <ScrollReveal delay={0.2} direction="left">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-4">
            <span className="material-symbols-outlined text-3xl text-black">support_agent</span>
            <h2 className="font-display text-3xl font-bold text-black">Tata Usaha & Administrasi</h2>
          </div>
        </ScrollReveal>

        {tataUsahas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {tataUsahas.map((tu: any, i: number) => (
              <PersonCard key={tu.id || i} data={tu} roleLabel="Staf Administrasi" isTu={true} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 font-body text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">Belum ada data Tata Usaha di database.</p>
        )}
      </div>

      {/* MODAL POPUP */}
      {selectedPerson && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl relative shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol Close */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-600 transition-colors backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            {/* Foto Detail */}
            <div className="w-full md:w-2/5 aspect-square md:aspect-auto md:min-h-75 bg-gray-100 relative">
              <img 
                src={getImageUrl(selectedPerson.Foto, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400")} 
                alt={selectedPerson.Nama} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Informasi Detail */}
            <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
              <div className="mb-6 border-b border-gray-100 pb-4">
                <p className="font-mono text-xs tracking-widest uppercase text-cyan-600 font-bold mb-1">
                  {isTuModal ? selectedPerson.Jabatan || "Staf Administrasi" : selectedPerson.Mata_Pelajaran || "Guru"}
                </p>
                <h2 className="font-display text-2xl font-bold text-black">{selectedPerson.Nama}</h2>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400">badge</span>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">NUPTK</p>
                    <p className="text-black font-medium text-sm">{selectedPerson.NUPTK || "Tidak tersedia"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400">mail</span>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Email</p>
                    <p className="text-black font-medium text-sm">{selectedPerson.Email || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400">call</span>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Kontak</p>
                    <p className="text-black font-medium text-sm">{selectedPerson.Kontak || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Background area klik untuk tutup modal */}
          <div className="fixed inset-0 -z-10" onClick={handleCloseModal}></div>
        </div>
      )}
    </div>
  );
}