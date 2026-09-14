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

export default function AdminAuditLog() {
  const [items, setItems] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    fetchAuditLog().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

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
                <p className="text-xs text-muted-foreground mb-1.5">Данные записи на момент изменения</p>
                <pre className="bg-muted/40 rounded-lg p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(viewing.changedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
