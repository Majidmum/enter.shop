import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const CITIES = ['Душанбе', 'Худжанд'] as const;
export type City = (typeof CITIES)[number];

interface CityState {
  city: City | null;
  setCity: (city: City) => void;
  /** Чтобы шапка могла заново открыть модалку для смены города вручную. */
  reopenSignal: number;
  reopen: () => void;
}

/**
 * Выбор города — чисто визуальный (запоминаем выбор пользователя,
 * показываем его в шапке). Ни на цены, ни на доставку, ни на товары
 * это никак не влияет — это намеренно, по договорённости.
 */
export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      city: null,
      setCity: (city) => set({ city }),
      reopenSignal: 0,
      reopen: () => set((s) => ({ reopenSignal: s.reopenSignal + 1 })),
    }),
    { name: 'enter-tj-city', partialize: (s) => ({ city: s.city }) }
  )
);
