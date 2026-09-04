import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/shared/ProductCard';
import Pagination from '@/components/shared/Pagination';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { Badge } from '@/components/ui/badge';
import { fetchProducts, fetchActivePromotions } from '@/lib/supabaseData';
import PageMeta from '@/components/common/PageMeta';
import type { Product, Promotion } from '@/types';

const PAGE_SIZE = 12;

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('discount');

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchActivePromotions().then(setActivePromotions);
  }, []);

  const saleProducts = products.filter((p) => !!p.discount).sort((a, b) => {
    if (sort === 'discount') return (b.discount || 0) - (a.discount || 0);
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    return (b.rating) - (a.rating);
  });

  const totalPages = Math.ceil(saleProducts.length / PAGE_SIZE);
  const paginated = saleProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="pb-16 md:pb-0">
      <PageMeta
        title="Акции и скидки — ENTER.TJ"
        description="Скидки до 20% на ноутбуки, ПК, мониторы, офисную мебель и аксессуары в ENTER.TJ. Актуальные акции и специальные предложения в Душанбе."
      />
      {/* Hero */}
      <div className="bg-gradient-to-r from-secondary via-secondary to-primary/80 text-white py-14">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Распродажа' }]} />
          <div className="mt-4 flex flex-col md:flex-row md:items-end gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-6 w-6 text-primary" />
                <span className="text-primary font-semibold uppercase tracking-wider text-sm">Специальные предложения</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold">Распродажа</h1>
              <p className="text-white/70 mt-2">Скидки до 20% на компьютеры, мебель и аксессуары</p>
            </div>
            <div className="md:ml-auto shrink-0">
              <div className="bg-primary/20 border border-primary/30 rounded-xl px-6 py-4 text-center">
                <p className="text-4xl font-bold">{saleProducts.length}</p>
                <p className="text-white/70 text-sm">товаров со скидкой</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active promotions */}
      {activePromotions.length > 0 && (
        <div className="bg-muted/50 border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <h2 className="text-lg font-bold mb-4">Активные акции</h2>
            <div className="flex flex-wrap gap-3">
              {activePromotions.map((promo) => (
                <div key={promo.id} className="bg-card border border-border rounded-xl px-5 py-3 card-shadow flex items-center gap-3">
                  <Badge className="bg-destructive text-white font-bold">-{promo.discount}%</Badge>
                  <div>
                    <p className="font-semibold text-sm">{promo.name}</p>
                    <p className="text-xs text-muted-foreground">До {promo.endDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <p className="text-muted-foreground">{saleProducts.length} товаров со скидкой</p>
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discount">Наибольшая скидка</SelectItem>
              <SelectItem value="price-asc">Цена: по возрастанию</SelectItem>
              <SelectItem value="price-desc">Цена: по убыванию</SelectItem>
              <SelectItem value="rating">Лучший рейтинг</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {paginated.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-card border border-border rounded-2xl p-8 text-center card-shadow">
          <h3 className="text-xl font-bold mb-2">Хотите увидеть весь каталог?</h3>
          <p className="text-muted-foreground mb-4">Более 2000 товаров по конкурентным ценам</p>
          <Link to="/catalog">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
              Перейти в каталог <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
