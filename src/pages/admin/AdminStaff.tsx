import { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldOff, UserCog } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchAllStaffCandidates, setUserRole } from '@/lib/supabaseData';
import type { StaffMember } from '@/types';
import { toast } from 'sonner';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  manager: 'Менеджер',
  user: 'Покупатель',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  manager: 'bg-accent/10 text-accent',
  user: 'bg-muted text-muted-foreground',
};

export default function AdminStaff() {
  const [items, setItems] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStaffCandidates().then(setItems).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleManager = async (user: StaffMember) => {
    setBusyId(user.id);
    try {
      const nextRole = user.role === 'manager' ? 'user' : 'manager';
      const updated = await setUserRole(user.id, nextRole);
      setItems((prev) => prev.map((u) => u.id === user.id ? updated : u));
      toast.success(nextRole === 'manager' ? `${user.fullName} теперь менеджер` : `Роль менеджера снята с ${user.fullName}`);
    } catch (e: any) {
      toast.error(e.message || 'Не удалось изменить роль');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
        <UserCog className="h-4 w-4 shrink-0" />
        Менеджер получает доступ ко всей админке, кроме дашборда и этого раздела. Найдите
        зарегистрированного пользователя по email и назначьте роль.
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Поиск по email или имени..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Пользователь</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Роль</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.fullName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {u.role === 'admin' ? (
                      <span className="text-xs text-muted-foreground">Роль администратора меняется только напрямую в базе</span>
                    ) : (
                      <Button
                        size="sm"
                        variant={u.role === 'manager' ? 'outline' : 'default'}
                        disabled={busyId === u.id}
                        onClick={() => handleToggleManager(u)}
                        className={u.role === 'manager' ? '' : 'bg-primary hover:bg-primary/90 text-white'}
                      >
                        {u.role === 'manager' ? (
                          <><ShieldOff className="h-3.5 w-3.5 mr-1.5" /> Снять роль менеджера</>
                        ) : (
                          <><ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Сделать менеджером</>
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">Пользователи не найдены</div>
        )}
        {loading && (
          <div className="py-12 text-center text-muted-foreground text-sm">Загрузка...</div>
        )}
      </div>
    </div>
  );
}
