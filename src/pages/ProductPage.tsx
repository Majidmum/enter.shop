import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/shared/ProductCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { products } from '@/lib/mockData';
import { reviews as allReviews } from '@/lib/mockData';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { toast } from 'sonner';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = products.find((p) => p.slug === slug);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Product Not Found</h2>
        <Link to="/catalog" className="text-primary hover:underline">Back to Catalog</Link>
      </div>
    );
  }

  const fav = isFavorite(product.id);
  const productReviews = allReviews.filter((r) => r.productId === product.id && r.status === 'approved');
  const similar = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/checkout';
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <Breadcrumb items={[
        { label: 'Catalog', href: '/catalog' },
        { label: product.categoryName, href: `/category/${product.slug.split('-')[0]}` },
        { label: product.name },
      ]} />

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted relative">
            <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
            {product.discount && (
              <Badge className="absolute top-3 left-3 bg-destructive text-white">-{product.discount}%</Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-primary' : 'border-border'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Brand: <span className="text-primary font-medium">{product.brandName}</span></p>
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{product.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">SKU: {product.sku}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
              ))}
            </div>
            <span className="text-sm text-primary font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{product.price.toLocaleString()} TJS</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">{product.oldPrice.toLocaleString()} TJS</span>
            )}
            {product.discount && (
              <Badge className="bg-destructive/10 text-destructive">Save {((product.oldPrice! - product.price)).toLocaleString()} TJS</Badge>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <><Check className="h-4 w-4 text-green-600" /><span className="text-sm font-medium text-green-600">In Stock ({product.stock} pcs)</span></>
            ) : (
              <span className="text-sm font-medium text-destructive">Out of Stock</span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-9 w-9 items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="flex h-9 w-9 items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={handleBuyNow} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={product.stock === 0}>
                Buy Now
              </Button>
              <Button onClick={handleAddToCart} variant="outline" className="flex-1" disabled={product.stock === 0}>
                <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
              </Button>
              <Button onClick={() => toggle(product)} variant="outline" size="icon"
                className={fav ? 'border-primary text-primary' : ''}>
                <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Benefits */}
          <div className="rounded-xl bg-muted/50 p-4 grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              Free delivery across Dushanbe
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              Official warranty from manufacturer
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4 text-primary shrink-0" />
              14-day return policy
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="w-full md:w-auto flex">
            <TabsTrigger value="description" className="flex-1 md:flex-none">Description</TabsTrigger>
            <TabsTrigger value="specs" className="flex-1 md:flex-none">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1 md:flex-none">Reviews ({productReviews.length})</TabsTrigger>
            <TabsTrigger value="delivery" className="flex-1 md:flex-none">Delivery</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4 prose prose-sm max-w-none">
            <div className="rounded-xl bg-card border border-border p-5">
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-muted/40' : ''}>
                      <td className="px-4 py-2.5 font-medium text-muted-foreground w-1/2 whitespace-nowrap">{spec.label}</td>
                      <td className="px-4 py-2.5 text-foreground">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="rounded-xl bg-card border border-border p-5">
              {productReviews.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {productReviews.map((r) => (
                    <div key={r.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                          ))}
                        </div>
                        <span className="font-semibold text-sm">{r.authorName}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{r.date}</span>
                      </div>
                      <p className="text-sm text-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-4">
            <div className="rounded-xl bg-card border border-border p-5 flex flex-col gap-3 text-sm text-foreground">
              <div className="flex items-start gap-2"><Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">Free Delivery</p><p className="text-muted-foreground">Delivery across Dushanbe within 1–2 business days. Free for orders over 500 TJS.</p></div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">Pickup</p><p className="text-muted-foreground">Free pickup from our store in Dushanbe.</p></div></div>
              <div className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">Warranty</p><p className="text-muted-foreground">All products include official manufacturer warranty of 12–24 months.</p></div></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-5">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
