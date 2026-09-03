import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchProducts, createProduct, updateProduct, deleteProduct,
  fetchCategories, fetchBrands,
} from '@/lib/supabaseData';
import type { Product, Category, Brand } from '@/types';
import { toast } from 'sonner';

type ProductDraft = Partial<Product> & { name: string; price: number };

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>({ name: '', price: 0, status: 'active' });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([fetchProducts(), fetchCategories(), fetchBrands()])
      .then(([p, c, b]) => { setItems(p); setCategories(c); setBrands(b); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = items.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.categoryId === catFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const openNew = () => {
    setEditing(null);
    setDraft({ name: '', price: 0, status: 'active', stock: 0, categoryId: categories[0]?.id || '', brandId: brands[0]?.id || '' });
    setUploadedImages([]);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setDraft({ ...p });
    setUploadedImages(p.images || []);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name || !draft.price) { toast.error('Заполните обязательные поля'); return; }
    if (uploadedImages.length === 0) { toast.error('Добавьте хотя бы одно изображение'); return; }

    setSaving(true);
    try {
      if (editing) {
        const updated = await updateProduct(editing.id, {
          name: draft.name,
          price: draft.price,
          oldPrice: draft.oldPrice,
          categoryId: draft.categoryId,
          brandId: draft.brandId,
          stock: draft.stock,
          status: draft.status as 'active' | 'inactive',
          description: draft.description,
          images: uploadedImages,
          isNew: !!draft.isNew,
          isFeatured: !!draft.isFeatured,
        });
        setItems((prev) => prev.map((p) => p.id === editing.id ? updated : p));
        toast.success('Товар обновлён');
      } else {
        const created = await createProduct({
          name: draft.name,
          price: draft.price,
          oldPrice: draft.oldPrice,
          categoryId: draft.categoryId || categories[0]?.id,
          brandId: draft.brandId || brands[0]?.id,
          stock: draft.stock || 0,
          status: (draft.status as 'active' | 'inactive') || 'active',
          description: draft.description || '',
          images: uploadedImages,
          isNew: !!draft.isNew,
          isFeatured: !!draft.isFeatured,
        });
        setItems((prev) => [created, ...prev]);
        toast.success('Товар добавлен');
      }
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сохранить товар');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      setItems((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success('Товар удалён');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось удалить товар');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Поиск по названию или SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="active">Активен</SelectItem>
            <SelectItem value="inactive">Неактивен</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-white h-9 ml-auto shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Добавить товар
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Товар</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Категория</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Бренд</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Цена</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Склад</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[160px]">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.categoryName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.brandName}</td>
                  <td className="px-4 py-3 font-semibold">{p.price.toLocaleString()} сом.</td>
                  <td className="px-4 py-3">
                    <span className={p.stock > 0 ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                      {p.status === 'active' ? 'Активен' : 'Неактивен'}
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
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">Товары не найдены</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        )}
      </div>

      {/* Edit/Add dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать товар' : 'Добавить товар'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <Label>Название товара *</Label>
              <Input className="mt-1" value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Название товара" />
            </div>
            <div>
              <Label>Цена (сом.) *</Label>
              <Input className="mt-1" type="number" value={draft.price || ''} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Старая цена</Label>
              <Input className="mt-1" type="number" value={draft.oldPrice || ''} onChange={(e) => setDraft({ ...draft, oldPrice: Number(e.target.value) || undefined })} />
            </div>
            <div>
              <Label>Категория</Label>
              <Select value={draft.categoryId} onValueChange={(v) => setDraft({ ...draft, categoryId: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Бренд</Label>
              <Select value={draft.brandId} onValueChange={(v) => setDraft({ ...draft, brandId: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Остаток</Label>
              <Input className="mt-1" type="number" value={draft.stock ?? ''} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
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
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label className="cursor-pointer">Новинка</Label>
                <Switch checked={!!draft.isNew} onCheckedChange={(v) => setDraft({ ...draft, isNew: v })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label className="cursor-pointer">Популярный</Label>
                <Switch checked={!!draft.isFeatured} onCheckedChange={(v) => setDraft({ ...draft, isFeatured: v })} />
              </div>
            </div>
            <div className="md:col-span-2">
              <Label>Описание</Label>
              <Textarea className="mt-1" rows={3} value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Изображения товара</Label>
              <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 bg-muted/30">
                {uploadedImages.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden">
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="block">
                      <div className="cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Добавить ещё изображение</span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          Array.from(e.target.files || []).forEach((file) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result;
                              if (typeof result === 'string') {
                                setUploadedImages(prev => [...prev, result]);
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <label className="block">
                    <div className="cursor-pointer text-center py-8">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Перетащите изображения сюда</p>
                      <p className="text-xs text-muted-foreground mb-3">или нажмите для выбора</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        Array.from(e.target.files || []).forEach((file) => {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result;
                            if (typeof result === 'string') {
                              setUploadedImages(prev => [...prev, result]);
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                  </label>
                )}
              </div>
              {uploadedImages.length === 0 && (
                <p className="text-xs text-destructive mt-1">* Требуется минимум одно изображение</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
              <Check className="h-4 w-4 mr-1.5" /> {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Добавить товар'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
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
