import { useEffect, useRef } from 'react';
import { animate } from 'animejs';

interface ScrollRevealOptions {
  /** Смещение по Y в начальном состоянии (px). Элемент "въезжает" с этого смещения. */
  translateY?: number;
  /** Смещение по X в начальном состоянии (px). */
  translateX?: number;
  /** Поворот по оси X в градусах — даёт настоящий 3D-эффект (нужен perspective на родителе). */
  rotateX?: number;
  /** Начальный масштаб (1 = без изменений). */
  scaleFrom?: number;
  /** Задержка перед стартом анимации, мс. Удобно для "каскадного" появления карточек. */
  delay?: number;
  /** Длительность анимации, мс. */
  duration?: number;
}

/**
 * Хук для анимации появления элемента при прокрутке (на anime.js).
 * Возвращает ref, который нужно повесить на анимируемый DOM-элемент.
 * Анимация запускается один раз, при первом попадании элемента в область видимости.
 */
export function useScrollReveal<T extends HTMLElement>(options: ScrollRevealOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      translateY = 0,
      translateX = 0,
      rotateX = 0,
      scaleFrom = 1,
      delay = 0,
      duration = 700,
    } = options;

    // Начальное (скрытое) состояние — выставляем сразу, без анимации.
    el.style.opacity = '0';
    el.style.transform = `translateY(${translateY}px) translateX(${translateX}px) rotateX(${rotateX}deg) scale(${scaleFrom})`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(el, {
              opacity: [0, 1],
              translateY: [translateY, 0],
              translateX: [translateX, 0],
              rotateX: [rotateX, 0],
              scale: [scaleFrom, 1],
              delay,
              duration,
              easing: 'easeOutCubic',
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
