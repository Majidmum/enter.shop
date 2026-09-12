import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Добавить структурированные данные BreadcrumbList (Schema.org) для этой цепочки — помогает поиску показывать её прямо в выдаче. */
  jsonLd?: boolean;
}

export default function Breadcrumb({ items, jsonLd = false }: BreadcrumbProps) {
  const allItems = [{ label: 'Главная', href: '/' }, ...items];

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
      {jsonLd && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: allItems.map((item, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: item.label,
                ...(item.href ? { item: `https://enter.tj${item.href}` } : {}),
              })),
            })}
          </script>
        </Helmet>
      )}
      <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors shrink-0">
        <Home className="h-3.5 w-3.5" />
        <span>Главная</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-primary transition-colors truncate">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium truncate">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
