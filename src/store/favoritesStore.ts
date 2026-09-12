import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

interface FavoritesState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggle: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          if (state.items.find((p) => p.id === product.id)) return state;
          return { items: [...state.items, product] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((p) => p.id !== productId) }));
      },

      toggle: (product) => {
        if (get().isFavorite(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      },

      isFavorite: (productId) => !!get().items.find((p) => p.id === productId),
    }),
    {
      // Избранное сохраняется в localStorage — переживает перезагрузку страницы.
      name: 'enter-tj-favorites',
    }
  )
);
