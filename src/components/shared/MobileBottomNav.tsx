import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';

const baseNavItems = [
  { icon: Home, label: 'Главная', href: '/' },
  { icon: Grid3X3, label: 'Каталог', href: '/catalog' },
  { icon: Heart, label: 'Избранное', href: '/favorites' },
  { icon: ShoppingCart, label: 'Корзина', href: '/cart' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const cartCount = useCartStore((s) => s.itemCount());
  const favCount = useFavoritesStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);

  const profileHref = user?.role === 'admin' ? '/admin' : '/account';
  const navItems = [...baseNavItems, { icon: User, label: 'Профиль', href: profileHref }];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          const badge = href === '/cart' ? cartCount : href === '/favorites' ? favCount : 0;
          return (
            <Link
              key={href}
              to={href}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-12 px-3 relative transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                    {badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
