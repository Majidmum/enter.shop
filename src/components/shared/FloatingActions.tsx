import { useState, useEffect } from 'react';
import { Phone, ArrowUp, PhoneIncoming } from 'lucide-react';
import CallbackModal from '@/components/shared/CallbackModal';

/**
 * Плавающие кнопки в правом нижнем углу — всегда видимая кнопка звонка,
 * кнопка "заказать звонок" (для тех, кто не хочет звонить сам — актуально
 * и на мобильном, где кнопка в шапке не видна, она там только на десктопе),
 * и кнопка "наверх", которая появляется только после прокрутки страницы вниз.
 * На мобильном приподняты над плавающей нижней навигацией, чтобы не перекрывались.
 */
export default function FloatingActions() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed right-4 md:right-6 bottom-24 md:bottom-6 z-40 flex flex-col items-end gap-3">
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Наверх страницы"
          className="h-11 w-11 flex items-center justify-center rounded-full bg-card border border-border shadow-lg text-foreground hover:bg-muted transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setCallbackOpen(true)}
        aria-label="Заказать звонок"
        className="h-11 w-11 flex items-center justify-center rounded-full bg-card border border-border shadow-lg text-foreground hover:bg-muted transition-colors"
      >
        <PhoneIncoming className="h-5 w-5" />
      </button>
      <a
        href="tel:+992555000070"
        aria-label="Позвонить в ENTER.TJ"
        className="h-14 w-14 flex items-center justify-center rounded-full bg-primary text-white shadow-xl hover:bg-primary/90 transition-colors"
      >
        <Phone className="h-6 w-6" />
      </a>
      <CallbackModal open={callbackOpen} onOpenChange={setCallbackOpen} />
    </div>
  );
}
