export default function Footer() {
  return (
    <footer className="bg-black text-white rounded-t-xl mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto px-6 md:px-12 py-12">
        <div>
          <div className="font-display text-xl font-bold text-white mb-4">SMP YAPI AL-HUSAENI</div>
          <p className="text-gray-400 font-body text-sm mb-6 leading-relaxed">
            Mendidik generasi unggul, berakhlak mulia, dan berwawasan global.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-gray-400 hover:text-yellow-500 cursor-pointer">photo_camera</span>
            <span className="material-symbols-outlined text-gray-400 hover:text-yellow-500 cursor-pointer">smart_display</span>
            <span className="material-symbols-outlined text-gray-400 hover:text-yellow-500 cursor-pointer">chat</span>
          </div>
        </div>
        <div>
          <h4 className="font-mono text-xs font-bold tracking-widest text-gray-300 mb-4">TAUTAN PENTING</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-400">
            <li><a className="hover:text-yellow-500 transition-colors" href="#">Instagram</a></li>
            <li><a className="hover:text-yellow-500 transition-colors" href="#">YouTube</a></li>
            <li><a className="hover:text-yellow-500 transition-colors" href="#">WhatsApp</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-xs font-bold tracking-widest text-gray-300 mb-4">SISTEM</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-400">
            <li><a className="hover:text-yellow-500 transition-colors" href="http://localhost:1337/admin">CMS Login</a></li>
            <li><a className="hover:text-yellow-500 transition-colors" href="#">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-mono text-xs font-bold tracking-widest text-gray-300 mb-4">KONTAK KAMI</h4>
          <address className="text-sm text-gray-400 not-italic leading-relaxed">
            Kp. Lebakbiru, Desa Ciheulang Kecamatan Ciparay<br />
            Kabupaten Bandung, 40381<br />
            Email: smpalhusaenilebakbiru@gmail.com
          </address>
        </div>
      </div>
      <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        © 2026 SMP YAPI AL-HUSAENI. All Rights Reserved.
      </div>
    </footer>
  );
}