import { useState } from 'react';
import { Search, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Review } from '@/types';
import { toast } from 'sonner';

// Reviews mock (inline since not in mockData)
const seedReviews: Review[] = [
  { id: 'r1', productId: 'p1', productName: 'Acer Aspire A6270 Laptop', authorName: 'Rustam K.', rating: 5, text: 'Excellent laptop! Works great for my tasks, fast performance.', date: '2026-07-10', status: 'approved' },
  { id: 'r2', productId: 'p5', productName: 'HP Victus 15', authorName: 'Dilnoza R.', rating: 4, text: 'Great gaming laptop, runs all my games smoothly.', date: '2026-07-15', status: 'approved' },
  { id: 'r3', productId: 'p12', productName: 'Epson EcoTank L3210', authorName: 'Farrukh I.', rating: 5, text: 'Incredible printer, ink lasts a very long time.', date: '2026-07-20', status: 'pending' },
  { id: 'r4', productId: 'p16', productName: 'Logitech MX Keys', authorName: 'Nargiza B.', rating: 5, text: 'Best keyboard I have ever used. The backlight is fantastic.', date: '2026-07-22', status: 'pending' },
  { id: 'r5', productId: 'p13', productName: 'Ergonomic Office Chair Pro', authorName: 'Alisher N.', rating: 4, text: 'Comfortable and good quality. My back feels much better now.', date: '2026-07-25', status: 'approved' },
  { id: 'r6', productId: 'p7', productName: 'ASUS Vivobook 15', authorName: 'Kamola S.', rating: 3, text: 'Decent laptop but runs a bit warm under load.', date: '2026-07-28', status: 'pending' },
  { id: 'r7', productId: 'p17', productName: 'Logitech MX Master 3', authorName: 'Bobur T.', rating: 5, text: 'Amazing mouse! The scroll wheel alone is worth the price.', date: '2026-07-30', status: 'approved' },
  { id: 'r8', productId: 'p15', productName: 'Height-Adjustable Office Desk', authorName: 'Gulnora M.', rating: 4, text: 'Solid desk, easy to adjust height. Looks great in my office.', date: '2026-08-01', status: 'rejected' },
];

const STATUS_BADGE: Record<Review['status'], string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminReviews() {
  const [items, setItems] = useState<Review[]>(seedReviews);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = items.filter((r) => {
    const matchSearch = r.authorName.toLowerCase().includes(search.toLowerCase())
      || r.productName.toLowerCase().includes(search.toLowerCase())
      || r.text.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = (id: string, status: Review['status']) => {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    toast.success(`Review ${status}`);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setItems((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success('Review deleted');
  };

  const pending = items.filter((r) => r.status === 'pending').length;

  return (
    <div className="flex flex-col gap-4">
      {pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800 font-medium">
          {pending} review{pending > 1 ? 's' : ''} pending moderation
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 card-shadow">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-sm">{r.authorName}</span>
                  <span className="text-xs text-muted-foreground">on</span>
                  <span className="text-xs text-primary font-medium">{r.productName}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Badge className={`text-xs ${STATUS_BADGE[r.status]}`}>{r.status}</Badge>
                {r.status !== 'approved' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:bg-green-50" onClick={() => updateStatus(r.id, 'approved')}>
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {r.status !== 'rejected' && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => updateStatus(r.id, 'rejected')}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(r.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm bg-card border border-border rounded-xl">No reviews found</div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
