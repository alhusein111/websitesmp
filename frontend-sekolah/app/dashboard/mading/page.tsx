/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

function getCategoryColor(kategori: string): string {
  const normalizedCategory = kategori ? kategori.toLowerCase() : "";
  
  switch (normalizedCategory) {
    case 'puisi': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'cerpen': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'komik': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'poster': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'lukisan': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'video': return 'bg-red-100 text-red-700 border-red-200';
    case 'artikel siswa': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function MadingDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  // PERBAIKAN: State pageSize dibuat dinamis (bisa number, bisa string untuk "Semua")
  const [pageSize, setPageSize] = useState<number | string>(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [refreshToggle, setRefreshToggle] = useState(0);

  useEffect(() => {
    const fetchMading = async () => {
      setLoading(true);
      try {
        // PERBAIKAN: Filter pencarian sekarang mencari di Judul, Penulis, ATAU Kelas
        const searchFilter = searchTerm 
          ? `&filters[$or][0][Judul][$containsi]=${searchTerm}&filters[$or][1][Penulis][$containsi]=${searchTerm}&filters[$or][2][Kelas][$containsi]=${searchTerm}` 
          : "";
        
        const sortQuery = `&sort=${sortField}:${sortOrder}`;
        
        // Atur ukuran halaman. Jika "Semua", kita set limit besar (misal 1000) dan force ke halaman 1
        const currentLimit = pageSize === "Semua" ? 1000 : pageSize;
        const currentPage = pageSize === "Semua" ? 1 : page;
        
        const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/madings?pagination[page]=${currentPage}&pagination[pageSize]=${currentLimit}${sortQuery}${searchFilter}`;

        const res = await fetch(url, { cache: "no-store" });
        const result = await res.json();
        
        if (res.ok) {
          setData(result.data || []);
          setPageCount(result.meta?.pagination?.pageCount || 1);
        }
      } catch (error) {
        console.error("Gagal mengambil data mading:", error);
        toast.error("Gagal memuat data dari server.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchMading();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [page, pageSize, searchTerm, sortField, sortOrder, refreshToggle]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Hapus Karya?",
      text: "Data mading ini akan dihapus secara permanen dan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#1f2937",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: {
        popup: 'rounded-2xl',
      }
    });

    if (!result.isConfirmed) return;

    const jwtToken = (session as any)?.jwt;
    if (!jwtToken) {
      toast.error("Akses ditolak. Token tidak ditemukan.");
      return;
    }

    const toastId = toast.loading("Menghapus data...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/madings/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${jwtToken}`
        }
      });

      if (!res.ok) throw new Error("Gagal menghapus data di server.");

      toast.success("Karya mading berhasil dihapus!", { id: toastId });
      
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
          <h2 className="text-2xl font-bold">Kelola Mading Digital</h2>
          <p className="text-gray-500 text-sm">Daftar karya kreativitas tulis dan seni dari siswa-siswi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Cari judul, penulis, kelas..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black w-full sm:w-72"
            />
          </div>

          <Link 
            href="/dashboard/mading/tambah" 
            className="bg-black text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">add</span> Tambah Mading
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm font-semibold select-none">
                <th className="p-4 pl-6 cursor-pointer hover:bg-gray-100 transition-colors w-1/3" onClick={() => handleSort('Judul')}>
                  <div className="flex items-center">Judul Karya <SortIcon field="Judul" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Penulis')}>
                  <div className="flex items-center">Kreator (Siswa) <SortIcon field="Penulis" /></div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Kategori')}>
                  <div className="flex items-center">Kategori <SortIcon field="Kategori" /></div>
                </th>
                <th className="p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('Likes')}>
                  <div className="flex items-center justify-center">Respon <SortIcon field="Likes" /></div>
                </th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 animate-pulse">
                    <span className="material-symbols-outlined block text-3xl mb-2 animate-spin">refresh</span>
                    Memuat data mading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <span className="material-symbols-outlined block text-4xl mb-2 opacity-50">search_off</span>
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-black line-clamp-1">{item.Judul}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Rilis: {item.Tanggal ? new Date(item.Tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : "-"}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{item.Penulis || "Anonim"}</div>
                      <div className="text-xs text-gray-500">Kelas {item.Kelas || "-"}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-bold border uppercase tracking-wider ${getCategoryColor(item.Kategori)}`}>
                        {item.Kategori || "Lainnya"}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-xs whitespace-nowrap">
                      <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded border border-green-100">
                        👍 {item.Likes || 0}
                      </span>
                      <span className="text-gray-300 mx-1.5">/</span>
                      <span className="text-red-500 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">
                        👎 {item.Dislikes || 0}
                      </span>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/dashboard/mading/edit/${item.documentId || item.id}`}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PERBAIKAN: Footer Paginasi dengan View Dropdown */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center text-sm gap-4">
          
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <span className="text-gray-500 font-medium">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = e.target.value;
                setPageSize(val === "Semua" ? "Semua" : Number(val));
                setPage(1); // Balik ke halaman 1 saat ganti ukuran
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