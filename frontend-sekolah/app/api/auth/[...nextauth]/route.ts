/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Akun Sekolah",
      credentials: {
        identifier: { label: "Email / Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          /// LANGKAH 1: Tembak API Login bawaan Strapi untuk ambil JWT Token & ID User
          const loginRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
            method: 'POST',
            body: JSON.stringify({
              identifier: credentials?.identifier,
              password: credentials?.password,
            }),
            headers: { "Content-Type": "application/json" }
          });

          const loginData = await loginRes.json();

          if (loginRes.ok && loginData.user) {
            const jwt = loginData.jwt;
            const userId = loginData.user.id; // Ambil ID User (Misal: 1)

            // LANGKAH 2: Tembak API User menggunakan ID dan tarik SEMUA relasinya (bintang)
            const userRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/${userId}?populate=*`, {
              method: 'GET',
              headers: {
                "Authorization": `Bearer ${jwt}`
              },
              cache: 'no-store'
            });

            const userData = await userRes.json();

            // Pantau data aslinya di terminal mas brow
            console.log("=== KATA STRAPI V5 SOAL ROLE ===", userData);
            
            // Ambil nama role spesifik (contoh: OSIS, Humas). 
            // Jika kosong, baru fallback ke "Authenticated"
            const roleName = userData.role?.name || "Authenticated";

            return {
              id: loginData.user.id.toString(),
              name: loginData.user.username,
              email: loginData.user.email,
              jwt: jwt,
              role: roleName // Nah, sekarang role aslinya masuk ke sini!
            };
          }
          return null;
        } catch (e) {
          console.error("Login Error:", e);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.jwt = (user as any).jwt;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id as string,
        role: token.role as string,
      } as any;
      (session as any).jwt = token.jwt;
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };