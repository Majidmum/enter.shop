import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, Instagram, CheckCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { sendContactFormToTelegram } from '@/lib/telegram';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

const schema = z.object({
  name: z.string().min(2, 'Введите ваше имя'),
  phone: z.string().min(9, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  message: z.string().min(10, 'Сообщение должно содержать не менее 10 символов'),
});

type FormData = z.infer<typeof schema>;

const contacts = [
  { icon: MapPin, title: 'Адрес', lines: ['пр. Рудаки, 42, Душанбе', 'Таджикистан'] },
  { icon: Phone, title: 'Телефон', lines: ['+992 555 000 070', '+992 901 234 567'] },
  { icon: Mail, title: 'Email', lines: ['info@enter.tj', 'sales@enter.tj'] },
  { icon: Clock, title: 'Режим работы', lines: ['Пн–Сб: 9:00–19:00', 'Вс: 10:00–17:00'] },
];

export default function ContactsPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '', message: '' },
  });

  const onSubmit = async (data: FormData) => {
    const success = await sendContactFormToTelegram(data);

    if (success) {
      setSent(true);
      toast.success('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
    } else {
      toast.error('Не удалось отправить сообщение. Попробуйте позвонить нам напрямую.');
    }
  };

  return (
    <div className="pb-16 md:pb-0">
      <PageMeta
        title="Контакты — ENTER.TJ"
        description="Свяжитесь с ENTER.TJ: адрес, телефон, email и часы работы магазина компьютерной техники и офисной мебели в Душанбе."
      />
      <div className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Контакты' }]} />
          <h1 className="text-3xl font-bold mt-4">Контакты</h1>
          <p className="text-white/70 mt-2">Мы всегда готовы помочь — обращайтесь в любое время</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-bold mb-6">Наши контакты</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              {contacts.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex items-start gap-4 bg-card border border-border rounded-xl p-4 card-shadow">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-muted-foreground mb-1">{title}</p>
                    {lines.map((l) => <p key={l} className="text-sm font-medium">{l}</p>)}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="bg-card border border-border rounded-xl p-5 card-shadow">
              <h3 className="font-semibold mb-3">Мы в соцсетях</h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com', color: 'hover:bg-pink-50 hover:text-pink-600' },
                  { icon: Send, label: 'Telegram', href: 'https://t.me/entertj', color: 'hover:bg-blue-50 hover:text-blue-600' },
                  { icon: MessageCircle, label: 'WhatsApp', href: 'https://wa.me/992555000070', color: 'hover:bg-green-50 hover:text-green-600' },
                ].map(({ icon: Icon, label, href, color }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer"
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium transition-colors ${color}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Map embed */}
            <div className="mt-6 rounded-xl overflow-hidden border border-border aspect-video bg-muted">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&q=Dushanbe,Tajikistan&language=en&region=tj"
                allowFullScreen
                title="ENTER.TJ Location"
              />
            </div>
          </div>

          {/* Contact form */}
          <div>
            <h2 className="text-xl font-bold mb-6">Написать нам</h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-card border border-border rounded-xl">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-bold">Сообщение отправлено!</h3>
                <p className="text-muted-foreground text-sm">Мы ответим вам в течение 2 часов в рабочее время.</p>
                <Button onClick={() => setSent(false)} variant="outline">Написать ещё раз</Button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 card-shadow">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ваше имя *</FormLabel>
                        <FormControl><Input placeholder="Рустам Каримов" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон *</FormLabel>
                        <FormControl><Input placeholder="+992 9XX XXX XXX" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сообщение *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Чем мы можем вам помочь?" rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                      Отправить сообщение
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
