import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, ArrowUp, ArrowDown, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchPromoCampaigns, createPromoCampaign, updatePromoCampaign, deletePromoCampaign } from '@/lib/supabaseData';
import type { PromoCampaign } from '@/types';
import { toast } from 'sonner';

export default function AdminPromoCampaigns() {
  const [items, setItems] = useState<PromoCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoCampaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<PromoCampaign>>({});

  const load = () => {
    setLoading(true);
    fetchPromoCampaigns().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing(null);
    setDraft({ title: '', description: '', buttonText: 'Подробнее', buttonLink: '/', order: items.length + 1, status: 'active', image: '' });
    setOpen(true);
  };
  const openEdit = (c: PromoCampaign) => { setEditing(c); setDraft({ ...c }); setOpen(true); };

  const handleSave = async () => {
    if (!draft.title) { toast.error('Введите заголовок'); return; }
    if (!draft.image) { toast.error('Загрузите изображение'); return; }

    setSaving(true);
    try {
      if (editing) {
        const updated = await updatePromoCampaign(editing.id, {
          title: draft.title,
          description: draft.description,
          buttonText: draft.buttonText,
          buttonLink: draft.buttonLink,
          image: draft.image,
          status: draft.status as 'active' | 'inactive',
        });
        setItems((prev) => prev.map((c) => c.id === editing.id ? updated : c));
        toast.success('Акция обновлена');
      } else {
        const created = await createPromoCampaign({
          title: draft.title,
          description: draft.description || '',
          buttonText: draft.buttonText || 'Подробнее',
          buttonLink: draft.buttonLink || '/',
          image: draft.image,
          order: items.length + 1,
          status: (draft.status as 'active' | 'inactive') || 'active',
        });
        setItems((prev) => [...prev, created]);
        toast.success('Акция создана');
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePromoCampaign(deleteId);
      setItems((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success('Акция удалена');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить');
    } finally {
      setDeleteId(null);
    }
  };

  const moveItem = async (id: string, dir: 'up' | 'down') => {
    const idx = items.findIndex((c) => c.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === items.length - 1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const next = [...items];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    const reordered = next.map((c, i) => ({ ...c, order: i + 1 }));
    setItems(reordered);
    try {
      await Promise.all([
        updatePromoCampaign(reordered[idx].id, { order: reordered[idx].order }),
        updatePromoCampaign(reordered[swapIdx].id, { order: reordered[swapIdx].order }),
      ]);
    } catch {
      toast.error('Не удалось сохранить порядок');
      load();
    }
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
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Порядок</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Превью</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Заголовок</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Кнопка</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, idx) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveItem(c.id, 'up')} disabled={idx === 0}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-center text-xs font-medium">{c.order}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveItem(c.id, 'down')} disabled={idx === items.length - 1}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-10 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {c.image && <img src={c.image} alt={c.title} className="w-full h-full object-cover" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium max-w-[200px] truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground max-w-[200px] truncate">{c.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{c.buttonText}</p>
                    <p className="text-xs text-muted-foreground">{c.buttonLink}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {c.status === 'active' ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(c.id)}>
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
          <div className="py-12 text-center text-muted-foreground text-sm">Рекламных акций пока нет</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать акцию' : 'Добавить акцию'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label>Изображение *</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-3 bg-muted/30">
                {draft.image ? (
                  <div className="relative w-full h-32">
                    <img src={draft.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button type="button" onClick={() => setDraft({ ...draft, image: '' })}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="flex flex-col items-center justify-center gap-1 py-6">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Нажмите, чтобы загрузить фото</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result;
                        if (typeof result === 'string') setDraft((prev) => ({ ...prev, image: result }));
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                )}
              </div>
            </div>
            <div>
              <Label>Заголовок *</Label>
              <Input className="mt-1" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea className="mt-1" rows={3} value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Текст кнопки</Label>
                <Input className="mt-1" value={draft.buttonText || ''} onChange={(e) => setDraft({ ...draft, buttonText: e.target.value })} />
              </div>
              <div>
                <Label>Ссылка кнопки</Label>
                <Input className="mt-1" value={draft.buttonLink || ''} onChange={(e) => setDraft({ ...draft, buttonLink: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as 'active' | 'inactive' })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активна</SelectItem>
                  <SelectItem value="inactive">Неактивна</SelectItem>
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
            <AlertDialogTitle>Удалить акцию?</AlertDialogTitle>
            <AlertDialogDescription>Она пропадёт со страницы рекламных акций.</AlertDialogDescription>
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
