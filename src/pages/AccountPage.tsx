import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { useAuthStore } from '@/store/authStore';
import { useOrdersStore } from '@/store/ordersStore';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types';

type Tab = 'profile' | 'orders' | 'favorites' | 'addresses' | 'settings';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const { user, isAuthenticated, logout } = useAuthStore();
  const orders = useOrdersStore((s) => s.orders);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const myOrders = orders.filter((o) => o.customerId === user?.id || o.customerEmail === user?.email);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <Breadcrumb items={[{ label: 'Account' }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">My Account</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="rounded-xl bg-card border border-border overflow-hidden">
            <div className="p-4 bg-secondary text-white flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-xs text-white/60 truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="p-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
                  }`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
              <button onClick={logout} className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/5 transition-colors">
                <LogOut className="h-4 w-4 shrink-0" /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold text-base mb-4">My Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground mb-1">Full Name</p><p className="font-medium">{user?.name}</p></div>
                <div><p className="text-muted-foreground mb-1">Email</p><p className="font-medium">{user?.email}</p></div>
                <div><p className="text-muted-foreground mb-1">Phone</p><p className="font-medium">{user?.phone || '—'}</p></div>
              </div>
              <Button onClick={() => {}} className="mt-5 bg-primary hover:bg-primary/90 text-white">Edit Profile</Button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-bold text-base">My Orders</h2>
              </div>
              {myOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Order #</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Items</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Total</th>
                        <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myOrders.map((order) => (
                        <tr key={order.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium text-primary">{order.orderNumber}</td>
                          <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                          <td className="px-4 py-3">{order.items.reduce((s, i) => s + i.quantity, 0)} pcs</td>
                          <td className="px-4 py-3 font-semibold">{order.total.toLocaleString()} TJS</td>
                          <td className="px-4 py-3">
                            <Badge className={ORDER_STATUS_COLORS[order.status]}>
                              {ORDER_STATUS_LABELS[order.status]}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 gap-3">
                  <Package className="h-12 w-12 text-muted" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Link to="/catalog"><Button className="bg-primary hover:bg-primary/90 text-white">Go Shopping</Button></Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold text-base mb-2">Favorites</h2>
              <p className="text-muted-foreground text-sm">
                <Link to="/favorites" className="text-primary hover:underline">Go to Favorites page</Link>
              </p>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold text-base mb-4">Saved Addresses</h2>
              <p className="text-muted-foreground text-sm">No saved addresses yet.</p>
              <Button onClick={() => {}} className="mt-4 bg-primary hover:bg-primary/90 text-white" size="sm">Add Address</Button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="rounded-xl bg-card border border-border p-5">
              <h2 className="font-bold text-base mb-4">Settings</h2>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span>Email Notifications</span>
                  <Button variant="outline" size="sm" onClick={() => {}}>Configure</Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span>Change Password</span>
                  <Button variant="outline" size="sm" onClick={() => {}}>Change</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
