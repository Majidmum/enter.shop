import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { banners as initialBanners } from '@/lib/mockData';
import type { Banner } from '@/types';
import { toast } from 'sonner';

export default function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([...initialBanners].sort((a, b) => a.order - b.order));
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Banner>>({});

  const openNew = () => {
    setEditing(null);
    setDraft({ title: '', subtitle: '', buttonText: 'Learn More', buttonLink: '/', order: items.length + 1, status: 'active' });
    setOpen(true);
  };
  const openEdit = (b: Banner) => { setEditing(b); setDraft({ ...b }); setOpen(true); };

  const handleSave = () => {
    if (!draft.title) { toast.error('Введите заголовок баннера'); return; }
    if (editing) {
      setItems((prev) => prev.map((b) => b.id === editing.id ? { ...b, ...draft } as Banner : b));
      toast.success('Баннер обновлён');
    } else {
      const newBanner: Banner = {
        id: `banner_${Date.now()}`,
        title: draft.title || '',
        subtitle: draft.subtitle || '',
        buttonText: draft.buttonText || 'Подробнее',
        buttonLink: draft.buttonLink || '/',
        image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
        order: items.length + 1,
        status: (draft.status as 'active' | 'inactive') || 'active',
      };
      setItems((prev) => [...prev, newBanner]);
      toast.success('Баннер создан');
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setItems((prev) => prev.filter((b) => b.id !== deleteId));
    setDeleteId(null);
    toast.success('Баннер удалён');
  };

  const moveItem = (id: string, dir: 'up' | 'down') => {
    setItems((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (dir === 'up' && idx === 0) return prev;
      if (dir === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white h-9">
          <Plus className="h-4 w-4 mr-1.5" /> Добавить баннер
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
              {items.map((b, idx) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveItem(b.id, 'up')} disabled={idx === 0}>
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-center text-xs font-medium">{b.order}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => moveItem(b.id, 'down')} disabled={idx === items.length - 1}>
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-10 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium max-w-[160px] truncate">{b.title}</p>
                    <p className="text-xs text-muted-foreground max-w-[160px] truncate">{b.subtitle}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium">{b.buttonText}</p>
                    <p className="text-xs text-muted-foreground">{b.buttonLink}</p>
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
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать баннер' : 'Добавить баннер'}</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div>
              <Label>Заголовок *</Label>
              <Input className="mt-1" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div>
              <Label>Подзаголовок</Label>
              <Input className="mt-1" value={draft.subtitle || ''} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
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
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white">
              <Check className="h-4 w-4 mr-1.5" /> Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить баннер?</AlertDialogTitle>
            <AlertDialogDescription>Баннер будет удалён с главной страницы.</AlertDialogDescription>
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
