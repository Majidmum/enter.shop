import { useState, useEffect } from 'react';
import { MapPin, Building2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CITIES, useCityStore, type City } from '@/store/cityStore';

const CITY_ICONS: Record<City, typeof Building2> = {
  'Душанбе': Building2,
  'Худжанд': MapPin,
};

/**
 * Показывается один раз при первом заходе на сайт (пока город не выбран).
 * Чисто визуально — просто запоминает выбор и отражает его в шапке.
 */
export default function CitySelectModal() {
  const { city, setCity, reopenSignal } = useCityStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!city) setOpen(true);
  }, [city]);

  useEffect(() => {
    if (reopenSignal > 0) setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reopenSignal]);

  const handleSelect = (selected: City) => {
    setCity(selected);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && city) setOpen(false); }}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Выберите ваш город</DialogTitle>
          <DialogDescription className="text-center">
            Так мы покажем актуальную информацию о магазине именно для вас
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          {CITIES.map((c) => {
            const Icon = CITY_ICONS[c];
            const isSelected = city === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleSelect(c)}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-muted'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <span className="flex-1 font-semibold text-foreground">{c}</span>
                {isSelected && <Check className="h-5 w-5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
