import { supabase } from '@/db/supabase';
import type { Product, Category, Brand, ProductSpec } from '@/types';

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
