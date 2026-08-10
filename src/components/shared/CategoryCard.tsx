import { Link } from 'react-router-dom';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link to={`/category/${category.slug}`} className="group flex flex-col rounded-xl overflow-hidden bg-card border border-border card-shadow hover:hover-shadow transition-all duration-300">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
          {category.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{category.productCount} products</p>
      </div>
    </Link>
  );
}
