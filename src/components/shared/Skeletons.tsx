import { Skeleton } from '@/components/ui/skeleton';

/** Заглушка на месте карточки товара — повторяет форму ProductCard.tsx */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg bg-card border border-border overflow-hidden">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-1.5 p-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-4 w-1/2 mt-0.5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-7 w-full mt-1" />
      </div>
    </div>
  );
}

/** Сетка из N заглушек товаров — вместо текста "Загрузка..." */
export function ProductGridSkeleton({ count = 8, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Заглушка на месте карточки категории — повторяет форму CategoryCard.tsx */
export function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl overflow-hidden bg-card border border-border">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 flex flex-col gap-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Заглушка на месте карточки пакета "Офис под ключ" */
export function PackageCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden p-6 gap-3">
      <Skeleton className="h-11 w-11 rounded-xl" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3 mt-1" />
      <div className="flex flex-col gap-2 mt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-full mt-4 rounded-lg" />
    </div>
  );
}

/** Заглушка на месте детальной страницы товара — галерея + инфо-блок */
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg shrink-0" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
