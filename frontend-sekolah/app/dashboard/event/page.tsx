/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function EventDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Paginasi & Filter
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // State Pencarian (Search)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State Sorting
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });

  // Efek Debounce untuk Search (Tunggu user selesai ngetik 500ms baru hit API)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchTerm);
      setPage(1); // Reset ke halaman 1 tiap kali mencari
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fungsi Fetch Data dari Strapi
  const fetchKegiatan = async () => {
    const jwtToken = (session as any)?.jwt;
    
    // Jangan fetch kalau belum ada token (menunggu session load)
    if (!jwtToken) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Setup Paginasi
      if (pageSize !== -1) {
        queryParams.append("pagination[page]", page.toString());
        queryParams.append("pagination[pageSize]", pageSize.toString());
      } else {
        queryParams.append("pagination[limit]", "-1"); // -1 untuk ambil "Semua"
      }

      // Setup Sorting
      queryParams.append("sort", `${sortConfig.key}:${sortConfig.direction}`);

      // Setup Search
      if (searchQuery) {
        queryParams.append("filters[NamaKegiatan][$containsi]", searchQuery);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/events?${queryParams.toString()}`,
        { 
          headers: { "Authorization": `Bearer ${jwtToken}` },
          cache: "no-store" 
        }
      );
      
      const result = await res.json();
      
      if (res.ok) {
        setData(result.data || []);
        setPageCount(result.meta?.pagination?.pageCount || 1);
      } else {
        console.error("Error Response Strapi:", result);
        toast.error("Gagal mengambil data dari server.");
      }
    } catch (error) {
      console.error("Gagal mengambil data kegiatan:", error);
      toast.error("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger Fetch jika ada perubahan pada dependencies
  useEffect(() => {
    if (session) {
      fetchKegiatan();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortConfig, searchQuery, session]);

  // Handler Hapus Data
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus kegiatan ini?");
    if (!confirmDelete) return;

    const jwtToken = (session as any)?.jwt;
    const toastId = toast.loading("Menghapus data...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/events/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${jwtToken}` }
      });

      if (res.ok) {
        toast.success("Kegiatan berhasil dihapus!", { id: toastId });
        fetchKegiatan(); // Refresh tabel setelah hapus
      } else {
        throw new Error("Gagal menghapus data.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menghapus data.", { id: toastId });
    }
  };

  // Handler Sortir Kolom
  const handleSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Helper Icon Sortir
  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <span className="text-gray-300 material-symbols-outlined text-[14px]">unfold_more</span>;
    return sortConfig.direction === "asc" 
      ? <span className="text-black material-symbols-outlined text-[14px]">keyboard_arrow_up</span> 
      : <span className="text-black material-symbols-outlined text-[14px]">keyboard_arrow_down</span>;
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Kelola Kegiatan / Event Sekolah</h2>
          <p className="text-gray-500 text-sm">Daftar agenda kegiatan OSIS & Humas.</p>
        </div>
        <Link 
          href="/dashboard/event/tambah" 
          className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span> Tambah Kegiatan
        </Link>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-100 border-b-0 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Cari nama kegiatan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm text-gray-500 font-medium">Tampilkan:</span>
          <select 
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // Reset halaman ke 1 kalau ngubah jumlah data
            }}
            className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 outline-none focus:border-cyan-500 transition-all"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={-1}>Semua</option>
          </select>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-b-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100 text-gray-600 text-sm font-semibold select-none">
                <th className="p-4 pl-6 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("NamaKegiatan")}>
                  <div className="flex items-center justify-between gap-2">Nama Kegiatan {renderSortIcon("NamaKegiatan")}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("TanggalMulai")}>
                  <div className="flex items-center justify-between gap-2">Waktu Pelaksanaan {renderSortIcon("TanggalMulai")}</div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("Lokasi")}>
                  <div className="flex items-center justify-between gap-2">Lokasi Tempat {renderSortIcon("Lokasi")}</div>
                </th>
                <th className="p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort("TampilkanDiSidebar")}>
                  <div className="flex items-center justify-center gap-2">Status Sidebar {renderSortIcon("TampilkanDiSidebar")}</div>
                </th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 animate-pulse">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-cyan-500 rounded-full animate-spin"></div>
                      <p>Memuat data agenda...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                    <p>Data kegiatan tidak ditemukan.</p>
                  </td>
                </tr>
              ) : (
                data.map((item: any) => {
                  const attrs = item.attributes || item; // Support Strapi v4 dan v5
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-black">{attrs.NamaKegiatan}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 mt-1 max-w-sm">{attrs.DeskripsiSingkat}</div>
                      </td>
                      <td className="p-4 text-xs font-medium text-gray-600 font-mono">
                        {attrs.TanggalMulai ? new Date(attrs.TanggalMulai).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}) : "-"} 
                        {attrs.TanggalSelesai ? (
                          <>
                            <span className="text-gray-400 mx-1">s/d</span> 
                            {new Date(attrs.TanggalSelesai).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}
                          </>
                        ) : ""}
                      </td>
                      <td className="p-4 text-gray-500">{attrs.Lokasi || "-"}</td>
                      <td className="p-4 text-center">
                        {attrs.TampilkanDiSidebar ? (
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold border border-green-100 tracking-wider uppercase">Tampil</span>
                        ) : (
                          <span className="bg-gray-50 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200 tracking-wider uppercase">Sembunyi</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link 
                            href={`/dashboard/event/edit/${item.documentId || item.id}`}
                            className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                            title="Edit Data"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.documentId || item.id)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                            title="Hapus Data"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* COMPONENT PAGINASI */}
        {pageSize !== -1 && pageCount > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <span className="text-gray-500">Menampilkan Halaman <strong className="text-black">{page}</strong> dari <strong className="text-black">{pageCount}</strong></span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:bg-transparent disabled:border-gray-100 disabled:text-gray-300 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">chevron_left</span> Prev
              </button>
              <button 
                onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
                disabled={page === pageCount || loading}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:bg-transparent disabled:border-gray-100 disabled:text-gray-300 transition-colors flex items-center gap-1"
              >
                Next <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}