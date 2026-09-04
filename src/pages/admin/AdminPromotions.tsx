import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchPromotions, createPromotion, updatePromotion, deletePromotion } from '@/lib/supabaseData';
import type { Promotion } from '@/types';
import { toast } from 'sonner';

export default function AdminPromotions() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Promotion>>({});

  const load = () => {
    setLoading(true);
    fetchPromotions().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    const today = new Date().toISOString().split('T')[0];
    const inMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDraft({ name: '', discount: 10, startDate: today, endDate: inMonth, status: 'active' });
    setOpen(true);
  };
  const openEdit = (p: Promotion) => { setEditing(p); setDraft({ ...p }); setOpen(true); };

  const handleSave = async () => {
    if (!draft.name || !draft.discount) { toast.error('Заполните обязательные поля'); return; }
    if (!draft.startDate || !draft.endDate) { toast.error('Укажите даты начала и окончания'); return; }

    setSaving(true);
    try {
      if (editing) {
        const updated = await updatePromotion(editing.id, {
          name: draft.name,
          discount: draft.discount,
          startDate: draft.startDate,
          endDate: draft.endDate,
          status: draft.status as 'active' | 'inactive',
        });
        setItems((prev) => prev.map((p) => p.id === editing.id ? updated : p));
        toast.success('Акция обновлена');
      } else {
        const created = await createPromotion({
          name: draft.name,
          discount: draft.discount,
          startDate: draft.startDate,
          endDate: draft.endDate,
          status: (draft.status as 'active' | 'inactive') || 'active',
        });
        setItems((prev) => [created, ...prev]);
        toast.success('Акция создана');
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сохранить акцию');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePromotion(deleteId);
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Акция удалена');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить акцию');
    } finally {
      setDeleteId(null);
    }
  };

  const isActive = (p: Promotion) => {
    const now = new Date().toISOString().split('T')[0];
    return p.status === 'active' && p.startDate <= now && p.endDate >= now;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white h-9">
          <Plus className="h-4 w-4 mr-1.5" /> Добавить акцию
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Акция</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Скидка</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Начало</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Конец</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Активна</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-destructive/10 text-destructive font-bold">-{p.discount}%</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.startDate}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.endDate}</td>
                  <td className="px-4 py-3">
                    {isActive(p)
                      ? <Badge className="bg-green-100 text-green-700">Активна</Badge>
                      : <Badge className="bg-gray-100 text-gray-600">Неактивна</Badge>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={p.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>
                      {p.status === 'active' ? 'Включена' : 'Выключена'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && items.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">Акций пока нет</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать акцию' : 'Добавить акцию'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2">
              <Label>Название акции *</Label>
              <Input className="mt-1" value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>Скидка (%) *</Label>
              <Input className="mt-1" type="number" min={1} max={99} value={draft.discount || ''} onChange={(e) => setDraft({ ...draft, discount: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as 'active' | 'inactive' })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Включена</SelectItem>
                  <SelectItem value="inactive">Выключена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Дата начала</Label>
              <Input className="mt-1" type="date" value={draft.startDate || ''} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} />
            </div>
            <div>
              <Label>Дата окончания</Label>
              <Input className="mt-1" type="date" value={draft.endDate || ''} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
              <Check className="h-4 w-4 mr-1.5" /> {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить акцию?</AlertDialogTitle>
            <AlertDialogDescription>Акция будет удалена без возможности восстановления.</AlertDialogDescription>
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
