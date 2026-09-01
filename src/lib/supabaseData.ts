import { supabase } from '@/db/supabase';
import type { Product, Category, Brand, ProductSpec, Review } from '@/types';

// ============================================================================
// КАТЕГОРИИ
// ============================================================================

function rowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    image: row.image || '',
    productCount: row.product_count ?? 0,
    parentId: row.parent_id ?? undefined,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return (data || []).map(rowToCategory);
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  image?: string;
}): Promise<Category> {
  const slug = input.slug || slugify(input.name);
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: input.name,
      slug,
      image: input.image || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80',
    })
    .select()
    .single();
  if (error) throw error;
  return rowToCategory(data);
}

export async function updateCategory(
  id: string,
  patch: Partial<{ name: string; slug: string; image: string }>
): Promise<Category> {
  const { data, error } = await supabase.from('categories').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return rowToCategory(data);
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// БРЕНДЫ
// ============================================================================

function rowToBrand(row: any): Brand {
  return {
    id: row.id,
    name: row.name,
    logo: row.logo || '',
    description: row.description || '',
    status: row.status,
    productCount: row.product_count ?? 0,
  };
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return (data || []).map(rowToBrand);
}

export async function createBrand(input: {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  logo?: string;
}): Promise<Brand> {
  const { data, error } = await supabase
    .from('brands')
    .insert({
      name: input.name,
      description: input.description || '',
      status: input.status || 'active',
      logo: input.logo || '',
    })
    .select()
    .single();
  if (error) throw error;
  return rowToBrand(data);
}

export async function updateBrand(
  id: string,
  patch: Partial<{ name: string; description: string; status: 'active' | 'inactive'; logo: string }>
): Promise<Brand> {
  const { data, error } = await supabase.from('brands').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return rowToBrand(data);
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// ТОВАРЫ
// ============================================================================

function rowToProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    categoryId: row.category_id || '',
    categoryName: row.categories?.name || '',
    brandId: row.brand_id || '',
    brandName: row.brands?.name || '',
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    discount: row.discount != null ? Number(row.discount) : undefined,
    images: row.images || [],
    description: row.description || '',
    specs: (row.specs || []) as ProductSpec[],
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count || 0,
    stock: row.stock || 0,
    status: row.status,
    isNew: row.is_new || undefined,
    isFeatured: row.is_featured || undefined,
  };
}

const PRODUCT_SELECT = '*, categories(name), brands(name)';

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToProduct);
}

export interface ProductInput {
  name: string;
  slug?: string;
  sku?: string;
  categoryId?: string;
  brandId?: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  images: string[];
  description?: string;
  specs?: ProductSpec[];
  stock?: number;
  status?: 'active' | 'inactive';
  isNew?: boolean;
  isFeatured?: boolean;
}

function toDbPatch(input: Partial<ProductInput>) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.sku !== undefined) patch.sku = input.sku;
  if (input.categoryId !== undefined) patch.category_id = input.categoryId || null;
  if (input.brandId !== undefined) patch.brand_id = input.brandId || null;
  if (input.price !== undefined) patch.price = input.price;
  if (input.oldPrice !== undefined) patch.old_price = input.oldPrice ?? null;
  if (input.discount !== undefined) patch.discount = input.discount ?? null;
  if (input.images !== undefined) patch.images = input.images;
  if (input.description !== undefined) patch.description = input.description;
  if (input.specs !== undefined) patch.specs = input.specs;
  if (input.stock !== undefined) patch.stock = input.stock;
  if (input.status !== undefined) patch.status = input.status;
  if (input.isNew !== undefined) patch.is_new = input.isNew;
  if (input.isFeatured !== undefined) patch.is_featured = input.isFeatured;
  return patch;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const payload = toDbPatch(input);
  if (!payload.slug) payload.slug = slugify(input.name);
  if (!payload.sku) payload.sku = `SKU-${Date.now()}`;

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

export async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(toDbPatch(patch))
    .eq('id', id)
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw error;
  return rowToProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// ОТЗЫВЫ
// ============================================================================

const REVIEW_SELECT = '*, products(name)';

function rowToReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.products?.name || '',
    authorName: row.author_name,
    rating: row.rating,
    text: row.text || '',
    date: row.created_at ? String(row.created_at).split('T')[0] : '',
    status: row.status,
  };
}

/** Все отзывы, включая ожидающие модерации — только для админки (требует роль admin). */
export async function fetchReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToReview);
}

/** Только одобренные отзывы — доступно всем посетителям сайта. */
export async function fetchApprovedReviews(productId?: string): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select(REVIEW_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(rowToReview);
}

/**
 * Клиент оставляет отзыв. Новый отзыв уходит со статусом 'pending' —
 * он появится на сайте только после того, как админ его одобрит в AdminReviews.
 * ID генерируем на клиенте, чтобы не делать select() сразу после insert()
 * (гостю по RLS не разрешено читать ещё не одобренные отзывы, даже свои).
 */
