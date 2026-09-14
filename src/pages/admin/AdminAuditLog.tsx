import { useState, useEffect } from 'react';
import { History, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchAuditLog } from '@/lib/supabaseData';
import type { AuditLogEntry } from '@/types';
import { toast } from 'sonner';

const TABLE_LABELS: Record<string, string> = {
  products: 'Товар',
  categories: 'Категория',
  brands: 'Бренд',
  promotions: 'Акция',
  banners: 'Баннер',
  orders: 'Заказ',
  reviews: 'Отзыв',
  office_packages: 'Пакет "Офис под ключ"',
  promo_campaigns: 'Рекламная акция',
};

const ACTION_LABELS: Record<string, string> = {
  insert: 'Создано',
  update: 'Изменено',
  delete: 'Удалено',
};

const ACTION_COLORS: Record<string, string> = {
  insert: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
};

// Человекопонятные названия для самых частых полей. Всё, чего нет в списке,
// показываем как есть (технические поля вроде id/created_at всё равно
// отфильтровываются раньше, до попадания сюда).
const FIELD_LABELS: Record<string, string> = {
  name: 'Название',
  title: 'Заголовок',
  description: 'Описание',
  price: 'Цена',
  old_price: 'Старая цена',
  discount: 'Скидка',
  stock: 'Остаток',
  sku: 'Артикул',
  slug: 'URL-адрес',
  status: 'Статус',
  images: 'Фото',
  image: 'Фото',
  logo: 'Логотип',
  specs: 'Характеристики',
  is_new: 'Новинка',
  is_featured: 'Популярный',
  category_id: 'Категория',
  brand_id: 'Бренд',
  parent_id: 'Родительская категория',
  start_date: 'Дата начала',
  end_date: 'Дата окончания',
  product_ids: 'Товары в акции',
  sort_order: 'Порядок',
  button_text: 'Текст кнопки',
  button_link: 'Ссылка кнопки',
  subtitle: 'Подзаголовок',
};

// Служебные поля, которые не показываем в детальном просмотре — пользователю
// они ничего не скажут, а строку зря займут.
const HIDDEN_FIELDS = new Set(['id', 'created_at', 'updated_at', 'category_id', 'brand_id']);

function isImageLikeValue(value: unknown): boolean {
  if (typeof value === 'string') return value.startsWith('data:image') || (value.startsWith('http') && /\.(jpg|jpeg|png|webp|gif)/i.test(value));
  if (Array.isArray(value)) return value.length > 0 && value.every((v) => typeof v === 'string' && (v.startsWith('data:image') || v.startsWith('http')));
  return false;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (isImageLikeValue(value)) {
    const count = Array.isArray(value) ? value.length : 1;
    return count === 1 ? '🖼 Фото' : `🖼 Фото (${count} шт.)`;
  }
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'number') return value.toLocaleString('ru-RU');
  return String(value);
}

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] || key;
}

/** Список полей для показа: только те, что реально изменились (для update), либо все значимые поля (для insert/delete). */
function getDiffRows(entry: AuditLogEntry): { key: string; before?: string; after?: string }[] {
  const old: Record<string, unknown> = entry.oldData || {};
  const next: Record<string, unknown> = entry.changedData || {};
  const allKeys = new Set([...Object.keys(old), ...Object.keys(next)]);
  const rows: { key: string; before?: string; after?: string }[] = [];

  for (const key of allKeys) {
    if (HIDDEN_FIELDS.has(key)) continue;
    const beforeVal = old[key];
    const afterVal = next[key];

    if (entry.action === 'update') {
      // Показываем только то, что реально поменялось.
      if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) continue;
      rows.push({ key, before: formatValue(beforeVal), after: formatValue(afterVal) });
    } else if (entry.action === 'insert') {
      if (afterVal === undefined) continue;
      rows.push({ key, after: formatValue(afterVal) });
    } else {
      if (beforeVal === undefined) continue;
      rows.push({ key, before: formatValue(beforeVal) });
    }
  }
  return rows;
}

export default function AdminAuditLog() {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    fetchAuditLog().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const diffRows = viewing ? getDiffRows(viewing) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <History className="h-4 w-4 shrink-0" />
        Здесь фиксируются все изменения товаров, категорий, брендов, акций, баннеров и других разделов —
        кто и когда что поменял. Видно только администратору.
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Дата</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Кто</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Раздел</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Действие</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Подробнее</th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <tr key={entry.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{new Date(entry.createdAt).toLocaleString('ru-RU')}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{entry.actorName}</p>
                    {entry.actorRole && <p className="text-xs text-muted-foreground">{ROLE_LABELS[entry.actorRole] || entry.actorRole}</p>}
                  </td>
                  <td className="px-4 py-3">{TABLE_LABELS[entry.tableName] || entry.tableName}</td>
                  <td className="px-4 py-3">
                    <Badge className={ACTION_COLORS[entry.action]}>{ACTION_LABELS[entry.action]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(entry)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && items.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">Изменений пока нет</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewing && `${TABLE_LABELS[viewing.tableName] || viewing.tableName} — ${ACTION_LABELS[viewing.action]}`}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Кто изменил</p>
                  <p className="font-semibold">{viewing.actorName}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Когда</p>
                  <p className="font-semibold">{new Date(viewing.createdAt).toLocaleString('ru-RU')}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1.5">
                  {viewing.action === 'update' ? 'Что изменилось' : viewing.action === 'insert' ? 'Что было создано' : 'Что было удалено'}
                </p>
                {diffRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
                    Изменения затронули только служебные поля — показывать нечего.
                  </p>
                ) : viewing.action === 'update' ? (
                  <div className="flex flex-col gap-1.5">
                    {diffRows.map((row) => (
                      <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 items-center bg-muted/40 rounded-lg p-3">
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">{fieldLabel(row.key)}</p>
                          <p className="text-destructive line-through break-words">{row.before}</p>
                        </div>
                        <span className="text-muted-foreground">→</span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">&nbsp;</p>
                          <p className="font-medium text-green-700 break-words">{row.after}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {diffRows.map((row) => (
                      <div key={row.key} className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-0.5">{fieldLabel(row.key)}</p>
                        <p className="font-medium break-words">{row.before ?? row.after}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
