/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

export default function KalenderClient({ initialEvents }: { initialEvents: any[] }) {
  const router = useRouter();
  
  // States
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedEvent, setSelectedEvent] = useState<any>(null); // Untuk Modal
  const [searchQuery, setSearchQuery] = useState(''); // Untuk Pencarian

  // --- LOGIKA WAKTU ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); 
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- LOGIKA FILTER & PENCARIAN ---
  // Jika sedang mencari (searchQuery tidak kosong), cari di SEMUA bulan.
  // Jika tidak, tampilkan hanya bulan yang sedang aktif.
  const displayedEvents = useMemo(() => {
    if (searchQuery.trim() !== '') {
      return initialEvents.filter((item) => {
        const data = item.attributes || item;
        return data.NamaKegiatan.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    return initialEvents.filter((item) => {
      const data = item.attributes || item;
      const eventDate = new Date(data.TanggalMulai);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });
  }, [initialEvents, month, year, searchQuery]);

  const getEventsForDate = (day: number) => {
    return displayedEvents.filter((item) => {
      const data = item.attributes || item;
      return new Date(data.TanggalMulai).getDate() === day;
    });
  };

  // --- FUNGSI CETAK PDF ---
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="w-full">
      {/* TOMBOL KEMBALI */}
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 font-mono text-xs font-bold text-gray-500 hover:text-black mb-6 transition-colors print:hidden"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span> KEMBALI KE HALAMAN SEBELUMNYA
      </button>

      {/* KALENDER WRAPPER */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
        
        {/* ACTION BAR (Pencarian & Download) */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
          {/* Kolom Pencarian */}
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Cari nama kegiatan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm font-body text-black"
            />
          </div>

          {/* Tombol PDF */}
          <button 
            onClick={handlePrintPDF}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Simpan PDF
          </button>
        </div>

        {/* HEADER KALENDER (Navigasi & Toggle View) */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
          
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} disabled={!!searchQuery} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <h2 className="font-display text-2xl font-bold text-black w-56 text-center">
              {searchQuery ? 'Hasil Pencarian' : `${monthNames[month]} ${year}`}
            </h2>
            <button onClick={nextMonth} disabled={!!searchQuery} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              disabled={!!searchQuery}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' && !searchQuery ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_view_month</span>
              Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' || searchQuery ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-black'}`}
            >
              <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
              List
            </button>
          </div>
        </div>

        {/* KONTEN KALENDER */}
        <div className="p-6 md:p-8 print:p-0">
          
          {/* TAMPILAN 1: MODE GRID */}
          {viewMode === 'grid' && !searchQuery && (
            <div className="w-full">
              <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
                {daysOfWeek.map((day, i) => (
                  <div key={day} className={`text-center font-mono text-xs font-bold uppercase ${i === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24 md:h-32 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 print:border-gray-300"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const day = index + 1;
                  const dailyEvents = getEventsForDate(day);
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                  return (
                    <div key={`day-${day}`} className={`h-24 md:h-32 rounded-xl border p-1.5 md:p-2 flex flex-col gap-1 transition-all hover:shadow-md print:border-gray-300 print:break-inside-avoid ${isToday ? 'border-cyan-500 bg-cyan-50/30' : 'border-gray-100 hover:border-cyan-300'}`}>
                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-cyan-500 text-white' : 'text-gray-700'}`}>
                        {day}
                      </span>
                      
                      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1 mt-1">
                        {dailyEvents.map(ev => {
                          const data = ev.attributes || ev;
                          return (
                            <button 
                              key={ev.id} 
                              onClick={() => setSelectedEvent(data)}
                              className="bg-cyan-100 text-cyan-800 text-[9px] md:text-[11px] font-bold px-1.5 py-1 rounded truncate w-full text-left hover:bg-cyan-200 transition-colors cursor-pointer"
                            >
                              {data.NamaKegiatan}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAMPILAN 2: MODE LIST (Aktif otomatis saat mencari) */}
          {(viewMode === 'list' || searchQuery) && (
            <div className="w-full max-w-3xl mx-auto print:max-w-none">
              {displayedEvents.length > 0 ? (
                <ul className="flex flex-col gap-4">
                  {displayedEvents.map((item) => {
                    const data = item.attributes || item;
                    const dateObj = new Date(data.TanggalMulai);
                    const fullDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

                    return (
                      <li key={item.id} className="flex flex-col md:flex-row gap-4 md:items-center p-4 rounded-2xl border border-gray-100 hover:border-cyan-500 hover:shadow-md transition-all group bg-gray-50/50 hover:bg-white print:border-gray-300 print:break-inside-avoid">
                        <div className="flex flex-col items-center justify-center bg-white rounded-xl py-3 w-16 shrink-0 border border-gray-200 group-hover:border-cyan-500 transition-colors">
                          <span className="font-mono text-[10px] font-bold text-gray-500 uppercase">{dateObj.toLocaleDateString('id-ID', { month: 'short' })}</span>
                          <span className="font-display text-2xl font-bold text-black group-hover:text-cyan-700">{dateObj.getDate()}</span>
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedEvent(data)}>
                          <h4 className="font-display text-lg font-bold text-black mb-1 group-hover:text-cyan-600 transition-colors">
                            {data.NamaKegiatan}
                          </h4>
                          <p className="font-body text-sm text-gray-600 line-clamp-2 mb-2">
                            {data.DeskripsiSingkat}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 mt-2">
                            <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">calendar_month</span> {fullDate}
                            </span>
                            {data.Lokasi && (
                              <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span> {data.Lokasi}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="text-center py-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50 print:hidden">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">search_off</span>
                  <p className="text-gray-500 font-mono text-sm">
                    {searchQuery ? `Tidak ada kegiatan bernama "${searchQuery}"` : `Tidak ada agenda di bulan ${monthNames[month]} ${year}.`}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* =======================================
          MODAL POP-UP DETAIL KEGIATAN
      ======================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <span className="font-mono text-xs font-bold text-cyan-600 uppercase tracking-wider">Detail Kegiatan</span>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8">
              <h3 className="font-display text-2xl font-bold text-black mb-4">
                {selectedEvent.NamaKegiatan}
              </h3>
              
              <div className="flex flex-col gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-gray-400 mt-0.5">calendar_today</span>
                  <div>
                    <p className="text-xs font-mono text-gray-500 mb-0.5">Tanggal Mulai</p>
                    <p className="text-sm font-bold text-black">
                      {new Date(selectedEvent.TanggalMulai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {selectedEvent.TanggalSelesai && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400 mt-0.5">event_available</span>
                    <div>
                      <p className="text-xs font-mono text-gray-500 mb-0.5">Tanggal Selesai</p>
                      <p className="text-sm font-bold text-black">
                        {new Date(selectedEvent.TanggalSelesai).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent.Lokasi && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-gray-400 mt-0.5">location_on</span>
                    <div>
                      <p className="text-xs font-mono text-gray-500 mb-0.5">Lokasi</p>
                      <p className="text-sm font-bold text-black">{selectedEvent.Lokasi}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-mono text-gray-500 mb-2">Deskripsi</p>
                <p className="font-body text-gray-700 text-sm leading-relaxed">
                  {selectedEvent.DeskripsiSingkat || "Tidak ada deskripsi tersedia untuk kegiatan ini."}
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}