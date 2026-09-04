import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { useCartStore } from '@/store/cartStore';
import PageMeta from '@/components/common/PageMeta';

export default function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        <PageMeta title={t('cart.meta_title')} description={t('cart.meta_description')} noIndex />
        <Breadcrumb items={[{ label: t('cart.title') }]} />
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ShoppingCart className="h-16 w-16 text-muted" />
          <h2 className="text-xl font-bold text-foreground">{t('cart.empty_title')}</h2>
          <p className="text-muted-foreground text-sm">{t('cart.empty_subtitle')}</p>
          <Link to="/catalog"><Button className="bg-primary hover:bg-primary/90 text-white mt-2">{t('cart.go_to_catalog')}</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta title={t('cart.meta_title')} description={t('cart.meta_description')} noIndex />
      <Breadcrumb items={[{ label: t('cart.title') }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">{t('cart.title_with_count', { count: itemCount() })}</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 rounded-xl bg-card border border-border p-4 card-shadow">
              <Link to={`/product/${product.slug}`} className="shrink-0">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              </Link>
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <Link to={`/product/${product.slug}`}>
                  <p className="text-xs text-muted-foreground">{product.brandName}</p>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">{product.name}</h3>
                </Link>
                <p className="text-base font-bold text-foreground mt-auto">{product.price.toLocaleString()} {t('common.currency')}</p>
              </div>
              <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center hover:bg-muted transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center hover:bg-muted transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-bold">{(product.price * quantity).toLocaleString()} {t('common.currency')}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="rounded-xl bg-card border border-border p-5 card-shadow sticky top-24">
            <h3 className="font-bold text-base mb-4">{t('cart.your_order')}</h3>
            <div className="flex flex-col gap-3 text-sm border-b border-border pb-4 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between gap-2">
                  <span className="text-muted-foreground truncate">{product.name} ×{quantity}</span>
                  <span className="font-medium shrink-0">{(product.price * quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">{t('cart.delivery')}</span>
              <span className="text-green-600 font-medium">{t('cart.free')}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>{t('cart.total')}</span>
              <span>{total().toLocaleString()} {t('common.currency')}</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full mt-5 bg-primary hover:bg-primary/90 text-white font-semibold">
                {t('cart.checkout')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" className="w-full mt-2 text-sm">{t('cart.continue_shopping')}</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
