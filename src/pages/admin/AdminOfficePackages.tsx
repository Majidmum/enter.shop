import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  fetchAllOfficePackages, createOfficePackage, updateOfficePackage, deleteOfficePackage,
  type OfficePackage,
} from '@/lib/supabaseData';
import { toast } from 'sonner';

type Draft = Partial<OfficePackage> & { featuresText?: string };

export default function AdminOfficePackages() {
  const [items, setItems] = useState<OfficePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OfficePackage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({});

  const load = () => {
    setLoading(true);
    fetchAllOfficePackages().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setDraft({ name: '', priceLabel: '', employeesLabel: '', featuresText: '', isPopular: false, status: 'active', sortOrder: items.length + 1 });
    setOpen(true);
  };

  const openEdit = (p: OfficePackage) => {
    setEditing(p);
    setDraft({ ...p, featuresText: p.features.join('\n') });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name || !draft.priceLabel) { toast.error('Заполните название и цену'); return; }
    const features = (draft.featuresText || '').split('\n').map((s) => s.trim()).filter(Boolean);

    setSaving(true);
    try {
      if (editing) {
        const updated = await updateOfficePackage(editing.id, {
          name: draft.name,
          priceLabel: draft.priceLabel,
          employeesLabel: draft.employeesLabel,
          description: draft.description,
          features,
          isPopular: !!draft.isPopular,
          status: draft.status as 'active' | 'inactive',
          sortOrder: draft.sortOrder,
        });
        setItems((prev) => prev.map((p) => p.id === editing.id ? updated : p).sort((a, b) => a.sortOrder - b.sortOrder));
        toast.success('Пакет обновлён');
      } else {
        const created = await createOfficePackage({
          name: draft.name,
          priceLabel: draft.priceLabel,
          employeesLabel: draft.employeesLabel,
          description: draft.description,
          features,
          isPopular: !!draft.isPopular,
          status: (draft.status as 'active' | 'inactive') || 'active',
          sortOrder: draft.sortOrder ?? items.length + 1,
        });
        setItems((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
        toast.success('Пакет добавлен');
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сохранить пакет');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteOfficePackage(deleteId);
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Пакет удалён');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить пакет');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Пакеты, которые видят посетители на странице «Офис под ключ»</p>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white h-9">
          <Plus className="h-4 w-4 mr-1.5" /> Добавить пакет
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <div key={p.id} className="bg-card border border-border rounded-xl p-4 card-shadow flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">{p.name}</h3>
                  {p.isPopular && <Badge className="bg-primary/10 text-primary text-xs"><Star className="h-3 w-3 mr-1 fill-primary" />Популярный</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{p.employeesLabel}</p>
              </div>
              <Badge className={p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                {p.status === 'active' ? 'Активен' : 'Скрыт'}
              </Badge>
            </div>
            <p className="text-lg font-black text-primary">{p.priceLabel}</p>
            <ul className="text-xs text-muted-foreground flex flex-col gap-1 flex-1">
              {p.features.slice(0, 4).map((f, i) => <li key={i}>• {f}</li>)}
              {p.features.length > 4 && <li>+ ещё {p.features.length - 4}</li>}
            </ul>
            <div className="flex items-center gap-1 mt-2">
              <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => openEdit(p)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Изменить
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">Пакетов пока нет</div>
        )}
        {loading && (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">Загрузка...</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать пакет' : 'Добавить пакет'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label>Название *</Label>
              <Input className="mt-1" value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Например: Бизнес" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Цена *</Label>
                <Input className="mt-1" value={draft.priceLabel || ''} onChange={(e) => setDraft({ ...draft, priceLabel: e.target.value })} placeholder="от 60 000 сомони" />
              </div>
              <div>
                <Label>Для скольки сотрудников</Label>
                <Input className="mt-1" value={draft.employeesLabel || ''} onChange={(e) => setDraft({ ...draft, employeesLabel: e.target.value })} placeholder="Для 5–20 сотрудников" />
              </div>
            </div>
            <div>
              <Label>Что входит (каждый пункт с новой строки)</Label>
              <Textarea className="mt-1" rows={5} value={draft.featuresText || ''} onChange={(e) => setDraft({ ...draft, featuresText: e.target.value })}
                placeholder={'20 рабочих мест\nЭргономичная мебель\nПринтер и МФУ'} />
            </div>
            <div>
              <Label>Краткое описание (необязательно)</Label>
              <Textarea className="mt-1" rows={2} value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label>Отметить «Популярный»</Label>
                <p className="text-xs text-muted-foreground">Выделяется на странице и показывается первым по умолчанию</p>
              </div>
              <Switch checked={!!draft.isPopular} onCheckedChange={(v) => setDraft({ ...draft, isPopular: v })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Статус</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as 'active' | 'inactive' })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен (виден на сайте)</SelectItem>
                    <SelectItem value="inactive">Скрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Порядок показа</Label>
                <Input className="mt-1" type="number" value={draft.sortOrder ?? ''} onChange={(e) => setDraft({ ...draft, sortOrder: Number(e.target.value) })} />
              </div>
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
            <AlertDialogTitle>Удалить пакет?</AlertDialogTitle>
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
