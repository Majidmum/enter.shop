import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Heart, X } from 'lucide-react';
import { likeReview } from '@/lib/supabaseData';
import type { Review } from '@/types';

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-fuchsia-500',
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const TEXT_LIMIT = 180;
const LIKED_KEY_PREFIX = 'liked_review_';

export default function ReviewCard({ review }: { review: Review }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [likes, setLikes] = useState(review.likes);
  const [liked, setLiked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(LIKED_KEY_PREFIX + review.id) === '1';
  });
  const [likeBusy, setLikeBusy] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const isLong = review.text.length > TEXT_LIMIT;
  const displayText = expanded || !isLong ? review.text : review.text.slice(0, TEXT_LIMIT).trimEnd() + '…';

  const handleLike = async () => {
    if (liked || likeBusy) return;
    setLikeBusy(true);
    setLiked(true);
    setLikes((n) => n + 1);
    localStorage.setItem(LIKED_KEY_PREFIX + review.id, '1');
    try {
      const newCount = await likeReview(review.id);
      setLikes(newCount);
    } catch {
      // Не удалось — откатываем оптимистичное обновление
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
      localStorage.removeItem(LIKED_KEY_PREFIX + review.id);
    } finally {
      setLikeBusy(false);
    }
  };

  return (
    <div className="border-b border-border pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${avatarColor(review.authorName)}`}>
          {review.authorName.trim().charAt(0).toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold text-sm">{review.authorName}</span>
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
          <div className="flex gap-0.5 mb-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />
            ))}
          </div>

          <p className="text-sm text-foreground whitespace-pre-line">
            {displayText}
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-primary text-sm font-medium ml-1 hover:underline"
              >
                {expanded ? t('product.show_less') : t('product.show_more')}
              </button>
            )}
          </p>

          {review.images.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {review.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(img)}
                  className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-border"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleLike}
            disabled={liked || likeBusy}
            className={`flex items-center gap-1.5 mt-2.5 text-xs font-medium transition-colors ${
              liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            } ${liked ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-primary' : ''}`} />
            {likes > 0 ? likes : t('product.like')}
          </button>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-black/30 text-white/80 hover:text-white hover:bg-black/50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
