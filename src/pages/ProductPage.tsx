import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Загрузка...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3">Товар не найден</h2>
        <Link to="/catalog" className="text-primary hover:underline">Вернуться в каталог</Link>
      </div>
    );
  }

  const fav = isFavorite(product.id);
  const similar = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} добавлен в корзину`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    window.location.href = '/checkout';
  };

  const handleSubmitReview = async () => {
    if (!reviewName.trim()) { toast.error('Введите ваше имя'); return; }
    if (reviewRating === 0) { toast.error('Поставьте оценку — нажмите на звёзды'); return; }
    if (!reviewText.trim()) { toast.error('Напишите текст отзыва'); return; }

    setSubmittingReview(true);
    try {
      await createReview({
        productId: product.id,
        productName: product.name,
        authorName: reviewName.trim(),
        rating: reviewRating,
        text: reviewText.trim(),
      });
      toast.success('Спасибо! Отзыв отправлен на модерацию и появится после проверки.');
      setReviewRating(0);
      setReviewText('');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось отправить отзыв');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta
        title={`${product.name} — купить в Душанбе за ${product.price.toLocaleString()} сом. | ENTER.TJ`}
        description={(product.description || `${product.name} от ${product.brandName}. Купить с доставкой по Душанбе и Таджикистану, официальная гарантия.`).slice(0, 160)}
        ogImage={product.images[0]}
      />
      <Breadcrumb items={[
        { label: 'Каталог', href: '/catalog' },
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
              <span>Бренд: <span className="text-primary font-medium">{product.brandName}</span></span>
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
            <span className="text-sm text-muted-foreground">({product.reviewCount} отзывов)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
            <span className="text-2xl md:text-3xl font-bold text-foreground">{product.price.toLocaleString()} сом.</span>
            {product.oldPrice && (
              <span className="text-lg text-muted-foreground line-through">{product.oldPrice.toLocaleString()} сом.</span>
            )}
            {product.discount && (
              <Badge className="bg-destructive/10 text-destructive">Скидка {((product.oldPrice! - product.price)).toLocaleString()} сомони</Badge>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <><Check className="h-4 w-4 text-green-600" /><span className="text-sm font-medium text-green-600">В наличии ({product.stock} шт.)</span></>
            ) : (
              <span className="text-sm font-medium text-destructive">Нет в наличии</span>
            )}
          </div>

          {/* Quantity + Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Количество:</span>
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
                Купить сейчас
              </Button>
              <div className="flex gap-2 md:gap-3 md:flex-1">
                <Button onClick={handleAddToCart} variant="outline" className="flex-1" disabled={product.stock === 0}>
                  <ShoppingCart className="h-4 w-4 mr-1.5" /> В корзину
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
              Бесплатная доставка по Душанбе
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4 text-primary shrink-0" />
              Официальная гарантия производителя
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4 text-primary shrink-0" />
              Возврат в течение 14 дней
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="w-full md:w-auto flex overflow-x-auto justify-start gap-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsTrigger value="description" className="shrink-0">Описание</TabsTrigger>
            <TabsTrigger value="specs" className="shrink-0">Характеристики</TabsTrigger>
            <TabsTrigger value="reviews" className="shrink-0">Отзывы ({productReviews.length})</TabsTrigger>
            <TabsTrigger value="delivery" className="shrink-0">Доставка</TabsTrigger>
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
                <p className="text-muted-foreground text-sm">Отзывов пока нет. Будьте первым!</p>
              )}
            </div>

            {/* Форма добавления отзыва */}
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5 mt-4">
              <h3 className="font-semibold mb-3">Оставить отзыв</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Ваша оценка *</label>
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
                          aria-label={`Оценка ${value} из 5`}
                        >
                          <Star className={`h-6 w-6 transition-colors ${filled ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Ваше имя *</label>
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Например: Рустам К."
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Текст отзыва *</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Расскажите о своём опыте использования товара..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                  />
                </div>
                <Button onClick={handleSubmitReview} disabled={submittingReview} className="self-start bg-primary hover:bg-primary/90 text-white">
                  {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
                </Button>
                <p className="text-xs text-muted-foreground">Отзыв появится на сайте после проверки модератором.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-4">
            <div className="rounded-xl bg-card border border-border p-4 sm:p-5 flex flex-col gap-3 text-sm text-foreground">
              <div className="flex items-start gap-2"><Truck className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">Бесплатная доставка</p><p className="text-muted-foreground">Доставка по Душанбе за 1–2 рабочих дня. Бесплатно при заказе от 500 сомони.</p></div></div>
              <div className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">Самовывоз</p><p className="text-muted-foreground">Бесплатный самовывоз из нашего магазина в Душанбе.</p></div></div>
              <div className="flex items-start gap-2"><Shield className="h-4 w-4 text-primary mt-0.5 shrink-0" /><div><p className="font-semibold">Гарантия</p><p className="text-muted-foreground">Все товары включают официальную гарантию производителя 12–24 месяца.</p></div></div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-5">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
