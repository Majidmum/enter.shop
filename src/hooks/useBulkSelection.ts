import { useState, useCallback } from 'react';

/**
 * Общая логика выбора нескольких строк в списке (админка) — чтобы потом
 * применить массовое действие (удалить, включить/выключить и т.д.) сразу
 * ко всем выбранным, а не по одной.
 */
export function useBulkSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** Выбрать/снять выбор со всех переданных id одним кликом (чекбокс в шапке таблицы). */
  const toggleAll = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      return allSelected ? new Set() : new Set(ids);
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);
  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  return { selected, toggle, toggleAll, clear, isSelected, count: selected.size };
}
