import { products as mockProducts, categories as mockCategories, brands as mockBrands, banners as mockBanners } from './mockData';
import type { Product, Category, Brand, Banner } from '@/types';

/**
 * Получить товары из localStorage или вернуть данные по умолчанию
 */
export function getProducts(): Product[] {
  if (typeof window === 'undefined') return mockProducts;
  const saved = localStorage.getItem('admin_products');
  return saved ? JSON.parse(saved) : mockProducts;
}

/**
 * Получить категории из localStorage или вернуть данные по умолчанию
 */
export function getCategories(): Category[] {
  if (typeof window === 'undefined') return mockCategories;
  const saved = localStorage.getItem('admin_categories');
  return saved ? JSON.parse(saved) : mockCategories;
}

/**
 * Получить бренды из localStorage или вернуть данные по умолчанию
 */
export function getBrands(): Brand[] {
  if (typeof window === 'undefined') return mockBrands;
  const saved = localStorage.getItem('admin_brands');
  return saved ? JSON.parse(saved) : mockBrands;
}

/**
 * Получить баннеры из localStorage или вернуть данные по умолчанию
 */
export function getBanners(): Banner[] {
  if (typeof window === 'undefined') return mockBanners;
  const saved = localStorage.getItem('admin_banners');
  return saved ? JSON.parse(saved) : mockBanners;
}
