import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Headphones, Star, Building2, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shared/ProductCard';
import { getBanners } from '@/lib/getStorageData';
import { fetchProducts, fetchBrands, fetchApprovedReviews } from '@/lib/supabaseData';
import PageMeta from '@/components/common/PageMeta';
import type { Product, Brand, Review } from '@/types';

export default function HomePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
  const banners = getBanners();

  useEffect(() => {
    Promise.all([fetchProducts(), fetchBrands(), fetchApprovedReviews()])
      .then(([p, b, r]) => { setProducts(p); setBrands(b); setApprovedReviews(r.slice(0, 4)); });
  }, []);

  const [bannerIdx, setBannerIdx] = useState(0);
  const activeBanners = banners.filter((b) => b.status === 'active');

  // "Популярные товары" — на основе реальной оценки и количества отзывов,
  // а не ручного флажка. Чем выше рейтинг и чем больше отзывов — тем выше в списке.
  const popularProducts = [...products]
    .filter((p) => p.status === 'active')
    .sort((a, b) => (b.rating - a.rating) || (b.reviewCount - a.reviewCount))
    .slice(0, 8);

  // "Новинки" — управляется администратором вручную (переключатель в форме товара)
  const newProducts = products.filter((p) => p.isNew && p.status === 'active').slice(0, 8);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % activeBanners.length), 5000);
    return () => clearInterval(t);
  }, [activeBanners.length]);

  const prevBanner = () => setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length);
  const nextBanner = () => setBannerIdx((i) => (i + 1) % activeBanners.length);

  const advantages = [
    { icon: Truck, title: t('home.advantage_delivery_title'), desc: t('home.advantage_delivery_desc') },
    { icon: Shield, title: t('home.advantage_warranty_title'), desc: t('home.advantage_warranty_desc') },
    { icon: Headphones, title: t('home.advantage_support_title'), desc: t('home.advantage_support_desc') },
    { icon: Building2, title: t('home.advantage_business_title'), desc: t('home.advantage_business_desc') },
  ];

  return (
    <div className="pb-16 md:pb-0">
      <PageMeta
        title={t('home.meta_title')}
        description={t('home.meta_description')}
      />
      {/* Hero Banner */}
      <section className="relative w-full overflow-hidden bg-secondary">
        <div className="relative min-h-[320px] md:min-h-[480px]">
          {activeBanners.map((banner, i) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === bannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 gap-4">
                <h1 className="text-2xl md:text-5xl font-bold text-white text-balance leading-tight max-w-3xl">
                  {banner.title}
                </h1>
                <p className="text-sm md:text-lg text-white/80 max-w-xl">{banner.subtitle}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to={banner.buttonLink}>
                    <Button className="bg-primary hover:bg-primary/90 text-white px-6 font-semibold">
                      {banner.buttonText}
                    </Button>
                  </Link>
                  <Link to="/sale">
                    <Button variant="ghost" className="border border-white/60 text-white hover:bg-white/10 px-6">
                      {t('home.banner_sale_button')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Arrow controls */}
          {activeBanners.length > 1 && (
            <>
              <button onClick={prevBanner} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={nextBanner} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {activeBanners.map((_, i) => (
                  <button key={i} onClick={() => setBannerIdx(i)} className={`h-2 rounded-full transition-all ${i === bannerIdx ? 'w-6 bg-primary' : 'w-2 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Popular Products (по рейтингу) */}
      <section className="bg-muted/50 py-10">
        <div className="container mx-auto px-4 opacity-0 translate-y-8 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-y-0 intersect-once">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">{t('home.popular_products')}</h2>
            </div>
            <Link to="/catalog?sort=rating" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium shrink-0">
              {t('common.view_all')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{t('home.popular_products_subtitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      <section className="container mx-auto px-4 py-10">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-primary p-8 md:p-12 text-white opacity-0 scale-95 transition-all duration-700 ease-out intersect:opacity-100 intersect:scale-100 intersect-once">
          {/* Decorative blurred shapes */}
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-black/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
              <Tag className="h-3.5 w-3.5" /> {t('home.special_offer_badge')}
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-3 leading-tight">{t('home.special_offer_title')}</h2>
            <p className="text-white/85 mb-6 text-base md:text-lg">{t('home.special_offer_subtitle')}</p>
            <Button asChild className="bg-white hover:bg-white/90 font-semibold shadow-lg" style={{ color: 'hsl(var(--primary))' }}>
              <Link to="/sale">{t('home.special_offer_cta')} <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="container mx-auto px-4 pb-10 opacity-0 translate-y-8 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-y-0 intersect-once">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{t('home.new_products')}</h2>
          </div>
          <Link to="/catalog?filter=new" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium shrink-0">
            {t('common.view_all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {newProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t('home.new_products_empty')}</p>
        )}
      </section>

      {/* Office Turnkey */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 min-w-0 opacity-0 -translate-x-8 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-x-0 intersect-once">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">{t('home.office_business_label')}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{t('home.office_title')}</h2>
            <p className="text-white/70 mb-6">
              {t('home.office_description')}
            </p>
            <Link to="/office">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                {t('home.office_cta')} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 min-w-0 opacity-0 translate-x-8 transition-all duration-700 ease-out delay-150 intersect:opacity-100 intersect:translate-x-0 intersect-once">
            {[t('home.office_item_computers'), t('home.office_item_furniture'), t('home.office_item_printers'), t('home.office_item_network')].map((item) => (
              <div key={item} className="rounded-xl bg-white/10 p-4 text-center border border-white/10">
                <p className="text-white font-medium text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8 opacity-0 translate-y-4 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-y-0 intersect-once">{t('home.why_choose_us')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: '1000px' }}>
          {advantages.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="flex flex-col items-center text-center p-5 rounded-xl bg-card border border-border card-shadow opacity-0 [transform:rotateX(25deg)_translateY(24px)] transition-all duration-700 ease-out intersect:opacity-100 intersect:[transform:rotateX(0deg)_translateY(0px)] intersect-once"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands — бесконечная автопрокрутка */}
      {brands.length > 0 && (
        <section className="bg-muted/50 py-10 overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8 opacity-0 translate-y-4 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-y-0 intersect-once">{t('home.our_brands')}</h2>
          </div>
          <div className="relative w-full overflow-hidden group">
            {/* Затухание по краям */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-muted/50 to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-muted/50 to-transparent" />
            <div className="flex w-max animate-[brand-scroll_30s_linear_infinite] group-hover:[animation-play-state:paused]">
              {[...brands, ...brands].map((brand, i) => (
                <div key={`${brand.id}-${i}`} className="flex h-16 w-32 shrink-0 items-center justify-center px-4 opacity-60 hover:opacity-100 transition-opacity">
                  <img src={brand.logo} alt={brand.name} className="h-8 max-w-full object-contain" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8 opacity-0 translate-y-4 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-y-0 intersect-once">{t('home.reviews_title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {approvedReviews.map((r, i) => (
            <div
              key={r.id}
              className="rounded-xl bg-card border border-border card-shadow p-4 flex flex-col gap-2 opacity-0 translate-y-8 transition-all duration-700 ease-out intersect:opacity-100 intersect:translate-y-0 intersect-once"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                ))}
              </div>
              <p className="text-sm text-foreground line-clamp-3">{r.text}</p>
              <div className="mt-auto pt-2 border-t border-border">
                <p className="text-xs font-semibold text-foreground">{r.authorName}</p>
                <p className="text-xs text-muted-foreground">{r.productName}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="bg-gradient-primary py-10">
        <div className="container mx-auto px-4 text-center opacity-0 scale-95 transition-all duration-700 ease-out intersect:opacity-100 intersect:scale-100 intersect-once">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{t('home.instagram_title')}</h2>
          <p className="text-white/80 mb-4 text-sm">{t('home.instagram_subtitle')}</p>
          <Button asChild className="bg-white hover:bg-white/90 font-semibold" style={{ color: 'hsl(var(--primary))' }}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">@enter.tj</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
