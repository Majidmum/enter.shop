import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, Headphones, Star, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shared/ProductCard';
import CategoryCard from '@/components/shared/CategoryCard';
import { products, categories, banners, reviews, brands } from '@/lib/mockData';

export default function HomePage() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const activeBanners = banners.filter((b) => b.status === 'active');
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8);
  const newProducts = products.filter((p) => p.isNew).slice(0, 8);
  const saleProducts = products.filter((p) => p.discount).slice(0, 8);
  const approvedReviews = reviews.filter((r) => r.status === 'approved').slice(0, 4);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % activeBanners.length), 5000);
    return () => clearInterval(t);
  }, [activeBanners.length]);

  const prevBanner = () => setBannerIdx((i) => (i - 1 + activeBanners.length) % activeBanners.length);
  const nextBanner = () => setBannerIdx((i) => (i + 1) % activeBanners.length);

  const advantages = [
    { icon: Truck, title: 'Free Delivery', desc: 'Free delivery across Dushanbe on orders over 500 TJS' },
    { icon: Shield, title: 'Official Warranty', desc: 'All products come with official manufacturer warranty' },
    { icon: Headphones, title: 'Expert Support', desc: 'Our specialists will help you choose the right product' },
    { icon: Building2, title: 'Corporate Clients', desc: 'Special conditions for businesses and organizations' },
  ];

  return (
    <div className="pb-16 md:pb-0">
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
                      View Sale
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

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Product Categories</h2>
          <Link to="/categories" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            All categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.slice(0, 7).map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">Popular Products</h2>
            <Link to="/catalog?sort=featured" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      <section className="container mx-auto px-4 py-10">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-primary p-8 text-white">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">Special Offer</p>
            <h2 className="text-2xl md:text-4xl font-bold mb-2">Discounts up to 20%</h2>
            <p className="text-white/80 mb-4">Office chairs, monitors, laptops and more</p>
            <Button asChild className="bg-white hover:bg-white/90 font-semibold" style={{ color: 'hsl(var(--primary))' }}>
              <Link to="/sale">View Deals <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* New Products */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground">New Arrivals</h2>
          <Link to="/catalog?filter=new" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Office Turnkey */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 min-w-0">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">For Business</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Office Turnkey</h2>
            <p className="text-white/70 mb-6">
              We will fully equip your office — from computers and furniture to network equipment. Special pricing for corporate clients.
            </p>
            <Link to="/office">
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Learn More <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1 min-w-0">
            {['Computers', 'Furniture', 'Printers', 'Network'].map((item) => (
              <div key={item} className="rounded-xl bg-white/10 p-4 text-center border border-white/10">
                <p className="text-white font-medium text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">Why Choose ENTER.TJ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center p-5 rounded-xl bg-card border border-border card-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section className="bg-muted/50 py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">Our Brands</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 items-center justify-items-center">
            {brands.map((brand) => (
              <div key={brand.id} className="flex h-12 items-center justify-center px-2 opacity-60 hover:opacity-100 transition-opacity">
                <img src={brand.logo} alt={brand.name} className="h-8 object-contain" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {approvedReviews.map((r) => (
            <div key={r.id} className="rounded-xl bg-card border border-border card-shadow p-4 flex flex-col gap-2">
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
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Follow us on Instagram</h2>
          <p className="text-white/80 mb-4 text-sm">New arrivals, promotions and useful tips</p>
          <Button asChild className="bg-white hover:bg-white/90 font-semibold" style={{ color: 'hsl(var(--primary))' }}>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">@enter.tj</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
