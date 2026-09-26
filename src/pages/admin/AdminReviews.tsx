import { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Trash2, Star, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { fetchReviews, updateReviewStatus, deleteReview, updateReviewRating } from '@/lib/supabaseData';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import BulkActionsBar from '@/components/admin/BulkActionsBar';
import type { Review } from '@/types';
import { toast } from 'sonner';

const STATUS_BADGE: Record<Review['status'], string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminReviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const bulk = useBulkSelection();
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [ratingDraft, setRatingDraft] = useState(0);

  const load = () => {
    setLoading(true);
    fetchReviews().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = items.filter((r) => {
    const matchSearch = r.authorName.toLowerCase().includes(search.toLowerCase())
      || r.productName.toLowerCase().includes(search.toLowerCase())
      || r.text.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, status: Review['status']) => {
    try {
      const updated = await updateReviewStatus(id, status);
      setItems((prev) => prev.map((r) => r.id === id ? updated : r));
      const labels: Record<Review['status'], string> = { approved: 'Отзыв одобрен', pending: 'Отзыв на модерации', rejected: 'Отзыв отклонён' };
      toast.success(labels[status]);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось обновить статус');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteReview(deleteId);
      setItems((prev) => prev.filter((r) => r.id !== deleteId));
      toast.success('Отзыв удалён');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить отзыв');
    } finally {
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(bulk.selected);
    setBulkBusy(true);
    try {
      await Promise.all(ids.map((id) => deleteReview(id)));
      setItems((prev) => prev.filter((r) => !ids.includes(r.id)));
      toast.success(`Удалено отзывов: ${ids.length}`);
      bulk.clear();
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить некоторые отзывы');
    } finally {
      setBulkBusy(false);
      setBulkDeleteOpen(false);
    }
  };

  const handleBulkStatus = async (status: Review['status']) => {
    const ids = Array.from(bulk.selected);
    setBulkBusy(true);
    try {
      const updated = await Promise.all(ids.map((id) => updateReviewStatus(id, status)));
      setItems((prev) => prev.map((r) => updated.find((u) => u.id === r.id) || r));
      const labels: Record<Review['status'], string> = { approved: 'Одобрено отзывов', pending: 'Отправлено на модерацию', rejected: 'Отклонено отзывов' };
      toast.success(`${labels[status]}: ${ids.length}`);
      bulk.clear();
    } catch (e: any) {
      toast.error(e.message || 'Не удалось обновить некоторые отзывы');
    } finally {
      setBulkBusy(false);
    }
  };

  const startEditRating = (r: Review) => {
    setEditingRatingId(r.id);
    setRatingDraft(r.rating);
  };

  const saveRating = async (id: string) => {
    try {
      const updated = await updateReviewRating(id, ratingDraft);
      setItems((prev) => prev.map((r) => r.id === id ? updated : r));
      toast.success('Оценка обновлена');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось обновить оценку');
    } finally {
      setEditingRatingId(null);
    }
  };

  const pending = items.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex flex-col gap-4">
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
        {filtered.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 cursor-pointer">
            <Checkbox
              checked={filtered.every((r) => bulk.isSelected(r.id))}
              onCheckedChange={() => bulk.toggleAll(filtered.map((r) => r.id))}
              aria-label="Выбрать все"
            />
            Выбрать все
          </label>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <div key={r.id} className={`bg-card border border-border rounded-xl p-4 card-shadow ${bulk.isSelected(r.id) ? 'ring-2 ring-primary/30' : ''}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Checkbox checked={bulk.isSelected(r.id)} onCheckedChange={() => bulk.toggle(r.id)} aria-label={`Выбрать отзыв ${r.authorName}`} />
                  <span className="font-semibold text-sm">{r.authorName}</span>
                  <span className="text-xs text-muted-foreground">на</span>
                  <span className="text-xs text-primary font-medium">{r.productName}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>

                {/* Оценка звёздами — админ может кликнуть и поставить свою */}
                {editingRatingId === r.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => {
                        const value = i + 1;
                        return (
                          <button key={i} type="button" onClick={() => setRatingDraft(value)} className="p-0.5">
                            <Star className={`h-4 w-4 transition-colors ${value <= ratingDraft ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                          </button>
                        );
                      })}
                    </div>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => saveRating(r.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => setEditingRatingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditRating(r)}
                    className="flex items-center gap-0.5 mb-2 group"
                    title="Нажмите, чтобы изменить оценку"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                    ))}
                    <Pencil className="h-3 w-3 ml-1.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}

                <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>

                {r.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {r.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="h-14 w-14 rounded-lg overflow-hidden border border-border shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {r.likes > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">❤️ {r.likes}</p>
                )}
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
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">Отзывы не найдены</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">Загрузка...</div>
        )}
      </div>

      <BulkActionsBar count={bulk.count} onClear={bulk.clear}>
        <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => handleBulkStatus('approved')}>Одобрить</Button>
        <Button variant="outline" size="sm" disabled={bulkBusy} onClick={() => handleBulkStatus('rejected')}>Отклонить</Button>
        <Button variant="destructive" size="sm" disabled={bulkBusy} onClick={() => setBulkDeleteOpen(true)}>
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Удалить
        </Button>
      </BulkActionsBar>

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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={(o) => !o && setBulkDeleteOpen(false)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить выбранные отзывы?</AlertDialogTitle>
            <AlertDialogDescription>Будет удалено отзывов: {bulk.count}. Это действие нельзя отменить.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-white hover:bg-destructive/90">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
