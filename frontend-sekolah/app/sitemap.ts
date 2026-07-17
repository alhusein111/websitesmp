import { MetadataRoute } from 'next';
import { strapi } from '@/lib/strapi';

// URL utama website kamu
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://smpyapialhusaeni.sch.id';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Definisikan Halaman Statis (Termasuk /profil dari kodemu sebelumnya)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/spmb`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/berita`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/mading`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/kalender`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/profil`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Fetching Data Berita dari Strapi
  let beritaRoutes: MetadataRoute.Sitemap = [];
  try {
    const resBerita = await strapi.get('/artikels?fields[0]=Slug&fields[1]=updatedAt&pagination[limit]=1000');
    const artikels = resBerita.data?.data || [];
    
    beritaRoutes = artikels.map((artikel: any) => {
      const data = artikel.attributes || artikel;
      const slug = data.Slug || artikel.id; 
      
      return {
        url: `${BASE_URL}/berita/${slug}`,
        lastModified: new Date(data.updatedAt || new Date()),
        changeFrequency: 'weekly',
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error('Gagal mengambil data berita untuk sitemap:', error);
  }

  // 3. Fetching Data Mading dari Strapi
  let madingRoutes: MetadataRoute.Sitemap = [];
  try {
    const resMading = await strapi.get('/madings?fields[0]=Slug&fields[1]=updatedAt&pagination[limit]=1000');
    const madings = resMading.data?.data || [];
    
    madingRoutes = madings.map((mading: any) => {
      const data = mading.attributes || mading;
      const slug = data.Slug || mading.id;
      
      return {
        url: `${BASE_URL}/mading/${slug}`,
        lastModified: new Date(data.updatedAt || new Date()),
        changeFrequency: 'monthly',
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error('Gagal mengambil data mading untuk sitemap:', error);
  }

  // 4. Gabungkan Semua Route
  return [...staticRoutes, ...beritaRoutes, ...madingRoutes];
}