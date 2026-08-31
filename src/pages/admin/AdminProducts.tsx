import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { products as initialProducts, categories as initialCategories, brands as initialBrands } from '@/lib/mockData';
import type { Product } from '@/types';
import { toast } from 'sonner';

type ProductDraft = Partial<Product> & { name: string; price: number };

export default function AdminProducts() {
  const [items, setItems] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return initialProducts;
    const saved = localStorage.getItem('admin_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const [categories, setCategories] = useState(() => {
    if (typeof window === 'undefined') return initialCategories;
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });
  const [brands, setBrands] = useState(() => {
    if (typeof window === 'undefined') return initialBrands;
    const saved = localStorage.getItem('admin_brands');
    return saved ? JSON.parse(saved) : initialBrands;
  });
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>({ name: '', price: 0, status: 'active' });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('admin_products', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    setBrands(() => {
      const saved = localStorage.getItem('admin_brands');
      return saved ? JSON.parse(saved) : initialBrands;
    });
  }, []);

  useEffect(() => {
    setCategories(() => {
      const saved = localStorage.getItem('admin_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_brands' && e.newValue) {
        setBrands(JSON.parse(e.newValue));
      }
      if (e.key === 'admin_categories' && e.newValue) {
        setCategories(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filtered = items.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || p.categoryId === catFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const openNew = () => {
    const freshBrands = JSON.parse(localStorage.getItem('admin_brands') || JSON.stringify(initialBrands));
    const freshCategories = JSON.parse(localStorage.getItem('admin_categories') || JSON.stringify(initialCategories));
    setBrands(freshBrands);
    setCategories(freshCategories);
    setEditing(null);
    setDraft({ name: '', price: 0, status: 'active', stock: 0, categoryId: freshCategories?.[0]?.id || '', brandId: freshBrands?.[0]?.id || '' });
    setUploadedImages([]);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    const freshBrands = JSON.parse(localStorage.getItem('admin_brands') || JSON.stringify(initialBrands));
    const freshCategories = JSON.parse(localStorage.getItem('admin_categories') || JSON.stringify(initialCategories));
    setBrands(freshBrands);
    setCategories(freshCategories);
    setEditing(p);
    setDraft({ ...p });
    setUploadedImages(p.images || []);
    setOpen(true);
  };

  const handleSave = () => {
    if (!draft.name || !draft.price) { toast.error('Заполните обязательные поля'); return; }
    if (uploadedImages.length === 0) { toast.error('Добавьте хотя бы одно изображение'); return; }
    if (editing) {
      setItems((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...draft, images: uploadedImages } as Product : p));
      toast.success('Товар обновлён');
    } else {
      const cat = categories.find((c) => c.id === draft.categoryId);
      const brand = brands.find((b) => b.id === draft.brandId);
      const newProduct: Product = {
        id: `p_${Date.now()}`,
        sku: `SKU-${Date.now()}`,
        slug: draft.name.toLowerCase().replace(/\s+/g, '-'),
        categoryName: cat?.name || '',
        brandName: brand?.name || '',
        images: uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80'],
        description: draft.description || '',
        specs: [],
        rating: 0, reviewCount: 0,
        ...draft,
        name: draft.name,
        price: draft.price,
        status: (draft.status as 'active' | 'inactive') || 'active',
        stock: draft.stock || 0,
        categoryId: draft.categoryId || categories[0]?.id || '',
        brandId: draft.brandId || brands[0]?.id || '',
      };
      setItems((prev) => [newProduct, ...prev]);
      toast.success('Товар добавлен');
    }
    setOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setItems((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast.success('Товар удалён');
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">Товары не найдены</div>
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
                              if (event.target?.result && typeof event.target.result === 'string') {
                                setUploadedImages(prev => [...prev, event.target.result]);
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
                            if (event.target?.result && typeof event.target.result === 'string') {
                              setUploadedImages(prev => [...prev, event.target.result]);
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
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white">
              <Check className="h-4 w-4 mr-1.5" /> {editing ? 'Сохранить' : 'Добавить товар'}
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
