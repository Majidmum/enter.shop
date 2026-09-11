import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Heart, User, Menu, X, Laptop, ChevronDown, Sun, Moon, Languages, Tag, Building2, Truck, Info, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/theme-provider';
import { fetchCategories, fetchBrands, fetchProducts } from '@/lib/supabaseData';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import type { Category, Brand, Product } from '@/types';

function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-9 w-9 ${className}`}
      onClick={toggleTheme}
      aria-label={t('header.theme_toggle_aria')}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function LanguageToggle({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label={t('header.language_toggle_aria')}
      >
        <Languages className="h-5 w-5" />
      </Button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-24 rounded-lg bg-card border border-border shadow-lg z-50 py-1">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${lang.code === current.code ? 'text-primary font-semibold' : ''}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  // Какая категория слева сейчас "активна" (наведена/выбрана) — справа показываем её подкатегории.
  // Специальное значение 'brands' — показывает список брендов вместо подкатегорий.
  const [activeCatId, setActiveCatId] = useState<string | 'brands' | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchBrands().then(setBrands);
    fetchProducts().then(setProducts);
  }, []);

  const brandsById = useMemo(() => new Map(brands.map((b) => [b.id, b])), [brands]);

  // Дерево категорий: родительские категории + их подкатегории,
  // а для каждой подкатегории — реальные бренды товаров внутри неё
  // (для правой панели меню, по образцу крупных маркетплейсов).
  const categoryTree = useMemo(() => {
    const topLevel = categories.filter((c) => !c.parentId);
    return topLevel.map((parent) => ({
      ...parent,
      children: categories
        .filter((c) => c.parentId === parent.id)
        .map((sub) => {
          const brandIds = new Set(
            products.filter((p) => p.categoryId === sub.id).map((p) => p.brandId)
          );
          const subBrands = [...brandIds].map((id) => brandsById.get(id)).filter((b): b is Brand => !!b);
          return { ...sub, brands: subBrands };
        }),
    }));
  }, [categories, products, brandsById]);

  // По умолчанию, как только дерево загрузилось — подсвечиваем первую категорию (как у Uzum)
  useEffect(() => {
    if (categoryTree.length > 0 && activeCatId === null) {
      setActiveCatId(categoryTree[0].id);
    }
  }, [categoryTree, activeCatId]);

  const activeCategory = activeCatId && activeCatId !== 'brands'
    ? categoryTree.find((c) => c.id === activeCatId)
    : undefined;

  const cartCount = useCartStore((s) => s.items.length);
  const favCount = useFavoritesStore((s) => s.items.length);
  const { isAuthenticated, user } = useAuthStore();

  const navLinks = [
    { label: t('common.catalog'), href: '/catalog' },
    { label: t('header.nav_sale'), href: '/sale' },
    { label: t('header.nav_office'), href: '/office' },
    { label: t('header.nav_delivery'), href: '/delivery' },
    { label: t('header.nav_about'), href: '/about' },
    { label: t('header.nav_contacts'), href: '/contacts' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMobileSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      {/* Top bar (desktop only) */}
      <div className="bg-secondary text-white/70 text-xs hidden md:block">
        <div className="container mx-auto px-4 flex items-center justify-between h-8">
          <span>{t('header.location_line')}</span>
          <div className="flex items-center gap-4">
            <a href="tel:+992555000070" className="hover:text-white transition-colors">+992 555 000 070</a>
            <Link to="/delivery" className="hover:text-white transition-colors">{t('header.delivery')}</Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container mx-auto px-4 h-14 md:h-16 flex items-center gap-2 md:gap-3">
        {/* Mobile menu trigger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar overflow-y-auto">
            <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
                <Laptop className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-sidebar-foreground">ENTER<span className="text-primary">.TJ</span></span>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-12">
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-sidebar-border my-2" />
              <p className="px-3 text-xs text-sidebar-foreground/50 uppercase tracking-wider mb-1">{t('header.categories')}</p>
              {categoryTree.slice(0, 8).map((cat) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <div key={cat.id}>
                    <Link to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-12">
                      <Icon className="h-4 w-4 shrink-0" />
                      {cat.name}
                    </Link>
                    {cat.children.map((sub) => (
                      <Link key={sub.id} to={`/category/${sub.slug}`} onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 pl-8 pr-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors min-h-12">
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                );
              })}
              {brands.length > 0 && (
                <>
                  <div className="border-t border-sidebar-border my-2" />
                  <p className="px-3 text-xs text-sidebar-foreground/50 uppercase tracking-wider mb-1">{t('header.brands')}</p>
                  {brands.slice(0, 8).map((brand) => (
                    <Link key={brand.id} to={`/catalog?brand=${brand.id}`} onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-12">
                      {brand.name}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0 min-w-0">
          <img src="/enter-logo-header.png" alt="ENTER.TJ" className="h-7 md:h-9 w-auto object-contain" />
        </Link>

        {/* Catalog dropdown desktop */}
        <div className="relative hidden md:block">
          <button
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
            className="flex items-center gap-1 px-3 h-9 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Menu className="h-4 w-4" />
            <span>{t('common.catalog')}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {catOpen && (
            <div
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
              className="absolute top-full left-0 mt-1 flex rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden"
            >
              {/* Левая колонка — список категорий верхнего уровня, с иконками */}
              <div className="w-64 py-2 max-h-[70vh] overflow-y-auto shrink-0 border-r border-border">
                {categoryTree.length > 0 ? (
                  categoryTree.map((cat) => {
                    const Icon = getCategoryIcon(cat.name);
                    return (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onMouseEnter={() => setActiveCatId(cat.id)}
                        onClick={() => setCatOpen(false)}
                        className={`flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                          activeCatId === cat.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {cat.children.length > 0 && <ChevronDown className="h-3.5 w-3.5 -rotate-90 shrink-0" />}
                      </Link>
                    );
                  })
                ) : (
                  <p className="px-4 py-2.5 text-sm text-muted-foreground">{t('header.categories_empty')}</p>
                )}
                {brands.length > 0 && (
                  <button
                    onMouseEnter={() => setActiveCatId('brands')}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition-colors border-t border-border mt-1 pt-3 ${
                      activeCatId === 'brands' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Tag className="h-4 w-4 shrink-0" />
                      {t('header.brands')}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 -rotate-90 shrink-0" />
                  </button>
                )}
              </div>

              {/* Правая панель — подкатегории жирными заголовками колонок,
                  под каждой — реальные бренды товаров именно этой подкатегории */}
              <div className="w-[640px] p-5 max-h-[70vh] overflow-y-auto">
                {activeCatId === 'brands' ? (
                  <>
                    <p className="font-semibold text-sm mb-3">{t('header.brands')}</p>
                    <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                      {brands.map((brand) => (
                        <Link key={brand.id} to={`/catalog?brand=${brand.id}`} onClick={() => setCatOpen(false)}
                          className="flex items-center gap-2 py-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                          {brand.logo ? (
                            <img src={brand.logo} alt="" className="h-4 w-4 object-contain shrink-0" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                          )}
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : activeCategory ? (
                  <>
                    <Link to={`/category/${activeCategory.slug}`} onClick={() => setCatOpen(false)}
                      className="font-semibold text-base mb-4 flex items-center gap-1 hover:text-primary transition-colors w-fit">
                      {activeCategory.name} <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                    </Link>
                    {activeCategory.children.length > 0 ? (
                      <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                        {activeCategory.children.map((sub) => (
                          <div key={sub.id} className="min-w-0">
                            <Link to={`/category/${sub.slug}`} onClick={() => setCatOpen(false)}
                              className="block text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors mb-2">
                              {sub.name}
                            </Link>
                            <div className="flex flex-col gap-1.5">
                              {sub.brands.length > 0 ? (
                                sub.brands.map((brand) => (
                                  <Link
                                    key={brand.id}
                                    to={`/category/${sub.slug}?brand=${brand.id}`}
                                    onClick={() => setCatOpen(false)}
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors truncate"
                                  >
                                    {brand.name}
                                  </Link>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">{t('header.no_subcategories')}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('header.no_subcategories')}</p>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Search — desktop: always visible inline. Mobile: hidden, toggled via icon below */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 min-w-0 gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('common.search_placeholder')}
              className="pl-9 h-9 w-full"
            />
          </div>
          <Button type="submit" className="h-9 bg-primary hover:bg-primary/90 text-white shrink-0">
            {t('common.search_button')}
          </Button>
        </form>

        {/* Spacer pushes mobile actions to the right */}
        <div className="flex-1 md:hidden" />

        {/* Mobile compact actions: search toggle + language + theme */}
        <div className="flex items-center gap-0.5 md:hidden shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileSearchOpen((v) => !v)} aria-label={t('header.search_aria')}>
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <LanguageToggle />
          <ThemeToggle />

          <Link to="/favorites">
            <Button variant="ghost" className="relative h-9 gap-1.5 px-2 lg:px-3">
              <Heart className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline text-sm font-medium">{t('common.favorites')}</span>
              {favCount > 0 && (
                <span className="absolute -top-0.5 left-4 lg:static lg:ml-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {favCount}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/cart">
            <Button variant="ghost" className="relative h-9 gap-1.5 px-2 lg:px-3">
              <ShoppingCart className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline text-sm font-medium">{t('common.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 left-4 lg:static lg:ml-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>

          <Link to={!isAuthenticated ? '/login' : user?.role === 'admin' ? '/admin' : '/account'}>
            <Button variant="ghost" className="h-9 gap-1.5 px-2 lg:px-3">
              <User className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline text-sm font-medium">
                {!isAuthenticated ? t('common.login') : t('common.profile')}
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Category pills row (desktop) — слева прокручиваемые категории, справа закреплённые ссылки */}
      <div className="hidden md:block border-t border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto min-w-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              to="/sale"
              className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-semibold whitespace-nowrap"
            >
              <Tag className="h-4 w-4" />
              {t('header.nav_sale')}
            </Link>
            <Link
              to="/office"
              className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-semibold whitespace-nowrap"
            >
              <Building2 className="h-4 w-4" />
              {t('header.nav_office')}
            </Link>
            <div className="h-5 w-px bg-border shrink-0 mx-1" />
            {categoryTree.slice(0, 10).map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-full hover:bg-muted hover:text-primary transition-colors text-sm font-medium whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Закреплено у правого края, не прокручивается вместе с категориями */}
          <div className="hidden lg:flex items-center gap-1 shrink-0">
            <Link to="/delivery" className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full hover:bg-muted hover:text-primary transition-colors text-sm font-medium whitespace-nowrap text-muted-foreground">
              <Truck className="h-4 w-4" />
              {t('header.nav_delivery')}
            </Link>
            <Link to="/about" className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full hover:bg-muted hover:text-primary transition-colors text-sm font-medium whitespace-nowrap text-muted-foreground">
              <Info className="h-4 w-4" />
              {t('header.nav_about')}
            </Link>
            <Link to="/contacts" className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full hover:bg-muted hover:text-primary transition-colors text-sm font-medium whitespace-nowrap text-muted-foreground">
              <Phone className="h-4 w-4" />
              {t('header.nav_contacts')}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile expandable search row */}
      {mobileSearchOpen && (
        <div className="md:hidden border-t border-border px-4 py-2.5 bg-card">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('common.search_placeholder')}
                className="pl-9 h-10 w-full"
              />
            </div>
            <Button type="submit" className="h-10 bg-primary hover:bg-primary/90 text-white shrink-0">
              {t('common.search_button')}
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
