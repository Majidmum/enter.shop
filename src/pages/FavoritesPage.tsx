import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function FavoritesPage() {
  const { items, removeItem } = useFavoritesStore();
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <Breadcrumb items={[{ label: 'Favorites' }]} />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Heart className="h-16 w-16 text-muted" />
          <h2 className="text-xl font-bold">No favorites yet</h2>
          <p className="text-muted-foreground text-sm">Save products you love</p>
          <Link to="/catalog"><Button className="bg-primary hover:bg-primary/90 text-white mt-2">Go to Catalog</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <Breadcrumb items={[{ label: 'Favorites' }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">Favorites ({items.length})</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((product) => (
          <div key={product.id} className="flex gap-4 rounded-xl bg-card border border-border p-4 card-shadow">
            <Link to={`/product/${product.slug}`} className="shrink-0">
              <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
            </Link>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">{product.brandName}</p>
              <Link to={`/product/${product.slug}`}>
                <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
              </Link>
              <p className="font-bold text-foreground mt-auto">{product.price.toLocaleString()} TJS</p>
              <div className="flex gap-2 mt-1">
                <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-white text-xs"
                  onClick={() => { addToCart(product); toast.success('Added to cart'); }}>
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Buy
                </Button>
                <Button size="sm" variant="outline" onClick={() => removeItem(product.id)}
                  className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
