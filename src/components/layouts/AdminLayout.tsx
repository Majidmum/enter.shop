import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Star, Megaphone, Image,
  Settings, LogOut, Laptop, Menu, Truck, Bookmark, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Товары', icon: Package },
  { href: '/admin/categories', label: 'Категории', icon: Tag },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Клиенты', icon: Users },
  { href: '/admin/brands',     label: 'Бренды',      icon: Bookmark },
  { href: '/admin/promotions', label: 'Акции',  icon: Megaphone },
  { href: '/admin/banners',    label: 'Баннеры',     icon: Image },
  { href: '/admin/reviews',    label: 'Отзывы',     icon: Star },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <Laptop className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-sidebar-foreground">ENTER<span className="text-primary">.TJ</span></span>
          <p className="text-[10px] text-sidebar-foreground/50">Панель управления</p>
        </div>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">Навигация</p>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors min-h-10 ${
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 min-w-0 truncate">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors mb-1">
          <Truck className="h-4 w-4" /> В магазин
        </Link>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Выйти
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, isAuthenticated, loading } = useAuthStore();

  const currentPage = navItems.find((i) => i.exact ? pathname === i.href : pathname.startsWith(i.href))?.label || 'Admin';

  // Пока идёт проверка сессии Supabase — не решаем ничего, просто ждём.
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-sm text-muted-foreground">
        Загрузка...
      </div>
    );
  }

  // Не вошёл в систему → на страницу входа.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Вошёл, но не администратор → в личный кабинет, панель не для него.
  if (user?.role !== 'admin') {
    return <Navigate to="/account" replace />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-sidebar-background sticky top-0 h-screen">
        <SidebarNav />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4 shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 bg-sidebar-background">
              <SidebarNav onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-base font-semibold flex-1 min-w-0 truncate">{currentPage}</h1>
          <span className="text-xs text-muted-foreground hidden md:block">ENTER.TJ Admin</span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
