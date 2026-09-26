/**
 * Сжимает загруженное фото и загружает его в Supabase Storage (bucket "images"),
 * возвращая обычную публичную ссылку — вместо того чтобы превращать фото в
 * base64-текст и хранить его прямо в строке таблицы.
 *
 * Раньше именно base64-в-БД был причиной быстрого роста egress-трафика
 * Supabase (каждая загрузка каталога заново скачивала все фото как часть
 * данных из базы) и не позволял Google Merchant Center читать фото по ссылке.
 * Теперь фото — обычный файл на CDN, а в базе хранится только его короткий URL.
 *
 * @param file исходный файл из <input type="file">
 * @param folder подпапка в бакете — по типу сущности (products, banners, brands...)
 * @param maxSize максимальная ширина/высота в пикселях (пропорции сохраняются)
 * @param quality качество JPEG-сжатия (0–1)
 */
import { supabase } from '@/db/supabase';

const BUCKET = 'images';

function compressToBlob(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось получить контекст canvas'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Не удалось сжать изображение'))),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}

export async function uploadImageToStorage(
  file: File,
  folder: string,
  maxSize = 1600,
  quality = 0.82
): Promise<string> {
  const blob = await compressToBlob(file, maxSize, quality);
  const path = `${folder}/${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000', // год — фото после загрузки не меняются, только заменяются новым файлом
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
