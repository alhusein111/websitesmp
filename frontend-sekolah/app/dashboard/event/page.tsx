"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function EventDashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Paginasi
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchKegiatan = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/kegiatans?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
          { cache: "no-store" }
        );
        const result = await res.json();
        if (res.ok) {
          setData(result.data || []);
          setPageCount(result.meta?.pagination?.pageCount || 1);
        }
      } catch (error) {
        console.error("Gagal mengambil data kegiatan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKegiatan();
  }, [page]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kelola Kegiatan / Event Sekolah</h2>
          <p className="text-gray-500 text-sm">Daftar agenda kegiatan OSIS & Humas.</p>
        </div>
        <Link 
          href="/dashboard/event/tambah" 
          className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span> Tambah Kegiatan
        </Link>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                <th className="p-4 pl-6">Nama Kegiatan</th>
                <th className="p-4">Waktu Pelaksanaan</th>
                <th className="p-4">Lokasi Tempat</th>
                <th className="p-4 text-center">Status Sidebar</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 animate-pulse">Memuat data agenda...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada data agenda kegiatan.</td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-black">{item.NamaKegiatan}</div>
                      <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.DeskripsiSingkat}</div>
                    </td>
                    <td className="p-4 text-xs font-medium text-gray-600">
                      {item.TanggalMulai ? new Date(item.TanggalMulai).toLocaleDateString('id-ID', {day:'numeric', month:'short'}) : "-"} 
                      {" s/d "} 
                      {item.TanggalSelesai ? new Date(item.TanggalSelesai).toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric'}) : "-"}
                    </td>
                    <td className="p-4 text-gray-500">{item.Lokasi || "-"}</td>
                    <td className="p-4 text-center">
                      {item.TampilkanDiSidebar ? (
                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-100">Aktif</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-medium">Sembunyi</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINASI */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm">
          <span className="text-gray-500">Halaman <strong className="text-black">{page}</strong> dari <strong className="text-black">{pageCount}</strong></span>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              disabled={page === pageCount || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}