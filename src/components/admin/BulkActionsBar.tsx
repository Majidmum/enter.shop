import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BulkActionsBarProps {
  count: number;
  onClear: () => void;
  children: ReactNode;
}

/**
 * Плашка массовых действий — появляется, когда в списке выбрана хотя бы
 * одна строка чекбоксом. Липнет к низу экрана (над мобильной навигацией),
 * чтобы её было видно, даже если список длинный и прокручен вниз.
 */
export default function BulkActionsBar({ count, onClear, children }: BulkActionsBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-3 md:bottom-4 z-30 mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 card-shadow">
      <span className="text-sm font-medium shrink-0">Выбрано: {count}</span>
      <div className="flex flex-wrap items-center gap-2 ml-auto">
        {children}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear} aria-label="Отменить выбор">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
