import { Truck, MapPin, Clock, CreditCard, Banknote, Smartphone, RotateCcw, CheckCircle } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';
import PageMeta from '@/components/common/PageMeta';

export default function DeliveryPage() {
  return (
    <div className="pb-16 md:pb-0">
      <PageMeta
        title="Доставка и оплата — ENTER.TJ"
        description="Условия доставки и оплаты в интернет-магазине ENTER.TJ: доставка по Душанбе, самовывоз, наличный и безналичный расчёт."
      />
      <div className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Доставка и оплата' }]} />
          <h1 className="text-3xl font-bold mt-4">Доставка и оплата</h1>
          <p className="text-white/70 mt-2">Вся информация о способах доставки и вариантах оплаты</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Delivery */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" /> Доставка
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Truck, title: 'Доставка по Душанбе',
                  price: 'Бесплатно от 500 сомони · 30 сомони ниже',
                  desc: 'Доставляем по любому адресу в Душанбе за 1–2 рабочих дня. При заказе до полудня возможна доставка в тот же день.',
                },
                {
                  icon: MapPin, title: 'Самовывоз',
                  price: 'Бесплатно',
                  desc: 'Заберите заказ из нашего магазина по пр. Рудаки, 42. Готов через 2 часа после подтверждения.',
                },
                {
                  icon: Clock, title: 'Доставка по регионам',
                  price: 'По запросу',
                  desc: 'Доставка по всему Таджикистану. Условия и стоимость рассчитываются индивидуально в зависимости от вашего местоположения.',
                },
              ].map(({ icon: Icon, title, price, desc }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-5 card-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="font-semibold">{title}</h3>
                        <span className="text-sm font-medium text-primary">{price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-primary" /> Оплата
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Banknote, title: 'Наличными при получении',
                  desc: 'Оплата наличными курьеру при получении заказа. Предоплата не требуется.',
                },
                {
                  icon: CreditCard, title: 'Банковский перевод',
                  desc: 'Перевод на расчётный счёт компании. Квитанцию высылаем сразу после подтверждения.',
                },
                {
                  icon: Smartphone, title: 'Мобильные платежи',
                  desc: 'ALIF Pay, TBC Pay и другие популярные платёжные системы Таджикистана.',
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-border rounded-xl p-5 card-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Return policy */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-primary" /> Возврат товара
          </h2>
          <div className="bg-card border border-border rounded-xl p-6 card-shadow">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Возврат в течение 14 дней с момента покупки при условии, что товар не использовался и оригинальная упаковка не нарушена.',
                'Гарантийный возврат: производственные дефекты устраняются или товар заменяется бесплатно.',
                'Для возврата обратитесь по телефону +992 555 000 070 или на email info@enter.tj.',
                'Возврат средств осуществляется в течение 3–5 рабочих дней после получения товара.',
              ].map((text) => (
                <div key={text} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
