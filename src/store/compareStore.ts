import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

export const MAX_COMPARE = 4;

interface CompareState {
  items: Product[];
  /** Добавляет/убирает товар из сравнения. Возвращает результат — по нему
   *  вызывающий код показывает разный toast (добавлено / убрано / лимит). */
  toggle: (product: Product) => 'added' | 'removed' | 'limit_reached';
  remove: (productId: string) => void;
  clear: () => void;
  isCompared: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (product) => {
        const exists = get().items.find((p) => p.id === product.id);
        if (exists) {
          set((state) => ({ items: state.items.filter((p) => p.id !== product.id) }));
          return 'removed';
        }
        if (get().items.length >= MAX_COMPARE) {
          return 'limit_reached';
        }
        set((state) => ({ items: [...state.items, product] }));
        return 'added';
      },
      remove: (productId) => {
        set((state) => ({ items: state.items.filter((p) => p.id !== productId) }));
      },
      clear: () => set({ items: [] }),
      isCompared: (productId) => !!get().items.find((p) => p.id === productId),
    }),
    { name: 'enter-tj-compare' }
  )
);
