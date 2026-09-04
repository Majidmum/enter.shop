import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, MapPin, Instagram, Send, MessageCircle, Laptop } from 'lucide-react';

const footerLinks = {
  catalog: [
    { label: 'Ноутбуки', href: '/category/laptops' },
    { label: 'Мониторы', href: '/category/monitors' },
    { label: 'Принтеры', href: '/category/printers' },
    { label: 'Офисные кресла', href: '/category/office-chairs' },
    { label: 'Аксессуары', href: '/category/accessories' },
  ],
  info: [
    { key: 'header.nav_about', href: '/about' },
    { key: 'header.nav_delivery', href: '/delivery' },
    { key: 'header.nav_sale', href: '/sale' },
    { key: 'header.nav_office', href: '/office' },
    { key: 'header.nav_contacts', href: '/contacts' },
  ],
};

export default function Footer() {
  const { t } = useTranslation();

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
              {t('footer.brand_description')}
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
            <h4 className="font-semibold text-white mb-4">{t('common.catalog')}</h4>
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
            <h4 className="font-semibold text-white mb-4">{t('footer.info_heading')}</h4>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-primary transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contacts_heading')}</h4>
            <div className="space-y-3">
              <a href="tel:+992555000070" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                +992 555 000 070
              </a>
              <div className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{t('footer.location')}</span>
              </div>
              <div className="text-sm text-white/60">
                <p>{t('footer.working_hours_weekday')}</p>
                <p>{t('footer.working_hours_weekend')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">{t('footer.copyright')}</p>
          <p className="text-xs text-white/40">{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  );
}
