import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/shared/ProductCard';
import Pagination from '@/components/shared/Pagination';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { fetchProducts, fetchCategories, fetchBrands } from '@/lib/supabaseData';
import PageMeta from '@/components/common/PageMeta';
import type { Product, Category, Brand } from '@/types';

const PAGE_SIZE = 12;

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'new';

export default function CatalogPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories(), fetchBrands()])
      .then(([p, c, b]) => { setProducts(p); setCategories(c); setBrands(b); })
      .finally(() => setLoading(false));
  }, []);

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>('featured');
  const [selCategories, setSelCategories] = useState<string[]>([]);
  const [selBrands, setSelBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [catExpanded, setCatExpanded] = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQuery) list = list.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selCategories.length) list = list.filter((p) => selCategories.includes(p.categoryId));
    if (selBrands.length) list = list.filter((p) => selBrands.includes(p.brandId));
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (onlyInStock) list = list.filter((p) => p.stock > 0);
    if (onlyDiscount) list = list.filter((p) => !!p.discount);

    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'new': list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return list;
  }, [searchQuery, selCategories, selBrands, priceRange, onlyInStock, onlyDiscount, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleCategory = (id: string) => {
    setSelCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    setPage(1);
  };
  const toggleBrand = (id: string) => {
    setSelBrands((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
    setPage(1);
  };

  const clearFilters = () => {
    setSelCategories([]);
    setSelBrands([]);
    setPriceRange([0, 10000]);
    setOnlyInStock(false);
    setOnlyDiscount(false);
    setPage(1);
  };

  const hasFilters = selCategories.length > 0 || selBrands.length > 0 || onlyInStock || onlyDiscount || priceRange[0] > 0 || priceRange[1] < 10000;

  const FilterContent = (
    <div className="flex flex-col gap-5">
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/5">
          <X className="h-3.5 w-3.5" /> {t('catalog.reset_filters')}
        </Button>
      )}

      {/* Categories */}
      <div>
        <button className="flex w-full items-center justify-between font-semibold text-sm mb-2" onClick={() => setCatExpanded(!catExpanded)}>
          {t('catalog.category')} {catExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {catExpanded && (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox id={`cat-${cat.id}`} checked={selCategories.includes(cat.id)} onCheckedChange={() => toggleCategory(cat.id)} />
                <Label htmlFor={`cat-${cat.id}`} className="text-sm font-normal cursor-pointer">{cat.name}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div>
        <button className="flex w-full items-center justify-between font-semibold text-sm mb-2" onClick={() => setBrandExpanded(!brandExpanded)}>
          {t('catalog.brand')} {brandExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {brandExpanded && (
          <div className="flex flex-col gap-2">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center gap-2">
                <Checkbox id={`br-${brand.id}`} checked={selBrands.includes(brand.id)} onCheckedChange={() => toggleBrand(brand.id)} />
                <Label htmlFor={`br-${brand.id}`} className="text-sm font-normal cursor-pointer">{brand.name}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <p className="font-semibold text-sm mb-3">{t('catalog.price')}</p>
        <Slider
          min={0} max={10000} step={100}
          value={priceRange}
          onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }}
          className="mb-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{priceRange[0].toLocaleString()}</span>
          <span>{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Switches */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox id="instock" checked={onlyInStock} onCheckedChange={(v) => { setOnlyInStock(!!v); setPage(1); }} />
          <Label htmlFor="instock" className="text-sm font-normal cursor-pointer">{t('catalog.in_stock_only')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="discount" checked={onlyDiscount} onCheckedChange={(v) => { setOnlyDiscount(!!v); setPage(1); }} />
          <Label htmlFor="discount" className="text-sm font-normal cursor-pointer">{t('catalog.discount_only')}</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta
        title={searchQuery ? t('catalog.meta_title_search', { query: searchQuery }) : t('catalog.meta_title')}
        description={t('catalog.meta_description')}
      />
      <Breadcrumb items={[{ label: t('common.catalog') }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">
        {searchQuery ? t('catalog.search_title', { query: searchQuery }) : t('catalog.title')}
      </h1>

      <div className="flex gap-6">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-56 shrink-0">
          <div className="rounded-xl bg-card border border-border p-4 sticky top-24">
            {FilterContent}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden flex items-center gap-1.5">
                  <SlidersHorizontal className="h-4 w-4" /> {t('catalog.filters')} {hasFilters && <span className="h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{selCategories.length + selBrands.length}</span>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-4 overflow-y-auto">
                <h3 className="font-bold text-base mb-4">{t('catalog.filters')}</h3>
                {FilterContent}
              </SheetContent>
            </Sheet>

            <p className="text-sm text-muted-foreground flex-1 min-w-0">{t('catalog.products_found', { count: filtered.length })}</p>

            <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setPage(1); }}>
              <SelectTrigger className="w-44 h-8 text-sm">
                <SelectValue placeholder={t('catalog.sort_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('catalog.sort_featured')}</SelectItem>
                <SelectItem value="new">{t('catalog.sort_new')}</SelectItem>
                <SelectItem value="price-asc">{t('catalog.sort_price_asc')}</SelectItem>
                <SelectItem value="price-desc">{t('catalog.sort_price_desc')}</SelectItem>
                <SelectItem value="rating">{t('catalog.sort_rating')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">{t('common.loading')}</div>
          ) : paginated.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-lg">{t('catalog.not_found')}</p>
              <Button variant="outline" onClick={clearFilters} className="mt-3">{t('catalog.reset_filters')}</Button>
            </div>
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
