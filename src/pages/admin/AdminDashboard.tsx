import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useOrdersStore } from '@/store/ordersStore';
import { getProducts } from '@/lib/getStorageData';
import { customers } from '@/lib/mockData';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

const salesData = [
  { month: 'Jan', revenue: 42000, orders: 28 },
  { month: 'Feb', revenue: 38000, orders: 24 },
  { month: 'Mar', revenue: 56000, orders: 37 },
  { month: 'Apr', revenue: 61000, orders: 41 },
  { month: 'May', revenue: 48000, orders: 32 },
  { month: 'Jun', revenue: 72000, orders: 48 },
  { month: 'Jul', revenue: 83000, orders: 55 },
  { month: 'Aug', revenue: 91000, orders: 61 },
];

export default function AdminDashboard() {
  const products = getProducts();
  const topProducts = products.filter((p) => p.isFeatured).slice(0, 5);
  const orders = useOrdersStore((s) => s.orders);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const newOrders = orders.filter((o) => o.status === 'new').length;

  const stats = [
    { label: 'Выручка', value: `${totalRevenue.toLocaleString()} сом.`, icon: TrendingUp, delta: '+12%', color: 'text-green-600' },
    { label: 'Заказы', value: orders.length, icon: ShoppingBag, delta: `${newOrders} новых`, color: 'text-blue-600' },
    { label: 'Товары', value: products.length, icon: Package, delta: 'В каталоге', color: 'text-purple-600' },
    { label: 'Клиенты', value: customers.length, icon: Users, delta: '+3 на этой неделе', color: 'text-orange-600' },
  ];

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, delta, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 card-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className={`text-xs font-medium ${color} flex items-center gap-0.5`}>
                <ArrowUpRight className="h-3 w-3" />{delta}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 card-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">Выручка по месяцам</h2>
            <span className="text-xs text-muted-foreground">сом.</span>
          </div>
          <div className="w-full min-w-0 overflow-hidden" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(220 78% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(220 78% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                  formatter={(value: number) => [`${value.toLocaleString()} сом.`, 'Выручка']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(220 78% 48%)" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders chart */}
        <div className="bg-card border border-border rounded-xl p-5 card-shadow">
          <h2 className="font-bold mb-5">Заказы по месяцам</h2>
          <div className="w-full min-w-0 overflow-hidden" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                />
                <Bar dataKey="orders" fill="hsl(199 89% 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders + Top products */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Orders table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden card-shadow">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-bold">Последние заказы</h2>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-muted/40">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Заказ №</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Клиент</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Сумма</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-primary">{order.orderNumber}</td>
                    <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[120px]">{order.customerName}</td>
                    <td className="px-4 py-2.5 font-semibold">{order.total.toLocaleString()} сом.</td>
                    <td className="px-4 py-2.5">
                      <Badge className={`text-xs ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top products */}
        <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold">Популярные товары</h2>
          </div>
          <div className="p-3 flex flex-col gap-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-lg font-black text-muted w-5 shrink-0">{i + 1}</span>
                <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.price.toLocaleString()} сом.</p>
                </div>
                <span className="text-xs text-green-600 font-medium shrink-0">{p.stock} шт.</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
