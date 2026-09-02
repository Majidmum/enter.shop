import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchBrands, createBrand, updateBrand, deleteBrand } from '@/lib/supabaseData';
import type { Brand } from '@/types';
import { toast } from 'sonner';

export default function AdminBrands() {
  const [items, setItems] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Brand>>({});

  const load = () => {
    setLoading(true);
    fetchBrands().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setDraft({ name: '', description: '', status: 'active' });
    setOpen(true);
  };
  const openEdit = (b: Brand) => { setEditing(b); setDraft({ ...b }); setOpen(true); };

  const handleSave = async () => {
    if (!draft.name) { toast.error('Введите название бренда'); return; }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateBrand(editing.id, {
          name: draft.name, description: draft.description, status: draft.status as 'active' | 'inactive', logo: draft.logo,
        });
        setItems((prev) => prev.map((b) => b.id === editing.id ? updated : b));
        toast.success('Бренд обновлён');
      } else {
        const created = await createBrand({
          name: draft.name, description: draft.description, status: draft.status as 'active' | 'inactive', logo: draft.logo,
        });
        setItems((prev) => [...prev, created]);
        toast.success('Бренд добавлен');
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сохранить бренд');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBrand(deleteId);
      setItems((prev) => prev.filter((b) => b.id !== deleteId));
      toast.success('Бренд удалён');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить бренд');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white h-9">
          <Plus className="h-4 w-4 mr-1.5" /> Добавить бренд
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Бренд</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Описание</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Товары</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.logo ? (
                        <div className="h-8 w-16 rounded bg-white border border-border flex items-center justify-center p-1 shrink-0">
                          <img src={b.logo} alt={b.name} className="h-full object-contain" />
                        </div>
                      ) : (
                        <div className="h-8 w-16 rounded bg-muted border border-border flex items-center justify-center text-xs text-muted-foreground shrink-0">
                          Нет лого
                        </div>
                      )}
                      <span className="font-medium">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{b.description}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-primary/10 text-primary">{b.productCount}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {b.status === 'active' ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(b.id)}>
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
          <div className="py-12 text-center text-muted-foreground text-sm">Брендов пока нет</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать бренд' : 'Добавить бренд'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label>Название бренда *</Label>
              <Input className="mt-1" value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>Логотип бренда</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-3 bg-muted/30">
                {draft.logo ? (
                  <div className="relative w-32 h-16 group">
                    <div className="w-full h-full bg-white border border-border rounded-lg flex items-center justify-center p-2">
                      <img src={draft.logo} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, logo: '' })}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-1 py-6">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Нажмите, чтобы загрузить логотип</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const result = event.target?.result;
                          if (typeof result === 'string') setDraft((prev) => ({ ...prev, logo: result }));
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea className="mt-1" rows={2} value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as 'active' | 'inactive' })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                </SelectContent>
              </Select>
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
            <AlertDialogTitle>Удалить бренд?</AlertDialogTitle>
            <AlertDialogDescription>Товары этого бренда нужно будет обновить.</AlertDialogDescription>
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
