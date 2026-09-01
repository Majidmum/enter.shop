import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/shared/ProductCard';
import Pagination from '@/components/shared/Pagination';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { fetchProducts, fetchCategories, fetchBrands } from '@/lib/supabaseData';
import type { Product, Category, Brand } from '@/types';

const PAGE_SIZE = 12;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchBrands()])
      .then(([p, c, b]) => { setProducts(p); setCategories(c); setBrands(b); })
      .finally(() => setLoading(false));
  }, []);

  const category = categories.find((c) => c.slug === slug);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('featured');
  const [selBrands, setSelBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const categoryProducts = useMemo(() => {
    let list = category ? products.filter((p) => p.categoryId === category.id) : [];
    if (selBrands.length) list = list.filter((p) => selBrands.includes(p.brandId));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return list;
  }, [category, selBrands, priceRange, sort]);

  const totalPages = Math.ceil(categoryProducts.length / PAGE_SIZE);
  const paginated = categoryProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Категория не найдена</h2>
        <Link to="/categories" className="text-primary hover:underline">Вернуться к категориям</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <Breadcrumb items={[{ label: 'Категории', href: '/categories' }, { label: category.name }]} />

      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mt-4 mb-6 min-h-36 bg-secondary">
        <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="relative z-10 p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white">{category.name}</h1>
          <p className="text-white/70 mt-1">{category.productCount} товаров</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 shrink-0">
          <div className="rounded-xl bg-card border border-border p-4 sticky top-24">
            <p className="font-semibold text-sm mb-3">Бренд</p>
            <div className="flex flex-col gap-2 mb-5">
              {brands.map((br) => (
                <div key={br.id} className="flex items-center gap-2">
                  <Checkbox id={`br-${br.id}`} checked={selBrands.includes(br.id)} onCheckedChange={() => {
                    setSelBrands((prev) => prev.includes(br.id) ? prev.filter((b) => b !== br.id) : [...prev, br.id]);
                    setPage(1);
                  }} />
                  <Label htmlFor={`br-${br.id}`} className="text-sm font-normal cursor-pointer">{br.name}</Label>
                </div>
              ))}
            </div>
            <p className="font-semibold text-sm mb-2">Цена (сомони)</p>
            <Slider min={0} max={10000} step={100} value={priceRange}
              onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }} className="mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{priceRange[0].toLocaleString()}</span>
              <span>{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4 gap-3">
            <p className="text-sm text-muted-foreground">{categoryProducts.length} товаров</p>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="w-44 h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Популярные</SelectItem>
                <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
                <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
                <SelectItem value="rating">Лучший рейтинг</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <p className="text-muted-foreground py-16 text-center">В этой категории нет товаров с выбранными фильтрами.</p>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
