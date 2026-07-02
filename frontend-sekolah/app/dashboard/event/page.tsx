/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function EventDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Paginasi
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [pageSize, setPageSize] = useState<number | string>(10);
  
  // State Filter & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshToggle, setRefreshToggle] = useState(0);

  useEffect(() => {
    const fetchKegiatan = async () => {
      const jwtToken = (session as any)?.jwt;
      if (!jwtToken) return;

      setLoading(true);
      try {
        // Filter pencarian berdasarkan NamaKegiatan ATAU Lokasi
        const searchFilter = searchTerm 
          ? `&filters[$or][0][NamaKegiatan][$containsi]=${searchTerm}&filters[$or][1][Lokasi][$containsi]=${searchTerm}` 
          : "";
        
        const sortQuery = `&sort=${sortField}:${sortOrder}`;
        const currentLimit = pageSize === "Semua" ? 1000 : pageSize;
        const currentPage = pageSize === "Semua" ? 1 : page;
        
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/events?pagination[page]=${currentPage}&pagination[pageSize]=${currentLimit}${sortQuery}${searchFilter}&populate=*`;

        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${jwtToken}` },
          cache: "no-store"
        });
        
        const result = await res.json();
        
        if (res.ok) {
          setData(result.data || []);
          setPageCount(result.meta?.pagination?.pageCount || 1);
        } else {
          console.error("Error Response Strapi:", result);
          toast.error("Gagal memuat data dari server.");
        }
      } catch (error) {
        console.error("Gagal mengambil data kegiatan:", error);
        toast.error("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    // Efek Debounce 500ms
    const delayDebounce = setTimeout(() => {
      if (session) fetchKegiatan();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [page, pageSize, searchTerm, sortField, sortOrder, refreshToggle, session]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: string | number) => {
    const result = await Swal.fire({
      title: "Hapus Kegiatan?",
      text: "Data agenda kegiatan ini akan dihapus secara permanen dan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1f2937",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: { popup: 'rounded-2xl' }
    });

    if (!result.isConfirmed) return;

    const jwtToken = (session as any)?.jwt;
    const toastId = toast.loading("Menghapus data...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"}/api/events/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${jwtToken}` }
      });

      if (!res.ok) throw new Error("Gagal menghapus data di server.");

      toast.success("Kegiatan berhasil dihapus!", { id: toastId });
      setRefreshToggle(prev => prev + 1); 
      
      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menghapus data.", { id: toastId });
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <span className="text-gray-300 material-symbols-outlined text-[14px] ml-1">unfold_more</span>;
    return (
      <span className="text-black material-symbols-outlined text-[14px] ml-1">
        {sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
      </span>
    );
  };

  return (
    <div>
      <Toaster position="top-center" />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Kelola Kegiatan / Event Sekolah</h2>
          <p className="text-gray-500 text-sm">Daftar agenda kegiatan OSIS & Humas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Cari nama atau lokasi..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black w-full sm:w-72"
            />
          </div>

          <Link 
            href="/dashboard/event/tambah" 
            className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">add</span> Tambah Kegiatan
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold select-none">
                <th className="p-4 pl-6 cursor-pointer hover:bg-gray-100 transition-colors w-1/3" onClick={() => handleSort('NamaKegiatan')}>
                  <div className="flex items-center">Nama Kegiatan <SortIcon field="NamaKegiatan" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('TanggalMulai')}>
                  <div className="flex items-center">Waktu Pelaksanaan <SortIcon field="TanggalMulai" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Lokasi')}>
                  <div className="flex items-center">Lokasi Tempat <SortIcon field="Lokasi" /></div>
                </th>
                <th className="p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('TampilkanDiSidebar')}>
                  <div className="flex items-center justify-center">Status Sidebar <SortIcon field="TampilkanDiSidebar" /></div>
                </th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 animate-pulse">
                    <span className="material-symbols-outlined block text-3xl mb-2 animate-spin">refresh</span>
                    Memuat data agenda...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">event_busy</span>
                    Tidak ada kegiatan yang ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item: any) => {
                  const attrs = item.attributes || item;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="font-bold text-black">{attrs.NamaKegiatan}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 mt-0.5 max-w-sm">{attrs.DeskripsiSingkat}</div>
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
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"
                            title="Edit Data"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.documentId || item.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                            title="Hapus Data"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
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

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <span className="text-gray-500 font-medium">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === "Semua" ? "Semua" : Number(val));
                setPage(1);
              }}
              className="border border-gray-200 text-black font-semibold rounded-lg text-xs py-1.5 px-3 focus:outline-none focus:border-black cursor-pointer bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="Semua">Semua</option>
            </select>
          </div>

          <div className="text-gray-500 w-full md:w-auto text-center">
            {pageSize === "Semua" ? (
              <span>Menampilkan <strong>Semua</strong> Data</span>
            ) : (
              <span>
                Halaman <strong className="text-black">{page}</strong> dari <strong className="text-black">{pageCount}</strong>
              </span>
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
            <button 
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1 || loading || pageSize === "Semua"}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Sebelumnya
            </button>
            <button 
              onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              disabled={page === pageCount || loading || pageSize === "Semua"}
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