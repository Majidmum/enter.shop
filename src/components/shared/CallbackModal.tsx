import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sendContactFormToTelegram } from '@/lib/telegram';
import { supabase } from '@/db/supabase';

interface CallbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Форма "Заказать звонок" — минимум полей (имя, телефон), чтобы не отпугивать.
 * Уходит мгновенным уведомлением в Telegram (тот же способ, что у формы на
 * странице "Контакты") и сохраняется в contact_requests для истории.
 */
export default function CallbackModal({ open, onOpenChange }: CallbackModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast.error('Укажите номер телефона');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        name: name.trim() || 'Не указано',
        phone: phone.trim(),
        message: 'Заказ обратного звонка',
      };

      // Уведомление уходит сразу в Telegram — это основной канал, на который
      // реально смотрит админ. Запись в базу — просто для истории, не критична.
      const sent = await sendContactFormToTelegram(requestData);

      const { error } = await supabase.from('contact_requests').insert({
        name: requestData.name,
        phone: requestData.phone,
        message: requestData.message,
      });
      if (error) console.error('Не удалось сохранить заявку на звонок в базу:', error);

      if (sent) {
        toast.success('Заявка принята! Мы перезвоним вам в ближайшее время.');
      } else {
        toast.success('Заявка сохранена. Мы свяжемся с вами в ближайшее время.');
      }
      setName('');
      setPhone('');
      onOpenChange(false);
    } catch {
      toast.error('Не удалось отправить заявку. Попробуйте позвонить нам напрямую.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2">
            <Phone className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Заказать звонок</DialogTitle>
          <DialogDescription className="text-center">
            Оставьте номер — мы перезвоним в ближайшее время
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2">
          <div>
            <Label>Ваше имя</Label>
            <Input className="mt-1" placeholder="Как к вам обращаться?" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Номер телефона *</Label>
            <Input className="mt-1" placeholder="+992 9XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-1">
            {loading ? 'Отправляем...' : 'Заказать звонок'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
