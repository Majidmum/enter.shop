import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Heart, Star, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/shared/ProductCard';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { fetchProducts, fetchApprovedReviews, createReview } from '@/lib/supabaseData';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import type { Product, Review } from '@/types';

export default function ProductPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const product = products.find((p) => p.slug === slug);

  useEffect(() => {
    if (!product) return;
    fetchApprovedReviews(product.id).then(setProductReviews);
    if (user?.name) setReviewName(user.name);
  }, [product?.id]);

  const addToCart = useCartStore((s) => s.addItem);
  const { toggle, isFavorite } = useFavoritesStore();

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">{t('product.not_found_title')}</h2>
        <Link to="/catalog" className="text-primary hover:underline">{t('product.back_to_catalog')}</Link>
      </div>
    );
  }

  const fav = isFavorite(product.id);
  const similar = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(t('product.added_to_cart', { name: product.name }));
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/checkout';
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) { toast.error(t('product.error_enter_name')); return; }
    if (reviewRating === 0) { toast.error(t('product.error_set_rating')); return; }
    if (!reviewText.trim()) { toast.error(t('product.error_write_review')); return; }

    setSubmittingReview(true);
    try {
      await createReview({
        productId: product.id,
        productName: product.name,
        authorName: reviewName.trim(),
        rating: reviewRating,
        text: reviewText.trim(),
      });
      toast.success(t('product.review_success'));
      setReviewRating(0);
      setReviewText('');
    } catch (e: any) {
      toast.error(e.message || t('product.review_error_fallback'));
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta
        title={t('product.meta_title', { name: product.name, price: product.price.toLocaleString() })}
        description={(product.description || t('product.meta_description_fallback', { name: product.name, brand: product.brandName })).slice(0, 160)}
        ogImage={product.images[0]}
      />
      <Breadcrumb items={[
        { label: t('common.catalog'), href: '/catalog' },
        { label: product.categoryName, href: `/category/${product.slug.split('-')[0]}` },
        { label: product.name },
      ]} />

      <div className="mt-5 sm:mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
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
                  className={`h-20 w-20 sm:h-16 sm:w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-primary' : 'border-border'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{product.name}</h1>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <span>{t('product.brand_label')}: <span className="text-primary font-medium">{product.brandName}</span></span>
              <span className="text-border">•</span>
              <span>SKU: {product.sku}</span>
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
              ))}
            </div>
            <span className="text-sm text-primary font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">{t('product.reviews_count', { count: product.reviewCount })}</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
            <span className="text-2xl md:text-3xl font-bold text-foreground">{product.price.toLocaleString()} {t('common.currency')}</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">{product.oldPrice.toLocaleString()} {t('common.currency')}</span>
            )}
            {product.discount && (
              <Badge className="bg-destructive/10 text-destructive">{t('product.discount_badge', { amount: (product.oldPrice! - product.price).toLocaleString() })}</Badge>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <><Check className="h-4 w-4 text-green-600" /><span className="text-sm font-medium text-green-600">{t('product.in_stock', { count: product.stock })}</span></>
            ) : (
              <span className="text-sm font-medium text-destructive">{t('product.out_of_stock')}</span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{t('product.quantity_label')}</span>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center hover:bg-muted transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="flex h-10 w-10 sm:h-9 sm:w-9 items-center justify-center hover:bg-muted transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 md:gap-3">
              <Button onClick={handleBuyNow} className="w-full md:flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={product.stock === 0}>
                {t('common.buy_now')}
              </Button>
              <div className="flex gap-2 md:gap-3 md:flex-1">
                <Button onClick={handleAddToCart} variant="outline" className="flex-1" disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> {t('common.add_to_cart')}
                </Button>
                <Button onClick={() => toggle(product)} variant="outline" size="icon" className={`shrink-0 ${fav ? 'border-primary text-primary' : ''}`}>
                  <Heart className={`h-4 w-4 ${fav ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="rounded-xl bg-muted/50 p-4 grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Truck className="h-4 w-4 text-primary shrink-0" />
              {t('product.benefit_delivery')}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              {t('product.benefit_warranty')}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4 text-primary shrink-0" />
              {t('product.benefit_return')}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="w-full md:w-auto flex overflow-x-auto justify-start gap-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsTrigger value="description" className="shrink-0">{t('product.tab_description')}</TabsTrigger>
            <TabsTrigger value="specs" className="shrink-0">{t('product.tab_specs')}</TabsTrigger>
            <TabsTrigger value="reviews" className="shrink-0">{t('product.tab_reviews', { count: productReviews.length })}</TabsTrigger>
            <TabsTrigger value="delivery" className="shrink-0">{t('product.tab_delivery')}</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4 prose prose-sm max-w-none">
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5">
              <p className="text-foreground leading-relaxed">{product.description}</p>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-4">
            <div className="rounded-xl bg-card border border-border overflow-x-auto">
              <table className="w-full text-sm min-w-[320px]">
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
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5">
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
                <p className="text-muted-foreground text-sm">{t('product.no_reviews_yet')}</p>
              )}
            </div>

            {/* Форма добавления отзыва */}
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5 mt-4">
              <h3 className="font-semibold mb-3">{t('product.leave_review')}</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{t('product.your_rating')}</label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      const value = i + 1;
                      const filled = value <= (reviewHoverRating || reviewRating);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(value)}
                          onMouseEnter={() => setReviewHoverRating(value)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          className="p-0.5"
                          aria-label={t('product.rating_aria', { value })}
                        >
                          <Star className={`h-6 w-6 transition-colors ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{t('product.your_name')}</label>
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder={t('product.your_name_placeholder')}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">{t('product.review_text_label')}</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    placeholder={t('product.review_text_placeholder')}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={submittingReview} className="self-start bg-primary hover:bg-primary/90 text-white">
                  {submittingReview ? t('product.submitting') : t('product.submit_review')}
                </Button>
                <p className="text-xs text-muted-foreground">{t('product.review_moderation_note')}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-4">
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5 flex flex-col gap-3 text-sm text-foreground">
              <div className="flex items-start gap-2"><Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">{t('product.delivery_free_title')}</p><p className="text-muted-foreground">{t('product.delivery_free_desc')}</p></div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">{t('product.pickup_title')}</p><p className="text-muted-foreground">{t('product.pickup_desc')}</p></div></div>
              <div className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">{t('product.warranty_title')}</p><p className="text-muted-foreground">{t('product.warranty_desc')}</p></div></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-5">{t('product.similar_products')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
