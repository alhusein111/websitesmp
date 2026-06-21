import Link from 'next/link';

export default function SPMBPage() {
  return (
    <main className="w-full pb-20 pt-10 bg-[#f7f9fb] min-h-screen flex flex-col">
      
      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 z-10">
            <span className="inline-block font-mono text-[10px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full bg-cyan-100 text-cyan-800">
              SELEKSI PENERIMAAN MURID BARU
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-black font-bold leading-tight tracking-tight">
              Membangun Generasi <br/>Cerdas & Berakhlak.
            </h1>
            <p className="font-body text-lg text-gray-600 max-w-xl leading-relaxed">
              Bergabunglah bersama kami di SMP YAPI AL-HUSAENI. Proses pendaftaran SPMB kini lebih mudah, cepat, dan transparan melalui layanan aplikasi terpadu kami.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              {/* TODO: Ganti href dengan link Aplikasi SPMB Mas Brow di masa depan */}
              <Link href="#" className="inline-flex items-center justify-center bg-black text-white font-mono text-xs font-bold px-8 py-4 rounded-xl hover:bg-gray-800 hover:-translate-y-1 transition-all duration-300 shadow-md">
                Aplikasi Pendaftaran SPMB
              </Link>
              <a href="#biaya" className="inline-flex items-center justify-center border-2 border-gray-200 text-black font-mono text-xs font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-300">
                Informasi Biaya
              </a>
            </div>
          </div>

          <div className="relative h-100 md:h-125 rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            {/* Ganti dengan gambar pendaftaran yang sesuai */}
            <img 
              alt="Siswa SMP belajar" 
              className="w-full h-full object-cover" 
              src="/spmb2026.png" 
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent"></div>
          </div>

        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white py-12 border-y border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="font-display text-4xl font-bold text-black">A</div>
              <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wide">Akreditasi Sekolah</div>
            </div>
            <div className="space-y-2">
              <div className="font-display text-4xl font-bold text-black">98%</div>
              <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wide">Tingkat Kelulusan</div>
            </div>
            <div className="space-y-2">
              <div className="font-display text-4xl font-bold text-black">5+</div>
              <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wide">Ekstrakurikuler</div>
            </div>
            <div className="space-y-2">
              <div className="font-display text-4xl font-bold text-black">15:1</div>
              <div className="font-mono text-xs font-bold text-gray-500 uppercase tracking-wide">Rasio Siswa & Guru</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID: ALUR & SYARAT */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-display text-3xl font-bold text-black">Informasi Pendaftaran SPMB</h2>
          <p className="font-body text-gray-600">Pahami alur dan persiapkan dokumen yang dibutuhkan untuk kelancaran proses Seleksi Penerimaan Murid Baru.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Kiri: Alur Pendaftaran */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3 mb-8 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-800 font-bold">
                <span className="material-symbols-outlined text-sm">route</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-black">Alur Pendaftaran</h3>
            </div>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-cyan-300 before:via-gray-200 before:to-transparent">
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-800 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 border-4 border-white">1</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black mb-1">Akses Aplikasi SPMB</h4>
                  <p className="text-sm text-gray-600">Buka link aplikasi pendaftaran SPMB sekolah yang telah disediakan.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-black font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 border-4 border-white">2</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black mb-1">Buat Akun & Isi Data</h4>
                  <p className="text-sm text-gray-600">Registrasi akun baru, kemudian lengkapi formulir biodata calon siswa.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-black font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 border-4 border-white">3</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black mb-1">Unggah Dokumen</h4>
                  <p className="text-sm text-gray-600">Scan dan unggah berkas persyaratan yang diminta ke dalam sistem.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-black font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 border-4 border-white">4</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-black mb-1">Cetak Bukti Pendaftaran</h4>
                  <p className="text-sm text-gray-600">Unduh kartu peserta untuk dibawa saat tes akademik dan wawancara.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Kanan: Persyaratan Pendaftaran */}
          <div className="lg:col-span-5 bg-black text-white rounded-3xl p-8 md:p-10 shadow-xl flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center space-x-3 mb-8 border-b border-white/20 pb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                <span className="material-symbols-outlined text-sm">fact_check</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white">Syarat Dokumen</h3>
            </div>
            
            <ul className="space-y-4 grow font-body text-gray-300 text-sm">
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi Ijazah SD/MI yang dilegalisir (1 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi Surat Keterangan Lulus (1 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi Akta Kelahiran (1 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi Kartu Keluarga (KK) (1 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Pas Foto berwarna ukuran 3x4 (2 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Surat Keterangan Berkelakuan Baik dari sekolah asal</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi KTP Orang Tua (1 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi Raport (1 rangkap)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Fotokopi KIP/PKH/KKS (1 lembar)</span>
              </li>
              <li className="flex items-start">
                <span className="material-symbols-outlined text-amber-400 mr-3 mt-0.5 text-xl">check_circle</span>
                <span>Formulir Pendaftaran (1 berkas)</span>
              </li>
            </ul>

            <div className="mt-8 bg-white/10 p-4 rounded-xl border border-white/20">
              <p className="text-xs italic text-gray-400 leading-relaxed">* Semua dokumen fisik dimasukkan ke dalam map snelhecter (Biru untuk Putra, Merah untuk Putri) dan diserahkan saat wawancara.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. INFORMASI BIAYA & BROSUR SECTION */}
      <section id="biaya" className="bg-white py-20 border-t border-gray-200/60 mt-auto">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          
          {/* DIPERBAIKI: Hapus 'inline-block' karena bentrok dengan 'flex', tambah 'leading-none' */}
          <div className="mx-auto w-16 h-16 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-3xl leading-none">payments</span>
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-black mb-6">
            Informasi Biaya & Brosur SPMB
          </h2>
          <p className="font-body text-lg text-gray-600 mb-10 leading-relaxed">
            Untuk menjaga transparansi serta menyesuaikan dengan gelombang pendaftaran, informasi detail mengenai rincian biaya pendidikan, administrasi pendaftaran, dan skema pembayaran dapat dikonsultasikan langsung melalui <b>Teller Pembayaran</b> kami. Anda juga dapat mengunduh brosur resmi untuk mendapatkan ringkasan informasi sekolah.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* TODO: Masukkan file brosur .pdf di dalam folder public/ */}
            {/* DIPERBAIKI: Tambah 'leading-none' pada icon, gap disesuaikan, teks dibungkus <span> */}
            <a href="/brosur-spmb.pdf" download className="w-full sm:w-auto inline-flex items-center justify-center bg-white border-2 border-gray-200 text-black font-mono text-xs font-bold px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-black transition-all duration-300 shadow-sm gap-2.5 group">
              <span className="material-symbols-outlined text-[20px] leading-none group-hover:-translate-y-0.5 transition-transform">download</span>
              <span>UNDUH BROSUR</span>
            </a>
            
            {/* TODO: Ganti nomor WA di bawah */}
            {/* DIPERBAIKI: Tambah 'leading-none' pada icon, gap disesuaikan, teks dibungkus <span> */}
            <a href="https://wa.me/628987973039" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center bg-[#25D366] text-white font-mono text-xs font-bold px-8 py-4 rounded-xl hover:bg-[#1ebd5b] hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-green-500/30 gap-2.5 group">
              <span className="material-symbols-outlined text-[20px] leading-none group-hover:scale-110 transition-transform">chat</span>
              <span>TANYA TELLER PENDAFTARAN</span>
            </a>
          </div>
          
        </div>
      </section>

    </main>
  );
}