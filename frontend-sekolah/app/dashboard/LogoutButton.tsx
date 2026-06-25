"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span> Keluar
    </button>
  );
}