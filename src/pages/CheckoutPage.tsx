import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { useCartStore } from '@/store/cartStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import type { CheckoutForm } from '@/types';

const schema = z.object({
  firstName: z.string().min(2, 'Enter your first name'),
  lastName: z.string().min(2, 'Enter your last name'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  whatsapp: z.string().optional(),
  address: z.string().min(5, 'Enter your delivery address'),
  district: z.string().min(2, 'Enter your district'),
  comment: z.string().optional(),
  deliveryMethod: z.enum(['delivery', 'pickup']),
  paymentMethod: z.enum(['cash', 'transfer', 'online']),
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const addOrder = useOrdersStore((s) => s.addOrder);
  const { user, isAuthenticated } = useAuthStore();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
      phone: user?.phone || '',
      whatsapp: '',
      address: '',
      district: '',
      comment: '',
      deliveryMethod: 'delivery',
      paymentMethod: 'cash',
    },
  });

  const deliveryMethod = form.watch('deliveryMethod');

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = (data: CheckoutForm) => {
    const order = addOrder({
      customerId: user?.id || 'guest',
      customerName: `${data.firstName} ${data.lastName}`,
      customerPhone: data.phone,
      customerEmail: user?.email || '',
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        price: product.price,
        quantity,
      })),
      total: total(),
      deliveryMethod: data.deliveryMethod,
      paymentMethod: data.paymentMethod,
      address: data.address,
      district: data.district,
      comment: data.comment,
    });
    clearCart();
    toast.success(`Order ${order.orderNumber} placed successfully!`);
    navigate('/account');
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <Breadcrumb items={[{ label: 'Cart', href: '/cart' }, { label: 'Checkout' }]} />
      <h1 className="text-2xl font-bold mt-4 mb-6">Checkout</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6">
          {/* Form */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">
            {/* Personal info */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h3 className="font-bold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl><Input placeholder="Rustam" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl><Input placeholder="Karimov" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl><Input placeholder="+992 9XX XXX XXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="whatsapp" render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl><Input placeholder="+992 9XX XXX XXX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Delivery */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h3 className="font-bold mb-4">Delivery Method</h3>
              <FormField control={form.control} name="deliveryMethod" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="delivery" id="del1" />
                        <Label htmlFor="del1" className="cursor-pointer flex-1">
                          <p className="font-medium">Free Delivery in Dushanbe</p>
                          <p className="text-xs text-muted-foreground">1–2 business days</p>
                        </Label>
                        <span className="text-xs font-medium text-green-600">FREE</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                        <RadioGroupItem value="pickup" id="del2" />
                        <Label htmlFor="del2" className="cursor-pointer flex-1">
                          <p className="font-medium">Pickup from Store</p>
                          <p className="text-xs text-muted-foreground">Ready within 2 hours</p>
                        </Label>
                        <span className="text-xs font-medium text-green-600">FREE</span>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {deliveryMethod === 'delivery' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Delivery Address *</FormLabel>
                      <FormControl><Input placeholder="Street, building, apartment" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="district" render={({ field }) => (
                    <FormItem>
                      <FormLabel>District *</FormLabel>
                      <FormControl><Input placeholder="Ismoil Somoni, Firdavsi..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              )}
            </div>

            {/* Payment */}
            <div className="rounded-xl bg-card border border-border p-5">
              <h3 className="font-bold mb-4">Payment Method</h3>
              <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3">
                      {[
                        { value: 'cash', label: 'Cash on Delivery', desc: 'Pay upon receipt' },
                        { value: 'transfer', label: 'Bank Transfer', desc: 'Transfer to our account' },
                        { value: 'online', label: 'Online Payment', desc: 'Card, mobile payments' },
                      ].map((opt) => (
                        <div key={opt.value} className="flex items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/50">
                          <RadioGroupItem value={opt.value} id={`pay-${opt.value}`} />
                          <Label htmlFor={`pay-${opt.value}`} className="cursor-pointer flex-1">
                            <p className="font-medium">{opt.label}</p>
                            <p className="text-xs text-muted-foreground">{opt.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Comment */}
            <div className="rounded-xl bg-card border border-border p-5">
              <FormField control={form.control} name="comment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment to Order</FormLabel>
                  <FormControl><Textarea placeholder="Any special requests or notes..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="rounded-xl bg-card border border-border p-5 card-shadow sticky top-24">
              <h3 className="font-bold text-base mb-4">Order Summary</h3>
              <div className="flex flex-col gap-2 text-sm border-b border-border pb-4 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">{product.name} ×{quantity}</span>
                    <span className="font-medium shrink-0">{(product.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg mb-5">
                <span>Total</span>
                <span>{total().toLocaleString()} TJS</span>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                Confirm Order
              </Button>
              {!isAuthenticated && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  <a href="/login" className="text-primary hover:underline">Sign in</a> to track your order
                </p>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
