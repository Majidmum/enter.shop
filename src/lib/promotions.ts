import type { Product, Promotion } from '@/types';

/**
 * Пересчитывает цену товаров с учётом активных акций (когда товар отмечен
 * в акции через productIds, а не через собственное поле discount товара).
 * Товары с уже заданной собственной скидкой не трогает.
 * Используется на всех страницах, где показываются товары покупателю —
 * чтобы "В корзину" везде добавляло товар по правильной, уже сниженной цене.
 */
export function applyActivePromotions(products: Product[], activePromotions: Promotion[]): Product[] {
  if (activePromotions.length === 0) return products;

  return products.map((p) => {
    if (p.discount) return p;
    const promoDiscounts = activePromotions
      .filter((promo) => promo.productIds.includes(p.id))
      .map((promo) => promo.discount);
    if (promoDiscounts.length === 0) return p;

    const discount = Math.max(...promoDiscounts);
    const discountedPrice = Math.round(p.price * (1 - discount / 100));
    return { ...p, discount, oldPrice: p.price, price: discountedPrice };
  });
}
