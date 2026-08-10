import { useState } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrdersStore } from '@/store/ordersStore';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types';
import { toast } from 'sonner';

const STATUS_OPTIONS: OrderStatus[] = ['new', 'confirmed', 'assembling', 'ready', 'delivering', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { orders, updateStatus } = useOrdersStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<typeof orders[0] | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase())
      || o.customerName.toLowerCase().includes(search.toLowerCase())
      || o.customerPhone.includes(search);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatus = (orderId: string, status: OrderStatus) => {
    updateStatus(orderId, status);
    toast.success('Order status updated');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{ORDER_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} orders</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order #</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Delivery</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-primary">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.items.length} items</td>
                  <td className="px-4 py-3 font-semibold">{order.total.toLocaleString()} TJS</td>
                  <td className="px-4 py-3">
                    <Badge className={order.deliveryMethod === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}>
                      {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={order.status} onValueChange={(v) => handleStatus(order.id, v as OrderStatus)}>
                      <SelectTrigger className={`h-7 text-xs w-36 font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">{ORDER_STATUS_LABELS[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(order)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No orders found</div>
        )}
      </div>

      {/* Order detail dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order {viewing?.orderNumber}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <p className="font-semibold">{viewing.customerName}</p>
                  <p className="text-muted-foreground">{viewing.customerPhone}</p>
                  <p className="text-muted-foreground">{viewing.customerEmail}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Delivery</p>
                  <p className="font-semibold capitalize">{viewing.deliveryMethod}</p>
                  {viewing.address && <p className="text-muted-foreground">{viewing.address}</p>}
                  <p className="text-xs mt-1">Payment: <span className="font-medium capitalize">{viewing.paymentMethod}</span></p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Items</p>
                <div className="flex flex-col gap-2">
                  {viewing.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2.5">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.price.toLocaleString()} TJS × {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm shrink-0">{(item.price * item.quantity).toLocaleString()} TJS</p>
                    </div>
                  ))}
                </div>
              </div>
              {viewing.comment && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Comment</p>
                  <p className="text-sm">{viewing.comment}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-xl font-bold">{viewing.total.toLocaleString()} TJS</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
