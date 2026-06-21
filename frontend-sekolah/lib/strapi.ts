import axios from 'axios';

// Di lib/strapi.ts
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';

export const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
});

// Helper untuk mempermudah link gambar dari Strapi
export const getStrapiMedia = (url: string | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800'; // fallback
  if (url.startsWith('http')) return url;
  return `${STRAPI_URL}${url}`;
};