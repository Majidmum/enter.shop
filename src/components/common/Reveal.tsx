import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  translateY?: number;
  translateX?: number;
  rotateX?: number;
  scaleFrom?: number;
  delay?: number;
  duration?: number;
}

/**
 * Оборачивает содержимое в <div>, который плавно появляется (на anime.js),
 * когда докручиваешь до него страницу. Пример:
 *   <Reveal translateY={24}><h2>Заголовок</h2></Reveal>
 *   <Reveal rotateX={25} delay={i * 100}>...карточка...</Reveal>
 */
export default function Reveal({
  children,
  className,
  translateY = 24,
  translateX = 0,
  rotateX = 0,
  scaleFrom,
  delay = 0,
  duration = 700,
}: RevealProps) {
  const ref = useScrollReveal<HTMLDivElement>({
    translateY,
    translateX,
    rotateX,
    scaleFrom: scaleFrom ?? 1,
    delay,
    duration,
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
