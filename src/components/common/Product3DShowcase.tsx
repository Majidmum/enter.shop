import { useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import type { Group } from 'three';
import { Button } from '@/components/ui/button';
import ProductMesh from '@/components/common/ProductMesh';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  product: Product;
  onBuyNow: () => void;
}

/**
 * Иммерсивная 3D-витрина товара: пока пользователь прокручивает эту секцию,
 * карточка товара (фото на объёмном "боксе") поворачивается на 360°,
 * затем увеличивается и смещается, освобождая место для характеристик,
 * и в конце сцена возвращается в центр рядом с кнопкой "Купить".
 * Реализовано на Three.js / React Three Fiber + GSAP ScrollTrigger.
 */
export default function Product3DShowcase({ product, onBuyNow }: Props) {
  const { t } = useTranslation();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<Group>(null!);
  const specsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !groupRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: pinRef.current,
        },
      });

      // Стадия 1 (0–1): плавный поворот на 360°
      tl.to(groupRef.current.rotation, { y: Math.PI * 2, ease: 'none', duration: 1 }, 0);

      // Стадия 2 (1–1.6): увеличение и смещение в сторону — освобождаем место под характеристики
      tl.to(groupRef.current.scale, { x: 1.25, y: 1.25, z: 1.25, ease: 'power1.inOut', duration: 0.6 }, 1);
      tl.to(groupRef.current.position, { x: 1.3, ease: 'power1.inOut', duration: 0.6 }, 1);
      if (specsRef.current) {
        tl.fromTo(
          specsRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, ease: 'power1.out', duration: 0.6 },
          1.15
        );
      }

      // Стадия 3 (2.1–2.6): возврат в центр + появление кнопки "Купить"
      tl.to(groupRef.current.scale, { x: 1, y: 1, z: 1, ease: 'power1.inOut', duration: 0.5 }, 2.1);
      tl.to(groupRef.current.position, { x: 0, ease: 'power1.inOut', duration: 0.5 }, 2.1);
      if (specsRef.current) {
        tl.to(specsRef.current, { opacity: 0, duration: 0.3 }, 2.1);
      }
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, ease: 'power1.out', duration: 0.4 }, 2.3);
      }
    }, wrapperRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return (
    <div ref={wrapperRef} className="relative h-[300vh]">
      <div ref={pinRef} className="sticky top-0 h-screen w-full overflow-hidden bg-secondary">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="!absolute inset-0">
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 4, 5]} intensity={1.1} />
          <directionalLight position={[-3, -2, 2]} intensity={0.3} />
          <Suspense fallback={null}>
            <ProductMesh image={product.images[0]} groupRef={groupRef} />
          </Suspense>
        </Canvas>

        {/* Характеристики — появляются на 2-й стадии прокрутки */}
        <div
          ref={specsRef}
          className="absolute left-4 sm:left-10 md:left-16 top-1/2 -translate-y-1/2 max-w-[220px] sm:max-w-xs text-white opacity-0 pointer-events-none"
        >
          <h3 className="text-base sm:text-lg font-bold mb-3">{product.name}</h3>
          <ul className="flex flex-col gap-1.5 text-xs sm:text-sm">
            {product.specs.slice(0, 5).map((s, i) => (
              <li key={i} className="flex justify-between gap-4 border-b border-white/20 pb-1.5">
                <span className="text-white/60">{s.label}</span>
                <span className="text-right">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Финальная кнопка "Купить" — появляется в конце сценария */}
        <div ref={ctaRef} className="absolute bottom-10 sm:bottom-14 left-1/2 -translate-x-1/2 opacity-0">
          <Button
            onClick={onBuyNow}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 shadow-xl"
          >
            {t('common.buy_now')} — {product.price.toLocaleString()} {t('common.currency')}
          </Button>
        </div>

        {/* Подсказка "листайте вниз" в самом начале */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs animate-bounce">
          ↓
        </div>
      </div>
    </div>
  );
}