export async function createReview(input: {
  productId: string;
  productName?: string;
  authorName: string;
  rating: number;
  text: string;
}): Promise<Review> {
  const id = crypto.randomUUID();
  const { error } = await supabase.from('reviews').insert({
    id,
    product_id: input.productId,
    author_name: input.authorName,
    rating: input.rating,
    text: input.text,
    status: 'pending',
  });
  if (error) throw error;
  return {
    id,
    productId: input.productId,
    productName: input.productName || '',
    authorName: input.authorName,
    rating: input.rating,
    text: input.text,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };
}

/** Админ одобряет/отклоняет отзыв. */
export async function updateReviewStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', id)
    .select(REVIEW_SELECT)
    .single();
  if (error) throw error;
  return rowToReview(data);
}

/** Админ вручную меняет оценку (звёзды) отзыва. */
export async function updateReviewRating(id: string, rating: number): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating })
    .eq('id', id)
    .select(REVIEW_SELECT)
    .single();
  if (error) throw error;
  return rowToReview(data);
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// ОФИС ПОД КЛЮЧ
// ============================================================================

export interface OfficePackage {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  priceLabel: string;
  employeesLabel?: string;
  features: string[];
  image?: string;
  isPopular: boolean;
  status: 'active' | 'inactive';
  sortOrder: number;
}

function rowToOfficePackage(row: any): OfficePackage {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || undefined,
    description: row.description || undefined,
    priceLabel: row.price_label,
    employeesLabel: row.employees_label || undefined,
    features: row.features || [],
    image: row.image || undefined,
    isPopular: !!row.is_popular,
    status: row.status,
    sortOrder: row.sort_order ?? 0,
  };
}

/** Публичный каталог — только активные пакеты, по порядку сортировки. */
export async function fetchActiveOfficePackages(): Promise<OfficePackage[]> {
  const { data, error } = await supabase
    .from('office_packages')
    .select('*')
    .eq('status', 'active')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToOfficePackage);
}

/** Для админки — вообще все пакеты, включая неактивные. */
export async function fetchAllOfficePackages(): Promise<OfficePackage[]> {
  const { data, error } = await supabase
    .from('office_packages')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToOfficePackage);
}

export interface OfficePackageInput {
  name: string;
  slug?: string;
  description?: string;
  priceLabel: string;
  employeesLabel?: string;
  features: string[];
  image?: string;
  isPopular?: boolean;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

function officePackageToDbPatch(input: Partial<OfficePackageInput>) {
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.slug !== undefined) patch.slug = input.slug;
  if (input.description !== undefined) patch.description = input.description;
  if (input.priceLabel !== undefined) patch.price_label = input.priceLabel;
  if (input.employeesLabel !== undefined) patch.employees_label = input.employeesLabel;
  if (input.features !== undefined) patch.features = input.features;
  if (input.image !== undefined) patch.image = input.image;
  if (input.isPopular !== undefined) patch.is_popular = input.isPopular;
  if (input.status !== undefined) patch.status = input.status;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  return patch;
}

export async function createOfficePackage(input: OfficePackageInput): Promise<OfficePackage> {
  const payload = officePackageToDbPatch(input);
  if (!payload.slug) payload.slug = slugify(input.name);
  const { data, error } = await supabase.from('office_packages').insert(payload).select().single();
  if (error) throw error;
  return rowToOfficePackage(data);
}

export async function updateOfficePackage(id: string, patch: Partial<OfficePackageInput>): Promise<OfficePackage> {
  const { data, error } = await supabase
    .from('office_packages')
    .update(officePackageToDbPatch(patch))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToOfficePackage(data);
}

export async function deleteOfficePackage(id: string): Promise<void> {
  const { error } = await supabase.from('office_packages').delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// НАСТРОЙКИ САЙТА (общие для всех посетителей, хранятся в Supabase)
// ============================================================================

/**
 * Получить настройки сайта (одна строка-объект в public.settings, data jsonb).
 * Читать может кто угодно (нужно для sendContactFormToTelegram и т.п.,
 * которые вызываются из браузера обычного посетителя, не только админа).
 */
export async function fetchSiteSettings(): Promise<Record<string, any>> {
  const { data, error } = await supabase.from('settings').select('data').eq('id', 1).maybeSingle();
  if (error) throw error;
  return (data?.data as Record<string, any>) || {};
}

/** Админ обновляет настройки — сливает patch с уже сохранёнными данными. */
export async function updateSiteSettings(patch: Record<string, any>): Promise<Record<string, any>> {
  const current = await fetchSiteSettings();
  const merged = { ...current, ...patch };
  const { data, error } = await supabase
    .from('settings')
    .update({ data: merged })
    .eq('id', 1)
    .select('data')
    .single();
  if (error) throw error;
  return (data?.data as Record<string, any>) || merged;
}

// ============================================================================
// УТИЛИТЫ
// ============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0400-\u04FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
