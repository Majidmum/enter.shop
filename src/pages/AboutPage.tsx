import { Building2, Users, Award, Truck, Shield, Headphones, MapPin, Phone, Mail, Clock } from 'lucide-react';
import Breadcrumb from '@/components/shared/Breadcrumb';

const stats = [
  { value: '5+', label: 'Years on Market' },
  { value: '10 000+', label: 'Happy Clients' },
  { value: '30+', label: 'Trusted Brands' },
  { value: '2000+', label: 'Products in Catalog' },
];

const team = [
  { name: 'Alisher Nazarov', role: 'CEO & Founder', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { name: 'Dilnoza Raupova', role: 'Sales Director', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&q=80' },
  { name: 'Farrukh Ismoilov', role: 'Technical Specialist', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
];

export default function AboutPage() {
  return (
    <div className="pb-16 md:pb-0">
      {/* Hero */}
      <div className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4">
          <Breadcrumb items={[{ label: 'About Us' }]} />
          <div className="mt-6 max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              About <span className="gradient-text">ENTER.TJ</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              We are the leading supplier of computer technology and office furniture in Tajikistan. Since 2019 we have been helping businesses and individuals equip their workplaces with quality products.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center text-white">
              <p className="text-3xl md:text-4xl font-bold">{s.value}</p>
              <p className="text-white/80 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <section className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              ENTER.TJ was founded with a clear goal — to make quality computer technology and ergonomic office furniture available to every resident and business in Tajikistan.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We work directly with official distributors of Acer, ASUS, HP, Lenovo, Samsung and other leading brands, which allows us to offer competitive prices without compromising quality.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-video bg-muted">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
              alt="ENTER.TJ Office"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/50 py-14">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: 'Quality Guaranteed', desc: 'All products are original, sold through official channels with manufacturer warranties.' },
              { icon: Users, title: 'Client Focus', desc: 'We listen to each client and help choose the best solution for any budget and task.' },
              { icon: Building2, title: 'Corporate Experience', desc: 'We have equipped over 200 offices in Dushanbe — from small startups to large enterprises.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 card-shadow text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 mx-auto mb-4">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="container mx-auto px-4 py-14">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {team.map((member) => (
            <div key={member.name} className="bg-card border border-border rounded-xl p-6 card-shadow text-center">
              <div className="h-20 w-20 rounded-full overflow-hidden mx-auto mb-4">
                <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-bold">{member.name}</h3>
              <p className="text-sm text-primary mt-1">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section className="bg-secondary text-white py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-4 gap-6">
          {[
            { icon: MapPin, title: 'Address', lines: ['Dushanbe, Tajikistan', 'Rudaki Ave, 42'] },
            { icon: Phone, title: 'Phone', lines: ['+992 555 000 070', '+992 901 234 567'] },
            { icon: Mail, title: 'Email', lines: ['info@enter.tj', 'sales@enter.tj'] },
            { icon: Clock, title: 'Working Hours', lines: ['Mon–Sat: 9:00–19:00', 'Sun: 10:00–17:00'] },
          ].map(({ icon: Icon, title, lines }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white mb-1">{title}</p>
                {lines.map((l) => <p key={l} className="text-sm text-white/70">{l}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
