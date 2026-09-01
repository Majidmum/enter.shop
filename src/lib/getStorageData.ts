import { banners as mockBanners } from './mockData';
import type { Banner } from '@/types';

/**
 * Получить баннеры из localStorage или вернуть данные по умолчанию.
 * (Товары/категории/бренды теперь берутся из Supabase — см. src/lib/supabaseData.ts)
 */
export function getBanners(): Banner[] {
  if (typeof window === 'undefined') return mockBanners;
  const saved = localStorage.getItem('admin_banners');
  return saved ? JSON.parse(saved) : mockBanners;
}
