import { Link } from 'react-router-dom';
import { Phone, MapPin, Instagram, Send, MessageCircle, Laptop } from 'lucide-react';

const footerLinks = {
  catalog: [
    { label: 'Laptops', href: '/category/laptops' },
    { label: 'Monitors', href: '/category/monitors' },
    { label: 'Printers', href: '/category/printers' },
    { label: 'Office Chairs', href: '/category/office-chairs' },
    { label: 'Accessories', href: '/category/accessories' },
  ],
  info: [
    { label: 'About Us', href: '/about' },
    { label: 'Delivery & Payment', href: '/delivery' },
    { label: 'Sale', href: '/sale' },
    { label: 'Office Turnkey', href: '/office' },
    { label: 'Contacts', href: '/contacts' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-secondary text-white/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Laptop className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ENTER<span className="text-primary">.TJ</span></span>
            </Link>
            <p className="text-sm text-white/60 mb-4">
              Computer technology and office furniture. Equipment for home and business in Dushanbe.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://t.me/entertj" target="_blank" rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors">
                <Send className="h-4 w-4" />
              </a>
              <a href="https://wa.me/992555000070" target="_blank" rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-primary transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-semibold text-white mb-4">Catalog</h4>
            <ul className="space-y-2">
              {footerLinks.catalog.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">Information</h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contacts</h4>
            <div className="space-y-3">
              <a href="tel:+992555000070" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +992 555 000 070
              </a>
              <div className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>Dushanbe, Tajikistan</span>
              </div>
              <div className="text-sm text-white/60">
                <p>Mon–Sat: 9:00–19:00</p>
                <p>Sun: 10:00–17:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">© 2025 ENTER.TJ. All rights reserved.</p>
          <p className="text-xs text-white/40">Computer technology and office equipment in Dushanbe</p>
        </div>
      </div>
    </footer>
  );
}
