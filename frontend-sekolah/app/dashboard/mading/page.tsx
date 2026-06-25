/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MadingDashboardPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Paginasi
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchMading = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/madings?pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
          { cache: "no-store" }
        );
        const result = await res.json();
        if (res.ok) {
          setData(result.data || []);
          setPageCount(result.meta?.pagination?.pageCount || 1);
        }
      } catch (error) {
        console.error("Gagal mengambil data mading:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMading();
  }, [page]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kelola Mading Digital</h2>
          <p className="text-gray-500 text-sm">Daftar karya kreativitas tulis dan seni dari siswa-siswi.</p>
        </div>
        <Link 
          href="/dashboard/mading/tambah" 
          className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span> Tambah Mading
        </Link>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold">
                <th className="p-4 pl-6">Judul Karya</th>
                <th className="p-4">Kreator (Siswa)</th>
                <th className="p-4">Kategori</th>
                <th className="p-4 text-center">Apresiasi (👍)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 animate-pulse">Memuat data mading...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">Belum ada data karya mading.</td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-black">{item.Judul}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Rilis: {item.Tanggal ? new Date(item.Tanggal).toLocaleDateString('id-ID') : "-"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.Penulis || "Anonim"}</div>
                      <div className="text-xs text-gray-500">Kelas {item.Kelas || "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-xs font-bold border border-cyan-100 uppercase">
                        {item.Kategori || "Lainnya"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-green-600">
                      {item.Likes || 0} Likes
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