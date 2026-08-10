import CategoryCard from '@/components/shared/CategoryCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { categories } from '@/lib/mockData';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <Breadcrumb items={[{ label: 'Категории' }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">Все категории</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
