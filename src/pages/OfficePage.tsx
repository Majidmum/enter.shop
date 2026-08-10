import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Monitor, Printer, Network, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { toast } from 'sonner';

const schema = z.object({
  company: z.string().min(2, 'Enter company name'),
  name: z.string().min(2, 'Enter your name'),
  phone: z.string().min(9, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  employees: z.string().min(1, 'Enter number of employees'),
  budget: z.string().min(1, 'Select a budget range'),
  needs: z.string().min(10, 'Describe your needs (min 10 characters)'),
});

type FormData = z.infer<typeof schema>;

const packages = [
  {
    name: 'Starter',
    desc: 'For 1–5 employees',
    price: 'from 15 000 TJS',
    color: 'border-border',
    includes: ['5 workstations', 'Monitor + PC/Laptop', 'Keyboard & mouse', 'Network setup', 'Delivery & installation'],
  },
  {
    name: 'Business',
    desc: 'For 5–20 employees',
    price: 'from 60 000 TJS',
    color: 'border-primary',
    badge: 'Popular',
    includes: ['20 workstations', 'Ergonomic furniture', 'Printer & MFP', 'Network equipment', 'Full IT setup', 'Delivery & installation'],
  },
  {
    name: 'Enterprise',
    desc: 'For 20+ employees',
    price: 'Individual pricing',
    color: 'border-border',
    includes: ['Unlimited workstations', 'Premium furniture', 'Server room', 'Full network', 'IT support', 'Custom solution'],
  },
];

import { Armchair } from 'lucide-react';

export default function OfficePage() {
  const [sent, setSent] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { company: '', name: '', phone: '', email: '', employees: '', budget: '', needs: '' },
  });

  const onSubmit = (data: FormData) => {
    console.log('Office form:', data);
    setSent(true);
    toast.success('Request sent! We will contact you within 1 hour.');
  };

  return (
    <div className="pb-16 md:pb-0">
      {/* Hero */}
      <div className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'Office Turnkey' }]} />
          <div className="mt-6 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-7 w-7 text-primary" />
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">Corporate Service</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Office Turnkey</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              We fully equip your office — from computers and ergonomic furniture to network infrastructure. One partner for all your needs.
            </p>
          </div>
        </div>
      </div>

      {/* What we supply */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">What We Supply</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Monitor, label: 'Computers & Monitors', desc: 'Workstations, laptops, monitors from leading brands' },
            { icon: Armchair, label: 'Office Furniture', desc: 'Ergonomic chairs, adjustable desks, storage' },
            { icon: Printer, label: 'Printers & Scanners', desc: 'MFPs, laser and inkjet printers, scanners' },
            { icon: Network, label: 'Network Equipment', desc: 'Routers, switches, Wi-Fi, structured cabling' },
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
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Submit Request', desc: 'Fill out the form with your office size and requirements' },
              { step: '02', title: 'Free Consultation', desc: 'Our specialist contacts you and prepares a solution' },
              { step: '03', title: 'Agreement', desc: 'We agree on specs, timing and pricing' },
              { step: '04', title: 'Delivery & Setup', desc: 'Deliver and set up everything in your office' },
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

      {/* Packages */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-10">Ready-Made Packages</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {packages.map((pkg) => (
            <div key={pkg.name} className={`relative bg-card border-2 rounded-2xl p-6 card-shadow flex flex-col ${pkg.color}`}>
              {pkg.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  {pkg.badge}
                </span>
              )}
              <h3 className="text-xl font-bold">{pkg.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{pkg.desc}</p>
              <p className="text-2xl font-black text-primary mb-4">{pkg.price}</p>
              <ul className="flex flex-col gap-2 flex-1">
                {pkg.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => document.getElementById('office-form')?.scrollIntoView({ behavior: 'smooth' })}
                className={`mt-5 w-full ${pkg.badge ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
                variant={pkg.badge ? 'default' : 'outline'}
              >
                Request Quote
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Clients */}
      <section className="bg-secondary text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold mb-2">200+ Offices Equipped</h2>
          <p className="text-white/70">Banks, government agencies, schools, clinics and private businesses across Tajikistan</p>
        </div>
      </section>

      {/* Request form */}
      <section id="office-form" className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Submit a Request</h2>
          <p className="text-muted-foreground text-center mb-8">We will prepare a custom solution within 24 hours</p>

          {sent ? (
            <div className="flex flex-col items-center py-16 gap-4 bg-card border border-border rounded-2xl text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h3 className="text-xl font-bold">Request Received!</h3>
              <p className="text-muted-foreground text-sm">Our corporate sales specialist will contact you within 1 hour.</p>
              <Button onClick={() => setSent(false)} variant="outline">Submit Another Request</Button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 card-shadow">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name *</FormLabel>
                        <FormControl><Input placeholder="LLC TechCorp" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person *</FormLabel>
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
                        <FormControl><Input type="email" placeholder="company@email.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="employees" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees *</FormLabel>
                        <FormControl><Input type="number" placeholder="10" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="budget" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget Range *</FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                            <option value="">Select budget</option>
                            <option value="10k-30k">10 000 – 30 000 TJS</option>
                            <option value="30k-100k">30 000 – 100 000 TJS</option>
                            <option value="100k-300k">100 000 – 300 000 TJS</option>
                            <option value="300k+">300 000+ TJS</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="needs" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Describe Your Needs *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What equipment do you need? Any specific requirements or deadlines?" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11 text-base">
                    Submit Request
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
