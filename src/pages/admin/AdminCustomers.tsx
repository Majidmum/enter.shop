import { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { customers } from '@/lib/mockData';
import { useOrdersStore } from '@/store/ordersStore';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

export default function AdminCustomers() {
  const { orders } = useOrdersStore();
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<typeof customers[0] | null>(null);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const customerOrders = (id: string) => orders.filter((o) => o.customerId === id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} customers</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Customer</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Phone</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Registered</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Orders</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total Spent</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.registeredAt}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-primary/10 text-primary">{c.orderCount}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.totalSpent.toLocaleString()} TJS</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(c)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">No customers found</div>
        )}
      </div>

      {/* Customer detail */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer: {viewing?.name}</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Email', value: viewing.email },
                  { label: 'Phone', value: viewing.phone },
                  { label: 'Registered', value: viewing.registeredAt },
                  { label: 'Total Spent', value: `${viewing.totalSpent.toLocaleString()} TJS` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/40 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    <p className="font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">Order History ({customerOrders(viewing.id).length})</p>
                {customerOrders(viewing.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {customerOrders(viewing.id).map((order) => (
                      <div key={order.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-primary">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">{order.date} · {order.items.length} items</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{order.total.toLocaleString()} TJS</p>
                          <Badge className={`text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
