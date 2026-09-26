// Serverless-функция (Vercel): фид товаров для Google Merchant Center.
//
// Доступен по адресу https://enter.tj/api/feed.xml — именно эту ссылку нужно
// указать в Merchant Center как "Схема получения" (Fetch), чтобы Google сам
// периодически забирал свежий список товаров прямо из базы. Ничего не нужно
// генерировать заранее и вручную перезаливать — при каждом запросе фид
// собирается из актуальных данных Supabase.
//
// Формат — стандартный RSS 2.0 с пространством имён g: (Google Merchant
// Center feed spec): https://support.google.com/merchants/answer/7052112

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const SITE_URL = 'https://enter.tj';
const CURRENCY = 'TJS';

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Описание в базе может содержать перенос строк/HTML из старых товаров —
// для фида нужен чистый текст.
function stripHtml(value) {
  return String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildItemXml(p) {
  const link = `${SITE_URL}/product/${p.slug}`;
  const imageLink = `${SITE_URL}/api/product-image?id=${p.id}&i=0`;
  const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';
  const description = stripHtml(p.description) || p.name;
  const brand = p.brands?.name || 'ENTER.TJ';
  const category = p.categories?.name;

  return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <title>${escapeXml(p.name)}</title>
      <description>${escapeXml(description.slice(0, 5000))}</description>
      <link>${escapeXml(link)}</link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} ${CURRENCY}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      ${category ? `<g:product_type>${escapeXml(category)}</g:product_type>` : ''}
    </item>`;
}

export default async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      res.status(500).send('Supabase env vars are not configured');
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, stock, status, description, images, categories(name), brands(name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).send(`Supabase error: ${error.message}`);
      return;
    }

    const products = (data || []).filter((p) => Array.isArray(p.images) && p.images.length > 0);

    const itemsXml = products.map(buildItemXml).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ENTER.TJ — товары</title>
    <link>${SITE_URL}</link>
    <description>Фид товаров ENTER.TJ для Google Merchant Center</description>
${itemsXml}
  </channel>
</rss>
`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // Google сам ходит за фидом по расписанию — держим короткий кэш на
    // случай ручных проверок, но не устариваем данные надолго.
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send('Internal error');
  }
}
