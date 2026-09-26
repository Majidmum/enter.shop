#!/usr/bin/env node
// ============================================================================
// Разовый скрипт: переносит уже существующие base64-фото (products.images,
// product_colors.images, banners.image, brands.logo, categories.image,
// promo_campaigns.image, reviews.images) в Supabase Storage (bucket "images")
// и заменяет их в базе на обычные ссылки.
//
// Запускать один раз, ПОСЛЕ того как:
//   1) выполнен storage_bucket_setup.sql в Supabase SQL Editor;
//   2) применён патч storage-migration.patch (новый код загрузки фото).
// Старые товары/баннеры/т.д., у которых фото уже base64, сами по себе не
// обновятся — этот скрипт нужен именно для них. Новые загрузки после патча
// уже будут сразу попадать в Storage.
//
// Запуск (из корня проекта, где стоят зависимости из package.json):
//   SUPABASE_URL=https://fnorvkjfmijgiiozyjdx.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service_role ключ из Supabase → Settings → API> \
//   node scripts/migrate-images-to-storage.mjs
//
// Service role ключ (НЕ anon-ключ) нужен, чтобы скрипт мог обновить любую
// строку и загрузить файлы в Storage в обход RLS-политик "только админ".
// Ключ нигде не сохраняется скриптом и не должен попадать в git — держи его
// только в переменной окружения при разовом запуске.
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Нужны переменные окружения SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
const BUCKET = 'images';

let uploaded = 0;
let skipped = 0;
let failed = 0;

/** Заливает одну base64 data-URL в Storage и возвращает публичную ссылку. */
async function uploadDataUrl(dataUrl, folder) {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null; // уже не base64 (обычная ссылка) — пропускаем

  const [, mime, base64] = match;
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(base64, 'base64');

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) {
    console.error(`  ✗ Ошибка загрузки в ${path}:`, error.message);
    failed++;
    return null;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  uploaded++;
  return data.publicUrl;
}

/** Переносит массив фото (например products.images) — то, что уже не base64,
 *  оставляет как есть. */
async function migrateImageArray(images, folder) {
  if (!Array.isArray(images)) return images;
  const result = [];
  for (const img of images) {
    if (typeof img === 'string' && img.startsWith('data:')) {
      const url = await uploadDataUrl(img, folder);
      result.push(url || img); // если не получилось — не теряем фото совсем
    } else {
      result.push(img);
      skipped++;
    }
  }
  return result;
}

/** Переносит одну строковую колонку (banners.image, brands.logo, ...). */
async function migrateImageField(value, folder) {
  if (typeof value !== 'string' || !value.startsWith('data:')) {
    if (value) skipped++;
    return value;
  }
  const url = await uploadDataUrl(value, folder);
  return url || value;
}

async function migrateProducts() {
  console.log('\n=== Товары (products.images) ===');
  const { data, error } = await supabase.from('products').select('id, images');
  if (error) throw error;
  for (const row of data || []) {
    const newImages = await migrateImageArray(row.images, 'products');
    if (JSON.stringify(newImages) !== JSON.stringify(row.images)) {
      const { error: updErr } = await supabase.from('products').update({ images: newImages }).eq('id', row.id);
      if (updErr) console.error(`  ✗ Не удалось обновить products.id=${row.id}:`, updErr.message);
      else console.log(`  ✓ products.id=${row.id} — ${newImages.length} фото перенесено`);
    }
  }
}

async function migrateProductColors() {
  console.log('\n=== Варианты цвета товаров (product_colors.images) ===');
  const { data, error } = await supabase.from('product_colors').select('id, images');
  if (error) throw error;
  for (const row of data || []) {
    const newImages = await migrateImageArray(row.images, 'products');
    if (JSON.stringify(newImages) !== JSON.stringify(row.images)) {
      const { error: updErr } = await supabase.from('product_colors').update({ images: newImages }).eq('id', row.id);
      if (updErr) console.error(`  ✗ Не удалось обновить product_colors.id=${row.id}:`, updErr.message);
      else console.log(`  ✓ product_colors.id=${row.id} — ${newImages.length} фото перенесено`);
    }
  }
}

async function migrateReviews() {
  console.log('\n=== Фото к отзывам (reviews.images) ===');
  const { data, error } = await supabase.from('reviews').select('id, images');
  if (error) throw error;
  for (const row of data || []) {
    const newImages = await migrateImageArray(row.images, 'reviews');
    if (JSON.stringify(newImages) !== JSON.stringify(row.images)) {
      const { error: updErr } = await supabase.from('reviews').update({ images: newImages }).eq('id', row.id);
      if (updErr) console.error(`  ✗ Не удалось обновить reviews.id=${row.id}:`, updErr.message);
      else console.log(`  ✓ reviews.id=${row.id} — ${newImages.length} фото перенесено`);
    }
  }
}

async function migrateSingleImageTable(table, column, folder) {
  console.log(`\n=== ${table}.${column} ===`);
  const { data, error } = await supabase.from(table).select(`id, ${column}`);
  if (error) throw error;
  for (const row of data || []) {
    const oldValue = row[column];
    const newValue = await migrateImageField(oldValue, folder);
    if (newValue !== oldValue) {
      const { error: updErr } = await supabase.from(table).update({ [column]: newValue }).eq('id', row.id);
      if (updErr) console.error(`  ✗ Не удалось обновить ${table}.id=${row.id}:`, updErr.message);
      else console.log(`  ✓ ${table}.id=${row.id} — фото перенесено`);
    }
  }
}

async function main() {
  console.log('Перенос base64-фото в Supabase Storage...');

  await migrateProducts();
  await migrateProductColors();
  await migrateReviews();
  await migrateSingleImageTable('banners', 'image', 'banners');
  await migrateSingleImageTable('brands', 'logo', 'brands');
  await migrateSingleImageTable('categories', 'image', 'categories');
  await migrateSingleImageTable('promo_campaigns', 'image', 'promotions');

  console.log('\n=== Готово ===');
  console.log(`Загружено в Storage: ${uploaded}`);
  console.log(`Пропущено (уже не base64 / пусто): ${skipped}`);
  console.log(`Ошибок: ${failed}`);
  if (failed > 0) {
    console.log('\nЕсть ошибки — исходные base64-значения НЕ были потеряны там, где загрузка не удалась. Можно запустить скрипт повторно.');
  }
}

main().catch((err) => {
  console.error('Скрипт завершился с ошибкой:', err);
  process.exit(1);
});
