import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';
import type { Product } from '@/types';

interface ProductScrollRowProps {
  products: Product[];
  /** Цвет фона секции, где стоит компонент — тень по краю должна совпадать. */
  fadeVariant?: 'background' | 'muted';
}

/**
 * Горизонтальная прокрутка товаров — видно примерно 4 карточки на десктопе,
 * пятая чуть выглядывает с тенью по краю (намёк, что есть ещё), плюс кнопки
 * со стрелками для прокрутки. Используется и в "Популярные товары", и в "Новинки".
 */
export default function ProductScrollRow({ products, fadeVariant = 'background' }: ProductScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [products]);

  const scrollByAmount = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[46%] sm:w-[31%] lg:w-[23%] shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Тень по краям — показывает, что есть ещё товары для прокрутки */}
      {canScrollLeft && (
        <div
          className={
            fadeVariant === 'muted'
              ? 'pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-muted/50 to-transparent'
              : 'pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent'
          }
        />
      )}
      {canScrollRight && (
        <div
          className={
            fadeVariant === 'muted'
              ? 'pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-muted/50 to-transparent'
              : 'pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent'
          }
        />
      )}

      {/* Кнопки прокрутки — только на десктопе, на мобильном обычный свайп пальцем */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount('left')}
          aria-label="Прокрутить влево"
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount('right')}
          aria-label="Прокрутить вправо"
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full bg-card border border-border shadow-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
