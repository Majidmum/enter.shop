import { Link } from 'react-router-dom';
import { Scale, X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageMeta from '@/components/common/PageMeta';
import { useCompareStore } from '@/store/compareStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';

export default function ComparePage() {
  const { items, remove, clear } = useCompareStore();
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (productId: string) => {
    const product = items.find((p) => p.id === productId);
    if (!product) return;
    addToCart(product);
    toast.success(`${product.name} добавлен в корзину`);
  };

  // Список всех характеристик, которые есть хотя бы у одного из сравниваемых
  // товаров — так таблица получается общей, даже если у товаров разный набор
  // спецификаций (например, ноутбук и стул сравнивать вряд ли будут, но у
  // товаров одной категории почти всегда пересекаются не все поля).
  const allSpecLabels = Array.from(
    new Set(items.flatMap((p) => p.specs.map((s) => s.label)))
  );

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta
        title="Сравнение товаров — ENTER.TJ"
        description="Сравните характеристики выбранных товаров ENTER.TJ"
        noIndex
      />

      <div className="flex items-center justify-between gap-3 mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Scale className="h-6 w-6" /> Сравнение товаров
        </h1>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={clear}>
            Очистить всё
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
          <Scale className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground max-w-sm">
            Вы ещё не добавили товары к сравнению. Нажмите на значок весов на карточке товара в каталоге.
          </p>
          <Link to="/catalog">
            <Button className="bg-primary hover:bg-primary/90 text-white">Перейти в каталог</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left align-bottom w-40 pb-3 text-sm text-muted-foreground font-medium">
                  Характеристика
                </th>
                {items.map((p) => (
                  <th key={p.id} className="align-bottom px-3 pb-3 min-w-[180px]">
                    <div className="relative flex flex-col items-center text-center gap-2">
                      <button
                        onClick={() => remove(p.id)}
                        aria-label="Убрать из сравнения"
                        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted hover:bg-destructive hover:text-white transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <Link to={`/product/${p.slug}`} className="block w-20 h-20 rounded-lg overflow-hidden bg-muted">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      </Link>
                      <Link to={`/product/${p.slug}`} className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
                        {p.name}
                      </Link>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-foreground">{p.price.toLocaleString()} сом.</span>
                        {p.oldPrice && (
                          <span className="text-[11px] text-destructive line-through">{p.oldPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(p.id)}
                        disabled={p.stock === 0}
                        className="h-7 text-xs bg-primary hover:bg-primary/90 text-white w-full"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                        В корзину
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allSpecLabels.map((label, i) => (
                <tr key={label} className={i % 2 === 0 ? 'bg-muted/40' : ''}>
                  <td className="py-2.5 px-1 text-sm text-muted-foreground align-top">{label}</td>
                  {items.map((p) => {
                    const spec = p.specs.find((s) => s.label === label);
                    return (
                      <td key={p.id} className="py-2.5 px-3 text-sm text-foreground text-center align-top">
                        {spec?.value || '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {allSpecLabels.length === 0 && (
                <tr>
                  <td colSpan={items.length + 1} className="py-6 text-center text-sm text-muted-foreground">
                    У сравниваемых товаров нет заполненных характеристик
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
