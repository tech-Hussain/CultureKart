/**
 * Main App Component
 * Handles routing and layout
 */

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NetworkInfo from './components/NetworkInfo';

// Page Components
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Buyer Profile Pages
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AddressesPage from './pages/AddressesPage';
import SettingsPage from './pages/SettingsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutFailedPage from './pages/CheckoutFailedPage';
import BuyerMessages from './pages/BuyerMessages';

// Verification Page
import ProductVerification from './pages/ProductVerification';

// Artisan Dashboard Components
import DashboardLayout from './components/artisan/DashboardLayout';
import ArtisanDashboard from './pages/artisan/Dashboard';
import AddProduct from './pages/artisan/AddProduct';
import ManageProducts from './pages/artisan/ManageProducts';
import Orders from './pages/artisan/Orders';
import Analytics from './pages/artisan/Analytics';
import Wallet from './pages/artisan/Wallet';
import Withdraw from './pages/artisan/Withdraw';
import Messages from './pages/artisan/Messages';
import Settings from './pages/artisan/Settings';

// Admin Dashboard Components
import AdminLayout from './components/admin/AdminLayout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderMonitoring from './pages/admin/OrderMonitoring';
import PayoutManagement from './pages/admin/PayoutManagement';
import CategoriesPage from './pages/admin/CategoriesPage';
import AdminWithdrawalPage from './pages/admin/AdminWithdrawalPage';
import AdminEscrowPage from './pages/admin/AdminEscrowPage';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
}

// Protected Route for Artisans/Sellers
function ProtectedArtisanRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is an artisan (has artisan profile or isArtisan flag)
  if (!user.isArtisan && user.role !== 'artisan') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artisan Access Only</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to registered artisans. Please apply to become an artisan to access the seller dashboard.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
}

function AppContent() {
  const location = useLocation();
  const isArtisanDashboard = location.pathname.startsWith('/artisan');
  const isAdminDashboard = location.pathname.startsWith('/admin');

  // Don't show navbar and footer for admin dashboard
  const showNavbar = !isAdminDashboard;
  const showFooter = !isArtisanDashboard && !isAdminDashboard;

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      
      <main className="flex-grow">
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth" element={<Login />} />
            
            {/* Product Verification - Public Route */}
            <Route path="/verify/:code" element={<ProductVerification />} />
            
            {/* Admin Login - Separate route */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Buyer Profile Routes - Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout-success"
              element={
                <ProtectedRoute>
                  <CheckoutSuccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout-failed"
              element={<CheckoutFailedPage />}
            />
            <Route
              path="/addresses"
              element={
                <ProtectedRoute>
                  <AddressesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <BuyerMessages />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Artisan Dashboard Routes */}
            <Route
              path="/artisan/*"
              element={
                <ProtectedRoute requiredRole="artisan">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ArtisanDashboard />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products" element={<ManageProducts />} />
              <Route path="orders" element={<Orders />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="withdraw" element={<Withdraw />} />
              <Route path="messages" element={<Messages />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderMonitoring />} />
              <Route path="payouts" element={<PayoutManagement />} />
              <Route path="withdrawals" element={<AdminWithdrawalPage />} />
              <Route path="escrow" element={<AdminEscrowPage />} />
              <Route path="categories" element={<CategoriesPage />} />
            </Route>

            <Route
              path="/seller"
              element={
                <ProtectedArtisanRoute>
                  <SellerDashboard />
                </ProtectedArtisanRoute>
              }
            />
            {/* Redirect /admin to dashboard if authenticated, otherwise to login */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <Navigate to="/admin/dashboard" replace />
                </ProtectedAdminRoute>
              }
            />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
      </main>

      {showFooter && <Footer />}
      <NetworkInfo />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
