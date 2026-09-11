import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import PageMeta from '@/components/common/PageMeta';
import { fetchActivePromoCampaigns } from '@/lib/supabaseData';
import type { PromoCampaign } from '@/types';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<PromoCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePromoCampaigns().then(setCampaigns).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <PageMeta
        title="Рекламные акции — ENTER.TJ"
        description="Специальные предложения, объявления о новых поступлениях и рекламные кампании ENTER.TJ."
      />
      <Breadcrumb items={[{ label: 'Рекламные акции' }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">Рекламные акции</h1>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-5 flex flex-col gap-2">
                <div className="h-5 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl overflow-hidden border border-border card-shadow bg-card flex flex-col">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <h2 className="text-lg font-bold text-foreground">{c.title}</h2>
                {c.description && <p className="text-sm text-muted-foreground flex-1">{c.description}</p>}
                <Link to={c.buttonLink} className="mt-2">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {c.buttonText || 'Подробнее'} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-16">Рекламных акций пока нет — загляните позже.</p>
      )}
    </div>
  );
}
