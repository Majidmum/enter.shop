import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import IntersectObserver from '@/components/common/IntersectObserver';
import { useAuthStore } from '@/store/authStore';

import ClientLayout from '@/components/layouts/ClientLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import AuthLayout from '@/components/layouts/AuthLayout';

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
import AdminOfficePackages from '@/pages/admin/AdminOfficePackages';
import AdminBanners from '@/pages/admin/AdminBanners';
import AdminReviews from '@/pages/admin/AdminReviews';
import AdminSettings from '@/pages/admin/AdminSettings';

const App: React.FC = () => {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <Router>
      <IntersectObserver />
      <Routes>
        {/* ── Client routes ── */}
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="sale" element={<SalePage />} />
          <Route path="office" element={<OfficePage />} />
        </Route>

        {/* ── Auth routes (no Header/Footer) ── */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ── Admin routes ── */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="office" element={<AdminOfficePackages />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </Router>
  );
};

export default App;

