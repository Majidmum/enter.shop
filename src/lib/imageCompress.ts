/**
 * Сжимает и уменьшает загруженное фото перед сохранением в базу.
 * Без этого полноразмерное фото с телефона (несколько МБ) целиком
 * превращается в base64-текст и грузится на каждой странице сайта.
 *
 * @param file исходный файл из <input type="file">
 * @param maxSize максимальная ширина/высота в пикселях (пропорции сохраняются)
 * @param quality качество JPEG-сжатия (0–1)
 */
export function compressImageFile(file: File, maxSize = 1600, quality = 0.82): Promise<string> {
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
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
    reader.readAsDataURL(file);
  });
}
