import { HelmetProvider, Helmet } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";

const SITE_NAME = "ENTER.TJ";
const DEFAULT_OG_IMAGE = "https://enter.tj/enter-logo-white-bg.png";

const PageMeta = ({
  title,
  description,
  noIndex = false,
  ogImage = DEFAULT_OG_IMAGE,
}: {
  title: string;
  description: string;
  /** Для служебных/приватных страниц (корзина, вход, чекаут), которым не нужно попадать в поиск. */
  noIndex?: boolean;
  ogImage?: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
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
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <TooltipProvider>
      {children}
    </TooltipProvider>
  </HelmetProvider>
);

export default PageMeta;
