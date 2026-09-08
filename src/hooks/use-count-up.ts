import { useEffect, useRef, useState } from 'react';

/**
 * Анимирует число от 0 до target, когда элемент впервые появляется
 * в области видимости при прокрутке. Без внешних библиотек —
 * чистый IntersectionObserver + requestAnimationFrame.
 */
export function useCountUp<T extends HTMLElement = HTMLElement>(target: number, duration = 1500) {
  const ref = useRef<T>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              // easeOutCubic — быстрый разгон, плавное замедление к концу
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(target * eased));
              if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { ref, value };
}
