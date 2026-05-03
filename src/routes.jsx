import { Outlet } from 'react-router-dom';
import { Layout as DashboardLayout } from './layouts/dashboard/layout';
import { AuthGuard, GuestGuard } from './guards/auth-guard';
import LoginPage from './pages/login';
import NotFoundPage from './pages/404';
import BannersPage from './pages/banners';
import BlogPage from './pages/blog';
import CategoriesPage from './pages/categories';
import CouponsPage from './pages/coupons';
import OffersPage from './pages/offers';
import OrdersPage from './pages/orders';
import ProductsPage from './pages/products';
import ReportsPage from './pages';
import ReviewsPage from './pages/reviews';
import SettingsPage from './pages/settings';
import StoresPage from './pages/stores';
import TestimonialsPage from './pages/testimonials';
import UsersPage from './pages/users';
import OrderStatusesPage from './pages/order-statuses';
import SubcategoriesPage from './pages/subcategories';
import AboutPage from './pages/about';

export const routes = [
  {
    path: 'login',
    element: (
      <GuestGuard>
        <LoginPage />
      </GuestGuard>
    )
  },
  {
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, element: <ReportsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'order-statuses', element: <OrderStatusesPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'subcategories', element: <SubcategoriesPage /> },
      { path: 'offers', element: <OffersPage /> },
      { path: 'banners', element: <BannersPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'testimonials', element: <TestimonialsPage /> },
      { path: 'stores', element: <StoresPage /> },
      { path: 'coupons', element: <CouponsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  },
  { path: '404', element: <NotFoundPage /> },
  { path: '*', element: <NotFoundPage /> }
];
