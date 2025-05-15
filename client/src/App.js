// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './Cartcontext';

// Styles
import './styles/AdminDashboard.css';

// Layout Components
import Header from './Hedar';
import Footer from './Footer';

// Public Pages
import HomePage from './HomePage';
import LoginPage from './Loginpage';
import RegisterPage from './Registerpage';
import Addcart from './Addcart';
import TrackOrder from './components/TrackOrder';
import SearchResults from './components/SearchResults';
import UserProfile from './components/UserProfile';
import UserOrders from './components/UserOrders';
import Womenbracelet from './Womenbracelet';
import Womenearings from './Womenearings';
import Womennecles from './womennecles';
import Manglsutra from './Manglsutra';
import Womensmala from './Womensmala';
import Wstonebracelte from './wstonebracelte';
import Wedding from './Wedding';
import Causel from './Causel';
import Offcewear from './Officewear';
import Divinecollection from './Divinecollection';
import Aboutus from './Aboutus';
import ContactUs from './ContactUs';
import RefundPolicy from './components/RefundPolicy';
import ReturnPolicy from './components/ReturnPolicy';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import BuyPage from './components/BuyPage';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';

// Admin Components
import AdminDashboard from './components/AdminDashboard';
import AdminUsers from './components/AdminUsers';
import AdminProducts from './components/AdminProducts';
import AdminCategories from './components/AdminCategories';
import DashboardStats from './components/DashboardStats';
import OrdersPage from './admin/OrdersPage';
import AdminOrderDetails from './admin/AdminOrderDetails';
import AdminContacts from './components/AdminContacts';

// Routes
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Breadcrumb from './components/Breadcrumb';
import PrivateRoute from './components/PrivateRoute';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/register'].includes(location.pathname) || location.pathname.startsWith('/reset-password');

  if (isAdminPage) {
    return children;
  }

  return (
    <>
      {!isAuthPage && <Header />}
      <div className="main-content">
        {/* Breadcrumb removed as per user request */}
        {children}
      </div>
      {!isAuthPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
            <Route path="/cart" element={<Addcart />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/buy"
              element={
                <PrivateRoute>
                  <BuyPage />
                </PrivateRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/user/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/user/orders"
              element={
                <PrivateRoute>
                  <UserOrders />
                </PrivateRoute>
              }
            />

            {/* Product Category Routes */}
            <Route path="/womenbracelet" element={<Womenbracelet />} />
            <Route path="/womenearings" element={<Womenearings />} />
            <Route path="/womennecles" element={<Womennecles />} />
            <Route path="/manglsutra" element={<Manglsutra />} />
            <Route path="/womensmala" element={<Womensmala />} />
            <Route path="/wstonebracelte" element={<Wstonebracelte />} />
            <Route path="/wedding" element={<Wedding />} />
            <Route path="/causel" element={<Causel />} />
            <Route path="/officewear" element={<Offcewear />} />
            <Route path="/divine-collection" element={<Divinecollection />} />

            {/* Information Pages */}
            <Route path="/about" element={<Aboutus />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />

            {/* Payment Routes */}
            <Route
              path="/payment"
              element={
                <PrivateRoute>
                  <PaymentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/order/:orderId"
              element={
                <PrivateRoute>
                  <OrderConfirmationPage />
                </PrivateRoute>
              }
            />

            {/* Checkout Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            >
              <Route index element={<DashboardStats />} />
              <Route path="dashboard" element={<DashboardStats />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<AdminOrderDetails />} />
              <Route path="contacts" element={<AdminContacts />} />
            </Route>

            {/* Forgot Password Route */}
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </CartProvider>
  );
}

export default App;
