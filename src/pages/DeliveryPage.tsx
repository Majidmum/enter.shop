import { Truck, MapPin, Clock, CreditCard, Banknote, Smartphone, RotateCcw, CheckCircle } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';

export default function DeliveryPage() {
  return (
    <div className="pb-16 md:pb-0">
      <div className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Delivery & Payment' }]} />
          <h1 className="text-3xl font-bold mt-4">Delivery & Payment</h1>
          <p className="text-white/70 mt-2">All information about delivery methods and payment options</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Delivery */}
          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" /> Delivery
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Truck, title: 'Delivery across Dushanbe',
                  price: 'Free on orders over 500 TJS · 30 TJS below',
                  desc: 'We deliver to any address in Dushanbe within 1–2 business days. Same-day delivery available for orders placed before noon.',
                },
                {
                  icon: MapPin, title: 'Pickup',
                  price: 'Free',
                  desc: 'Pick up your order from our store at Rudaki Ave 42. Ready within 2 hours of confirmation.',
                },
                {
                  icon: Clock, title: 'Delivery to Regions',
                  price: 'On request',
                  desc: 'Delivery available throughout Tajikistan. Terms and cost are calculated individually based on your location.',
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
              <CreditCard className="h-6 w-6 text-primary" /> Payment
            </h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Banknote, title: 'Cash on Delivery',
                  desc: 'Pay in cash to the courier upon receiving your order. No prepayment required.',
                },
                {
                  icon: CreditCard, title: 'Bank Transfer',
                  desc: 'Transfer to our company account. We send you a receipt immediately after confirmation.',
                },
                {
                  icon: Smartphone, title: 'Mobile Payments',
                  desc: 'ALIF Pay, TBC Pay, and other popular payment systems in Tajikistan.',
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
            <RotateCcw className="h-6 w-6 text-primary" /> Return Policy
          </h2>
          <div className="bg-card border border-border rounded-xl p-6 card-shadow">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'Return within 14 days from date of purchase if the item has not been used and its original packaging is intact.',
                'Warranty returns: manufacturer defects are repaired or replaced free of charge.',
                'For return contact us at +992 555 000 070 or info@enter.tj.',
                'Refunds are processed within 3–5 business days after we receive the item.',
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
