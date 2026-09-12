import { Outlet } from 'react-router-dom';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import FloatingActions from '@/components/shared/FloatingActions';

export default function ClientLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <FloatingActions />
    </div>
  );
}
