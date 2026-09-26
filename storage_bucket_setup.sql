-- ============================================================================
-- ENTER.TJ — Supabase Storage bucket "images" для фото товаров/баннеров/etc.
-- Выполнить в Supabase → SQL Editor → New query → Run.
-- Скрипт идемпотентный, можно запускать повторно.
--
-- Зачем: раньше все фото хранились как base64-текст прямо в строках таблиц
-- (products.images, banners.image, brands.logo, categories.image,
-- promo_campaigns.image, reviews.images). Это раздувало каждый запрос к базе
-- и было причиной быстрого роста egress-трафика Supabase, а вдобавок не
-- позволяло внешним сервисам (например, Google Merchant Center) читать фото
-- по обычной ссылке. Теперь фото загружаются как файлы в Storage, а в
-- таблицах остаётся только короткий URL.
-- ============================================================================

-- Сам бакет — публичный на чтение (фото должны открываться по прямой ссылке
-- всем, включая Google), но не на запись.
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- Читать может кто угодно (иначе фото не откроются на сайте).
drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read" on storage.objects
  for select using (bucket_id = 'images');

-- Загружать в папку reviews/ (фото к отзывам) может любой посетитель —
-- ровно как и сам отзыв (public.reviews разрешает insert всем, см.
-- reviews_insert_anyone в enter_tj_schema.sql).
drop policy if exists "images_reviews_insert_anyone" on storage.objects;
create policy "images_reviews_insert_anyone" on storage.objects
  for insert with check (bucket_id = 'images' and name like 'reviews/%');

-- Все остальные папки (products/, banners/, brands/, categories/,
-- promotions/) — загружать, менять и удалять может только администратор.
drop policy if exists "images_admin_insert" on storage.objects;
create policy "images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'images'
    and name not like 'reviews/%'
    and public.is_admin()
  );

drop policy if exists "images_admin_update" on storage.objects;
create policy "images_admin_update" on storage.objects
  for update using (bucket_id = 'images' and public.is_admin());

drop policy if exists "images_admin_delete" on storage.objects;
create policy "images_admin_delete" on storage.objects
  for delete using (bucket_id = 'images' and public.is_admin());

-- ============================================================================
-- ГОТОВО. После этого скрипта:
-- 1) примени патч storage-migration.patch (переводит загрузку фото в админке
--    и в форме отзыва на Storage вместо base64);
-- 2) запусти scripts/migrate-images-to-storage.mjs, чтобы перенести уже
--    существующие base64-фото в Storage (см. инструкцию в самом файле).
-- ============================================================================
