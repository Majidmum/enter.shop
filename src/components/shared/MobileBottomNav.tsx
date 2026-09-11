import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Grid3X3, Heart, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const cartCount = useCartStore((s) => s.items.length);
  const favCount = useFavoritesStore((s) => s.items.length);
  const user = useAuthStore((s) => s.user);

  const profileHref = user?.role === 'admin' ? '/admin' : '/account';
  const navItems = [
    { icon: Home, label: t('common.home'), href: '/' },
    { icon: Grid3X3, label: t('common.catalog'), href: '/catalog' },
    { icon: Heart, label: t('common.favorites'), href: '/favorites' },
    { icon: ShoppingCart, label: t('common.cart'), href: '/cart' },
    { icon: User, label: t('common.profile'), href: profileHref },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-0 z-40 flex justify-center px-6">
      <div className="flex items-center justify-around gap-1 w-full max-w-xs h-14 px-3 rounded-full bg-secondary shadow-2xl shadow-black/40">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          const badge = href === '/cart' ? cartCount : href === '/favorites' ? favCount : 0;
          return (
            <Link
              key={href}
              to={href}
              aria-label={label}
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors"
            >
              {/* Свечение-"лампочка" над активной иконкой */}
              {isActive && (
                <span
                  className="absolute -top-[9px] left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-primary"
                  style={{ boxShadow: '0 0 10px 3px hsl(var(--primary))' }}
                />
              )}
              <Icon className={`h-5 w-5 relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-white/40'}`} />
              {badge > 0 && (
                <span className="absolute top-0 right-0.5 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-primary text-white text-[9px] font-bold ring-2 ring-secondary z-10">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
