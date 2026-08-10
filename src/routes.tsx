import type { ReactNode } from 'react';
import ClientLayout from '@/components/layouts/ClientLayout';
import AdminLayout from '@/components/layouts/AdminLayout';

// Client pages
import HomePage from '@/pages/HomePage';
import CatalogPage from '@/pages/CatalogPage';
import CategoriesPage from '@/pages/CategoriesPage';
import CategoryPage from '@/pages/CategoryPage';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import FavoritesPage from '@/pages/FavoritesPage';
import AccountPage from '@/pages/AccountPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import AboutPage from '@/pages/AboutPage';
import DeliveryPage from '@/pages/DeliveryPage';
import ContactsPage from '@/pages/ContactsPage';
import SalePage from '@/pages/SalePage';
import OfficePage from '@/pages/OfficePage';
import NotFound from '@/pages/NotFound';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminBrands from '@/pages/admin/AdminBrands';
import AdminPromotions from '@/pages/admin/AdminPromotions';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminSettings from '@/pages/admin/AdminSettings';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // Client layout wrapper
  {
    name: 'Client',
    path: '/',
    element: <ClientLayout />,
    public: true,
  },

  // ── Client pages (rendered via Outlet in ClientLayout) ──
  { name: 'Home',             path: '/',                   element: <HomePage />,         public: true },
  { name: 'Catalog',          path: '/catalog',            element: <CatalogPage />,      public: true },
  { name: 'Categories',       path: '/categories',         element: <CategoriesPage />,   public: true },
  { name: 'Category',         path: '/category/:slug',     element: <CategoryPage />,     public: true },
  { name: 'Product',          path: '/product/:slug',      element: <ProductPage />,      public: true },
  { name: 'Cart',             path: '/cart',               element: <CartPage />,         public: true },
  { name: 'Checkout',         path: '/checkout',           element: <CheckoutPage />,     public: true },
  { name: 'Favorites',        path: '/favorites',          element: <FavoritesPage />,    public: true },
  { name: 'Account',          path: '/account',            element: <AccountPage />,      public: true },
  { name: 'Login',            path: '/login',              element: <LoginPage />,        public: true },
  { name: 'Register',         path: '/register',           element: <RegisterPage />,     public: true },
  { name: 'Forgot Password',  path: '/forgot-password',    element: <ForgotPasswordPage />, public: true },
  { name: 'About',            path: '/about',              element: <AboutPage />,        public: true },
  { name: 'Delivery',         path: '/delivery',           element: <DeliveryPage />,     public: true },
  { name: 'Contacts',         path: '/contacts',           element: <ContactsPage />,     public: true },
  { name: 'Sale',             path: '/sale',               element: <SalePage />,         public: true },
  { name: 'Office',           path: '/office',             element: <OfficePage />,       public: true },

  // ── Admin layout wrapper ──
  { name: 'Admin',            path: '/admin',              element: <AdminLayout />,      public: true },

  // ── Admin pages (rendered via Outlet in AdminLayout) ──
  { name: 'Admin Dashboard',  path: '/admin',              element: <AdminDashboard />,   public: true },
  { name: 'Admin Products',   path: '/admin/products',     element: <AdminProducts />,    public: true },
  { name: 'Admin Categories', path: '/admin/categories',   element: <AdminCategories />,  public: true },
  { name: 'Admin Orders',     path: '/admin/orders',       element: <AdminOrders />,      public: true },
  { name: 'Admin Customers',  path: '/admin/customers',    element: <AdminCustomers />,   public: true },
  { name: 'Admin Brands',     path: '/admin/brands',       element: <AdminBrands />,      public: true },
  { name: 'Admin Promotions', path: '/admin/promotions',   element: <AdminPromotions />,  public: true },
  { name: 'Admin Banners',    path: '/admin/banners',      element: <AdminBanners />,     public: true },
  { name: 'Admin Reviews',    path: '/admin/reviews',      element: <AdminReviews />,     public: true },
  { name: 'Admin Settings',   path: '/admin/settings',     element: <AdminSettings />,    public: true },

  // 404
  { name: 'Not Found',        path: '*',                   element: <NotFound />,         public: true },
];
