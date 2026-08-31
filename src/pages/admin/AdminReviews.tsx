import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Trash2, Star, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Review } from '@/types';
import { toast } from 'sonner';

// Reviews mock (inline since not in mockData)
const seedReviews: Review[] = [
  { id: 'r1', productId: 'p1', productName: 'Ноутбук Acer Aspire A6270', authorName: 'Рустам К.', rating: 5, text: 'Отличный ноутбук! Отлично справляется с задачами, быстрая производительность.', date: '2026-07-10', status: 'approved' },
  { id: 'r2', productId: 'p5', productName: 'HP Victus 15', authorName: 'Дилноза Р.', rating: 4, text: 'Хороший игровой ноутбук, все игры работают без проблем.', date: '2026-07-15', status: 'approved' },
  { id: 'r3', productId: 'p12', productName: 'Принтер Epson EcoTank L3210', authorName: 'Фаррух И.', rating: 5, text: 'Невероятный принтер, чернила расходуются очень экономно.', date: '2026-07-20', status: 'pending' },
  { id: 'r4', productId: 'p16', productName: 'Logitech MX Keys', authorName: 'Наргиза Б.', rating: 5, text: 'Лучшая клавиатура из всех. Подсветка просто фантастическая.', date: '2026-07-22', status: 'pending' },
  { id: 'r5', productId: 'p13', productName: 'Эргономичное офисное кресло Pro', authorName: 'Алишер Н.', rating: 4, text: 'Удобное и качественное. Спина больше не болит.', date: '2026-07-25', status: 'approved' },
  { id: 'r6', productId: 'p7', productName: 'ASUS Vivobook 15', authorName: 'Камола С.', rating: 3, text: 'Нормальный ноутбук, но немного греется под нагрузкой.', date: '2026-07-28', status: 'pending' },
  { id: 'r7', productId: 'p17', productName: 'Logitech MX Master 3', authorName: 'Бобур Т.', rating: 5, text: 'Потрясающая мышь! Колесо прокрутки само по себе стоит своих денег.', date: '2026-07-30', status: 'approved' },
  { id: 'r8', productId: 'p15', productName: 'Регулируемый офисный стол', authorName: 'Гулнора М.', rating: 4, text: 'Хороший стол, высота регулируется легко. Отлично смотрится в офисе.', date: '2026-08-01', status: 'rejected' },
];

const STATUS_BADGE: Record<Review['status'], string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminReviews() {
  const [items, setItems] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return seedReviews;
    const saved = localStorage.getItem('admin_reviews');
    return saved ? JSON.parse(saved) : seedReviews;
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('admin_reviews', JSON.stringify(items));
  }, [items]);

  const filtered = items.filter((r) => {
    const matchSearch = r.authorName.toLowerCase().includes(search.toLowerCase())
      || r.productName.toLowerCase().includes(search.toLowerCase())
      || r.text.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: Review['status']) => {
    console.log('updateStatus called with id:', id, 'status:', status);
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    const labels: Record<Review['status'], string> = { approved: 'Отзыв одобрен', pending: 'Отзыв на модерации', rejected: 'Отзыв отклонён' };
    toast.success(labels[status]);
    setSuccessMessage(labels[status]);
    setTimeout(() => setSuccessMessage(''), 3000);
    console.log('Toast called:', labels[status]);
  };
  

  const handleDelete = () => {
    console.log('handleDelete called with deleteId:', deleteId);
    if (!deleteId) return;
    setItems((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success('Отзыв удалён');
    setSuccessMessage('Отзыв успешно удалён');
    setTimeout(() => setSuccessMessage(''), 3000);
    console.log('Delete completed and toast called');
  };

  const pending = items.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex flex-col gap-4">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-medium flex items-center gap-2 animate-in">
          <CheckCircle className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      {pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 font-medium">
          {pending} отзыв{pending === 1 ? '' : pending < 5 ? 'а' : 'ов'} ожидает модерации
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск отзывов..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="pending">На модерации</SelectItem>
            <SelectItem value="approved">Одобрены</SelectItem>
            <SelectItem value="rejected">Отклонены</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 card-shadow">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm">{r.authorName}</span>
                  <span className="text-xs text-muted-foreground">на</span>
                  <span className="text-xs text-primary font-medium">{r.productName}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Badge className={`text-xs ${STATUS_BADGE[r.status]}`}>
                  {r.status === 'approved' ? 'Одобрен' : r.status === 'pending' ? 'На модерации' : 'Отклонён'}
                </Badge>
                {r.status !== 'approved' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={() => updateStatus(r.id, 'approved')}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {r.status !== 'rejected' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(r.id, 'rejected')}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">Отзывы не найдены</div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
            <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
