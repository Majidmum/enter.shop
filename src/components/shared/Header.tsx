import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Laptop, ChevronDown, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/components/theme-provider';
import { fetchCategories } from '@/lib/supabaseData';
import type { Category } from '@/types';

const navLinks = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Акции', href: '/sale' },
  { label: 'Офис под ключ', href: '/office' },
  { label: 'Доставка', href: '/delivery' },
  { label: 'О нас', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
];

function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-9 w-9 ${className}`}
      onClick={toggleTheme}
      aria-label="Переключить тему"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const cartCount = useCartStore((s) => s.itemCount());
  const favCount = useFavoritesStore((s) => s.items.length);
  const { isAuthenticated, user } = useAuthStore();

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
          <span>Душанбе, Таджикистан · Пн–Сб 9:00–19:00</span>
          <div className="flex items-center gap-4">
            <a href="tel:+992555000070" className="hover:text-white transition-colors">+992 555 000 070</a>
            <Link to="/delivery" className="hover:text-white transition-colors">Доставка</Link>
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
              <p className="px-3 text-xs text-sidebar-foreground/50 uppercase tracking-wider mb-1">Категории</p>
              {categories.slice(0, 8).map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors min-h-12">
                  {cat.name}
                </Link>
              ))}
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
            <span>Каталог</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {catOpen && (
            <div
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
              className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-card border border-border shadow-lg z-50 py-2"
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link key={cat.id} to={`/category/${cat.slug}`} onClick={() => setCatOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {cat.name}
                  </Link>
                ))
              ) : (
                <p className="px-4 py-2.5 text-sm text-muted-foreground">Категории скоро появятся</p>
              )}
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
              placeholder="Поиск товаров..."
              className="pl-9 h-9 w-full"
            />
          </div>
          <Button type="submit" className="h-9 bg-primary hover:bg-primary/90 text-white shrink-0">
            Найти
          </Button>
        </form>

        {/* Spacer pushes mobile actions to the right */}
        <div className="flex-1 md:hidden" />

        {/* Mobile compact actions: search toggle + theme */}
        <div className="flex items-center gap-0.5 md:hidden shrink-0">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileSearchOpen((v) => !v)} aria-label="Поиск">
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          <ThemeToggle />
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          <ThemeToggle />

          <Link to="/favorites">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <Heart className="h-5 w-5" />
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {favCount}
                </span>
              )}
            </Button>
          </Link>

          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>
          </Link>

          <Link to={!isAuthenticated ? '/login' : user?.role === 'admin' ? '/admin' : '/account'}>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <User className="h-5 w-5" />
            </Button>
          </Link>
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
                placeholder="Поиск товаров..."
                className="pl-9 h-10 w-full"
              />
            </div>
            <Button type="submit" className="h-10 bg-primary hover:bg-primary/90 text-white shrink-0">
              Найти
            </Button>
          </form>
        </div>
      )}

      {/* Secondary nav (desktop) */}
      <div className="hidden md:block border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-9 flex items-center gap-6">
          {navLinks.slice(1).map((link) => (
            <Link key={link.href} to={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
