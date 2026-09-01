import { useState, useEffect } from 'react';
import { Save, CheckCircle, AlertCircle, Loader2, Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { testTelegramSettings } from '@/lib/telegram';
import { fetchSiteSettings, updateSiteSettings } from '@/lib/supabaseData';

interface Settings {
  storeName: string;
  storeDesc: string;
  phone: string;
  phone2: string;
  email: string;
  address: string;
  workingHours: string;
  freeDeliveryThreshold: number;
  deliveryCost: number;
  cashEnabled: boolean;
  transferEnabled: boolean;
  onlinePayEnabled: boolean;
  notifEmail: string;
  instagram: string;
  telegram: string;
  whatsapp: string;
  enableTelegramNotifications: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  whatsappNumber: string;
  notificationEmail: string;
  ordersChannels: {
    telegram: boolean;
    whatsapp: boolean;
    email: boolean;
  };
  contactsChannels: {
    telegram: boolean;
    whatsapp: boolean;
    email: boolean;
  };
}

const defaultSettings: Settings = {
  storeName: 'ENTER.TJ',
  storeDesc: 'Магазин компьютерной техники и офисной мебели в Душанбе',
  phone: '+992 555 000 070',
  phone2: '+992 901 234 567',
  email: 'info@enter.tj',
  address: 'просп. Рудаки 42, Душанбе, Таджикистан',
  workingHours: 'Пн–Сб: 9:00–19:00, Вс: 10:00–17:00',
  freeDeliveryThreshold: 500,
  deliveryCost: 30,
  cashEnabled: true,
  transferEnabled: true,
  onlinePayEnabled: false,
  notifEmail: 'orders@enter.tj',
  instagram: 'https://instagram.com/entertj',
  telegram: 'https://t.me/entertj',
  whatsapp: '+992555000070',
  enableTelegramNotifications: false,
  telegramBotToken: '',
  telegramChatId: '',
  whatsappNumber: '',
  notificationEmail: '',
  ordersChannels: {
    telegram: false,
    whatsapp: false,
    email: false,
  },
  contactsChannels: {
    telegram: false,
    whatsapp: false,
    email: false,
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 card-shadow">
      <h2 className="font-bold text-base mb-4 pb-2 border-b border-border">{title}</h2>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchSiteSettings()
      .then((remote) => setSettings({ ...defaultSettings, ...remote }))
      .catch((e) => toast.error(e.message || 'Не удалось загрузить настройки'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, value: Settings[keyof Settings]) => {
    setSaved(false);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Сохраняем всё в общую таблицу settings в Supabase — так изменения
      // применяются сразу у всех посетителей сайта, без пересборки и деплоя.
      await updateSiteSettings({ ...settings });
      setSaved(true);
      toast.success('Настройки сохранены');
    } catch (e: any) {
      toast.error(e.message || 'Не удалось сохранить настройки');
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!settings.telegramBotToken || !settings.telegramChatId) {
      toast.error('Заполните токен бота и ID чата');
      return;
    }

    setTestingTelegram(true);
    const result = await testTelegramSettings(settings.telegramBotToken, settings.telegramChatId);
    setTestResult(result);
    setTestingTelegram(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Загрузка настроек...</div>;
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* General */}
      <Section title="Основные настройки">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Название магазина</Label>
            <Input className="mt-1" value={settings.storeName} onChange={(e) => set('storeName', e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input className="mt-1" type="email" value={settings.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Описание</Label>
            <Textarea className="mt-1" rows={2} value={settings.storeDesc} onChange={(e) => set('storeDesc', e.target.value)} />
          </div>
          <div>
            <Label>Телефон 1</Label>
            <Input className="mt-1" value={settings.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <Label>Телефон 2</Label>
            <Input className="mt-1" value={settings.phone2} onChange={(e) => set('phone2', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Адрес</Label>
            <Input className="mt-1" value={settings.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Часы работы</Label>
            <Input className="mt-1" value={settings.workingHours} onChange={(e) => set('workingHours', e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Delivery */}
      <Section title="Настройки доставки">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Порог бесплатной доставки (сом.)</Label>
            <Input className="mt-1" type="number" value={settings.freeDeliveryThreshold}
              onChange={(e) => set('freeDeliveryThreshold', Number(e.target.value))} />
            <p className="text-xs text-muted-foreground mt-1">Заказы выше этой суммы доставляются бесплатно</p>
          </div>
          <div>
            <Label>Стоимость доставки (сом.)</Label>
            <Input className="mt-1" type="number" value={settings.deliveryCost}
              onChange={(e) => set('deliveryCost', Number(e.target.value))} />
          </div>
        </div>
      </Section>

      {/* Payment */}
      <Section title="Способы оплаты">
        <div className="flex flex-col gap-4">
          {[
            { key: 'cashEnabled' as keyof Settings, label: 'Наличными при получении', desc: 'Клиент платит наличными при получении заказа' },
            { key: 'transferEnabled' as keyof Settings, label: 'Банковский перевод', desc: 'Клиент может оплатить банковским переводом' },
            { key: 'onlinePayEnabled' as keyof Settings, label: 'Онлайн-оплата', desc: 'ALIF Pay, TBC Pay и другие онлайн-методы' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={Boolean(settings[key])}
                onCheckedChange={(v) => set(key, v)}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Уведомления">
        <div>
          <Label>Email для уведомлений о заказах</Label>
          <Input className="mt-1" type="email" value={settings.notifEmail}
            onChange={(e) => set('notifEmail', e.target.value)} />
          <p className="text-xs text-muted-foreground mt-1">Уведомления о новых заказах будут приходить на этот email</p>
        </div>
      </Section>

      {/* Telegram Notifications */}
      <Section title="Telegram-уведомления">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40">
            <div>
              <p className="font-medium text-sm">Включить Telegram-уведомления</p>
              <p className="text-xs text-muted-foreground">Отправлять заявки и заказы в Telegram</p>
            </div>
            <Switch
              checked={settings.enableTelegramNotifications}
              onCheckedChange={(v) => set('enableTelegramNotifications', v)}
            />
          </div>

          {settings.enableTelegramNotifications && (
            <>
              <div>
                <Label>Токен Telegram Bot</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  type="password"
                  placeholder="123456789:ABCDefGHIjklmnOPqrstuvWxyzABCDefGHI"
                  value={settings.telegramBotToken}
                  onChange={(e) => set('telegramBotToken', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Получить токен от @BotFather
                  </a>
                </p>
              </div>

              <div>
                <Label>Chat ID (ID чата Telegram)</Label>
                <Input
                  className="mt-1 font-mono"
                  placeholder="-987654321"
                  value={settings.telegramChatId}
                  onChange={(e) => set('telegramChatId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Отрицательное число (например: -987654321) для групп, или положительное для личных чатов
                </p>
              </div>

              {testResult && (
                <div className={`p-3 rounded-lg flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {testResult.message}
                  </p>
                </div>
              )}

              <Button
                onClick={handleTestTelegram}
                disabled={testingTelegram || !settings.telegramBotToken || !settings.telegramChatId}
                variant="outline"
                className="w-full"
              >
                {testingTelegram ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Проверка...
                  </>
                ) : (
                  'Отправить тестовое сообщение'
                )}
              </Button>
            </>
          )}
        </div>
      </Section>

      {/* Social */}
      <Section title="Социальные сети">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Instagram</Label>
            <Input className="mt-1" value={settings.instagram} onChange={(e) => set('instagram', e.target.value)} />
          </div>
          <div>
            <Label>Telegram</Label>
            <Input className="mt-1" value={settings.telegram} onChange={(e) => set('telegram', e.target.value)} />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input className="mt-1" value={settings.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-between">
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Изменения сохранены
          </span>
        )}
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-white ml-auto">
          <Save className="h-4 w-4 mr-1.5" /> {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </Button>
      </div>
    </div>
  );
}
