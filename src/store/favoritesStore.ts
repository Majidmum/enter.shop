import { create } from 'zustand';
import type { Product } from '@/types';

interface FavoritesState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggle: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
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
}));
