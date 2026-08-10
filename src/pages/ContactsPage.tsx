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
import { toast } from 'sonner';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

const contacts = [
  { icon: MapPin, title: 'Address', lines: ['Rudaki Ave 42, Dushanbe', 'Tajikistan'] },
  { icon: Phone, title: 'Phone', lines: ['+992 555 000 070', '+992 901 234 567'] },
  { icon: Mail, title: 'Email', lines: ['info@enter.tj', 'sales@enter.tj'] },
  { icon: Clock, title: 'Working Hours', lines: ['Mon–Sat: 9:00–19:00', 'Sun: 10:00–17:00'] },
];

export default function ContactsPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '', message: '' },
  });

  const onSubmit = (data: FormData) => {
    console.log('Contact form submitted:', data);
    setSent(true);
    toast.success('Message sent! We will contact you shortly.');
  };

  return (
    <div className="pb-16 md:pb-0">
      <div className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Contacts' }]} />
          <h1 className="text-3xl font-bold mt-4">Contacts</h1>
          <p className="text-white/70 mt-2">We're here to help — reach out any time</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact info */}
          <div>
            <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
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
              <h3 className="font-semibold mb-3">Follow Us</h3>
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
            <h2 className="text-xl font-bold mb-6">Send a Message</h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-4 bg-card border border-border rounded-xl">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <h3 className="text-xl font-bold">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">We'll get back to you within 2 hours during business hours.</p>
                <Button onClick={() => setSent(false)} variant="outline">Send Another Message</Button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-6 card-shadow">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl><Input placeholder="Rustam Karimov" {...field} /></FormControl>
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
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="How can we help you?" rows={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                      Send Message
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
