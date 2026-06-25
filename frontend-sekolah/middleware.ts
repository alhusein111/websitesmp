import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 1. Cek apakah user bawa tiket (token JWT NextAuth)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const url = req.nextUrl.clone();

  // 2. KONDISI A: Kalau SUDAH login tapi iseng ketik URL /login
  // Satpam akan langsung arahkan paksa ke /dashboard
  if (token && url.pathname === "/login") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 3. KONDISI B: Kalau BELUM login tapi iseng nyelonong ke /dashboard
  // Satpam akan langsung tendang kembali ke /login
  if (!token && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Kalau tidak melanggar aturan di atas, biarkan lewat
  return NextResponse.next();
}

// 4. Daftarkan rute mana saja yang mau diawasi oleh Satpam ini
export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};