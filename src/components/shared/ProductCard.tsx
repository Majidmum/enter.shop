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
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
    toast(fav ? 'Removed from favorites' : 'Added to favorites');
  };

  return (
    <div className={`group relative flex flex-col rounded-xl bg-card border border-border card-shadow hover:hover-shadow transition-all duration-300 overflow-hidden ${className}`}>
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.discount && (
          <Badge className="bg-destructive text-white text-xs font-bold px-1.5 py-0.5">
            -{product.discount}%
          </Badge>
        )}
        {product.isNew && (
          <Badge className="bg-accent text-white text-xs font-bold px-1.5 py-0.5">NEW</Badge>
        )}
      </div>

      {/* Favorite button */}
      <button
        onClick={handleToggleFavorite}
        className={`absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
          fav ? 'bg-primary text-white' : 'bg-white/80 text-muted-foreground hover:text-primary hover:bg-white'
        }`}
      >
        <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
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
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <Link to={`/product/${product.slug}`} className="block">
          <p className="text-xs text-muted-foreground">{product.brandName}</p>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Availability */}
        <p className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
          {product.stock > 0 ? `In stock` : 'Out of stock'}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-base font-bold text-foreground">{product.price.toLocaleString()} TJS</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{product.oldPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Add to cart */}
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full mt-1 bg-primary hover:bg-primary/90 text-white"
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
