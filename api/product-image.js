// Serverless-функция (Vercel): отдаёт фото товара по обычной ссылке.
//
// Зачем это нужно: фотографии товаров сейчас хранятся в базе Supabase как
// base64-строки (data:image/jpeg;base64,...), а не как ссылки на файлы. Для
// сайта это работает, но Google Merchant Center (и вообще любой внешний
// сервис) не может использовать base64 в качестве image_link — ему обязательно
// нужен настоящий URL, который можно скачать HTTP-запросом.
//
// Эта функция — мост между ними: принимает id товара и номер фото,
// разбирает base64 из строки в базе и отдаёт как обычную картинку с
// правильным Content-Type. Ссылка вида
//   https://enter.tj/api/product-image?id=<id товара>&i=0
// работает как обычная ссылка на фото и не требует переноса всех фото в
// Supabase Storage.
//
// Кэшируется на CDN Vercel на неделю — значит при повторных запросах (а
// Google обращается к фото регулярно) сама база Supabase почти не
// нагружается, что дополнительно снижает расход egress-трафика.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      res.status(500).send('Supabase env vars are not configured');
      return;
    }

    const id = typeof req.query.id === 'string' ? req.query.id : '';
    const index = Number.parseInt(typeof req.query.i === 'string' ? req.query.i : '0', 10) || 0;

    if (!id) {
      res.status(400).send('Missing "id" parameter');
      return;
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await supabase
      .from('products')
      .select('images')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      res.status(404).send('Product not found');
      return;
    }

    const images = Array.isArray(data.images) ? data.images : [];
    const raw = images[index];

    if (!raw) {
      res.status(404).send('Image not found');
      return;
    }

    // Фото могли когда-то загрузить и как обычную ссылку (не base64) —
    // в этом случае просто перенаправляем на неё.
    if (!raw.startsWith('data:')) {
      res.writeHead(302, { Location: raw });
      res.end();
      return;
    }

    const match = /^data:([^;]+);base64,(.+)$/.exec(raw);
    if (!match) {
      res.status(422).send('Unsupported image format');
      return;
    }

    const [, mime, base64] = match;
    const buffer = Buffer.from(base64, 'base64');

    res.setHeader('Content-Type', mime);
    // Кэш на CDN Vercel на неделю + разрешаем браузеру кэшировать сутки.
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).send('Internal error');
  }
}
