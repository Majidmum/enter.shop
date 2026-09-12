import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();
  const fav = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
    toast(fav ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  return (
    <div className={`group relative flex flex-col rounded-lg bg-card border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 overflow-hidden ${className}`}>
      {/* Badges */}
      <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
        {product.discount && (
          <Badge className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0 h-4 leading-4">
            -{product.discount}%
          </Badge>
        )}
        {product.isNew && (
          <Badge className="bg-accent text-white text-[10px] font-bold px-1.5 py-0 h-4 leading-4">
            NEW
          </Badge>
        )}
        {!product.isNew && product.isFeatured && (
          <Badge className="bg-primary text-white text-[10px] font-bold px-1.5 py-0 h-4 leading-4">
            ХИТ
          </Badge>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-200 ${
          fav ? 'bg-primary text-white' : 'bg-white/85 text-muted-foreground hover:text-primary hover:bg-white'
        }`}
      >
        <Heart className={`h-3.5 w-3.5 ${fav ? 'fill-current' : ''}`} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="aspect-square w-full overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2 gap-1">
        <Link to={`/product/${product.slug}`} className="block">
          <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.2em]">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm sm:text-base font-bold text-foreground">{product.price.toLocaleString()} сом.</span>
          {product.oldPrice && (
            <span className="text-[11px] text-destructive line-through">{product.oldPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
            <span className="text-[11px] text-muted-foreground">{product.rating} ({product.reviewCount})</span>
          </div>
        )}

        {product.stock === 0 && (
          <p className="text-[11px] font-medium text-destructive">Нет в наличии</p>
        )}

        {/* Add to cart */}
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mt-auto h-7 text-xs bg-primary hover:bg-primary/90 text-white"
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
          В корзину
        </Button>
      </div>
    </div>
  );
}
