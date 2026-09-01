import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Monitor, Printer, Network, Users, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { toast } from 'sonner';
import { sendContactFormToTelegram } from '@/lib/telegram';
import { fetchActiveOfficePackages, type OfficePackage } from '@/lib/supabaseData';

const schema = z.object({
  company: z.string().min(2, 'Введите название компании'),
  name: z.string().min(2, 'Введите ваше имя'),
  phone: z.string().min(9, 'Введите корректный номер телефона'),
  email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  employees: z.string().min(1, 'Введите количество сотрудников'),
  budget: z.string().min(1, 'Выберите диапазон бюджета'),
  needs: z.string().min(10, 'Опишите ваши потребности (минимум 10 символов)'),
});

type FormData = z.infer<typeof schema>;

import { Armchair } from 'lucide-react';

export default function OfficePage() {
  const [sent, setSent] = useState(false);
  const [packages, setPackages] = useState<OfficePackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  useEffect(() => {
    fetchActiveOfficePackages().then(setPackages).finally(() => setPackagesLoading(false));
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { company: '', name: '', phone: '', email: '', employees: '', budget: '', needs: '' },
  });

const onSubmit = async (data: FormData) => {
  console.log('Office form:', data);

  const message = `
🏢 Заявка: Офис под ключ
Компания: ${data.company}
Сотрудников: ${data.employees}
Бюджет: ${data.budget}
Потребности: ${data.needs}
  `.trim();

  const success = await sendContactFormToTelegram({
    name: data.name,
    phone: data.phone,
    email: data.email,
    message,
  });

  if (success) {
    setSent(true);
    toast.success('Заявка отправлена! Мы свяжемся с вами в течение 1 часа.');
  } else {
    toast.error('Не удалось отправить заявку. Попробуйте позвонить нам напрямую.');
  }
};

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero */}
      <div className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Офис под ключ' }]} />
          <div className="mt-6 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">Корпоративный сервис</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Офис под ключ</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Мы полностью оснастим ваш офис — от компьютеров и эргономичной мебели до сетевой инфраструктуры. Один партнёр для всех ваших потребностей.
            </p>
          </div>
        </div>
      </div>

      {/* What we supply */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">Что мы поставляем</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Monitor, label: 'Компьютеры и мониторы', desc: 'Рабочие станции, ноутбуки, мониторы ведущих брендов' },
            { icon: Armchair, label: 'Офисная мебель', desc: 'Эргономичные кресла, регулируемые столы, системы хранения' },
            { icon: Printer, label: 'Принтеры и сканеры', desc: 'МФУ, лазерные и струйные принтеры, сканеры' },
            { icon: Network, label: 'Сетевое оборудование', desc: 'Роутеры, коммутаторы, Wi-Fi, структурированный кабель' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-5 card-shadow text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Как это работает</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Оставьте заявку', desc: 'Заполните форму с размером офиса и требованиями' },
              { step: '02', title: 'Бесплатная консультация', desc: 'Наш специалист свяжется с вами и подготовит решение' },
              { step: '03', title: 'Согласование', desc: 'Согласуем спецификацию, сроки и стоимость' },
              { step: '04', title: 'Доставка и установка', desc: 'Доставим и установим всё в вашем офисе' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="bg-card border border-border rounded-xl p-5 card-shadow h-full">
                  <div className="text-4xl font-black text-primary/20 mb-3">{step}</div>
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                {step !== '04' && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages — современный каталог */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-2">Готовые пакеты</h2>
        <p className="text-muted-foreground text-center mb-10">Выберите подходящее решение или запросите индивидуальную конфигурацию</p>

        {packagesLoading ? (
          <div className="py-16 text-center text-muted-foreground">Загрузка...</div>
        ) : packages.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">Пакеты скоро появятся — свяжитесь с нами напрямую.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  pkg.isPopular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border card-shadow'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute top-0 inset-x-0 bg-primary text-white text-xs font-bold uppercase tracking-wider text-center py-1.5 flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 fill-white" /> Популярный выбор
                  </div>
                )}

                <div className={`p-6 flex flex-col flex-1 ${pkg.isPopular ? 'pt-10' : ''}`}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4 transition-transform duration-300 group-hover:scale-110">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>

                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  {pkg.employeesLabel && <p className="text-sm text-muted-foreground mt-0.5">{pkg.employeesLabel}</p>}
                  <p className="text-2xl font-black text-primary mt-3 mb-1">{pkg.priceLabel}</p>
                  {pkg.description && <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>}

                  <div className="h-px bg-border my-4" />

                  <ul className="flex flex-col gap-2.5 flex-1">
                    {pkg.features.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => document.getElementById('office-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className={`mt-6 w-full font-semibold ${pkg.isPopular ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
                    variant={pkg.isPopular ? 'default' : 'outline'}
                  >
                    Запросить цену <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Clients */}
      <section className="bg-secondary text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">200+ оснащённых офисов</h2>
          <p className="text-white/70">Банки, государственные учреждения, школы, клиники и частный бизнес по всему Таджикистану</p>
        </div>
      </section>

      {/* Request form */}
      <section id="office-form" className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Оставить заявку</h2>
          <p className="text-muted-foreground text-center mb-8">Подготовим индивидуальное решение в течение 24 часов</p>

          {sent ? (
            <div className="flex flex-col items-center py-16 gap-4 bg-card border border-border rounded-2xl text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-bold">Заявка получена!</h3>
              <p className="text-muted-foreground text-sm">Специалист по корпоративным продажам свяжется с вами в течение 1 часа.</p>
              <Button onClick={() => setSent(false)} variant="outline">Отправить ещё одну заявку</Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 card-shadow">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название компании *</FormLabel>
                        <FormControl><Input placeholder='ООО "ТехКорп"' {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Контактное лицо *</FormLabel>
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
                        <FormControl><Input type="email" placeholder="company@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="employees" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Количество сотрудников *</FormLabel>
                        <FormControl><Input type="number" placeholder="10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="budget" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Диапазон бюджета *</FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <option value="">Выберите бюджет</option>
                            <option value="10k-30k">10 000 – 30 000 сомони</option>
                            <option value="30k-100k">30 000 – 100 000 сомони</option>
                            <option value="100k-300k">100 000 – 300 000 сомони</option>
                            <option value="300k+">300 000+ сомони</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="needs" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Опишите ваши потребности *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Какое оборудование вам нужно? Особые требования или сроки?" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 text-base">
                    Отправить заявку
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
