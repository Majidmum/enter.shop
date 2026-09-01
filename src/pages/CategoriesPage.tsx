import { useState, useEffect } from 'react';
import CategoryCard from '@/components/shared/CategoryCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import PageMeta from '@/components/common/PageMeta';
import { fetchCategories } from '@/lib/supabaseData';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories().then(setCategories).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta
        title="Все категории товаров — ENTER.TJ"
        description="Все категории компьютерной техники и офисной мебели в интернет-магазине ENTER.TJ: ноутбуки, ПК, мониторы, принтеры, мебель и аксессуары."
      />
      <Breadcrumb items={[{ label: 'Категории' }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">Все категории</h1>
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
