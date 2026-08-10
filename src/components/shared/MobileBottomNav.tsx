import { Link, useLocation } from 'react-router-dom';
import { Home, Grid3X3, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Grid3X3, label: 'Catalog', href: '/catalog' },
  { icon: Heart, label: 'Favorites', href: '/favorites' },
  { icon: ShoppingCart, label: 'Cart', href: '/cart' },
  { icon: User, label: 'Profile', href: '/account' },
];

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const cartCount = useCartStore((s) => s.itemCount());
  const favCount = useFavoritesStore((s) => s.items.length);

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
