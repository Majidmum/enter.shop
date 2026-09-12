import { HelmetProvider, Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

const SITE_NAME = "ENTER.TJ";
const DEFAULT_OG_IMAGE = "https://enter.tj/enter-logo-white-bg.png";

const PageMeta = ({
  title,
  description,
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
  canonicalPath,
  jsonLd,
}: {
  title: string;
  description: string;
  /** Для служебных/приватных страниц (корзина, вход, чекаут), которым не нужно попадать в поиск. */
  noIndex?: boolean;
  ogImage?: string;
  /** Путь без домена, например "/catalog" — для тега canonical. */
  canonicalPath?: string;
  /** Один объект или массив объектов структурированных данных Schema.org (Product, BreadcrumbList и т.д.) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) => {
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalPath && <link rel="canonical" href={`https://enter.tj${canonicalPath}`} />}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {/* Open Graph — как ссылка выглядит при шаринге в соцсетях/мессенджерах */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content="website" />
      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;
