import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Home } from './pages/Home';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { VerifyOTP } from './pages/Auth/VerifyOTP';
import { StaffLogin } from './pages/Admin/StaffLogin';
import { Users } from './pages/Admin/Users';
import { Dashboard as AdminDashboard } from './pages/Admin/Dashboard';
import { Staff } from './pages/Admin/Staff';
import { Meals } from './pages/Admin/Meals';
import { Orders } from './pages/Admin/Orders';
import { Locations } from './pages/Admin/Locations';
import { Analytics } from './pages/Admin/Analytics';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AdminLayout } from './components/AdminLayout';
import { PlanSelection } from './pages/Onboarding/PlanSelection';
import { PersonalDetails } from './pages/Onboarding/PersonalDetails';
import { MealSelection } from './pages/Onboarding/MealSelection';
import { DeliveryAddress } from './pages/Onboarding/DeliveryAddress';
import { Payment } from './pages/Onboarding/Payment';
import { PaymentCallback } from './pages/Onboarding/PaymentCallback';
import { Success } from './pages/Onboarding/Success';
import { UserLayout } from './components/UserLayout';
import { DashboardHome } from './pages/Dashboard/DashboardHome';
import { SubscriptionManagement } from './pages/Dashboard/SubscriptionManagement';
import { PlaceholderPage } from './pages/Dashboard/PlaceholderPage';

function App() {
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
              <span>🥗</span>
              <span>{t('app.title', 'FitPlate')}</span>
            </h1>
            <LanguageSwitcher />
          </div>
        </header>
        
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            
            {/* Onboarding routes - protected */}
            <Route
              path="/onboarding/plan"
              element={
                <ProtectedRoute requireUser>
                  <PlanSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/details"
              element={
                <ProtectedRoute requireUser>
                  <PersonalDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/meals"
              element={
                <ProtectedRoute requireUser>
                  <MealSelection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/address"
              element={
                <ProtectedRoute requireUser>
                  <DeliveryAddress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/payment"
              element={
                <ProtectedRoute requireUser>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/payment/callback"
              element={
                <ProtectedRoute requireUser>
                  <PaymentCallback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/success"
              element={
                <ProtectedRoute requireUser>
                  <Success />
                </ProtectedRoute>
              }
            />
            
            {/* User dashboard - protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <DashboardHome />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/subscription"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <SubscriptionManagement />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/meals"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <PlaceholderPage title="Meal Selection" icon="🍽️" description="Select and manage your weekly meals" />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/deliveries"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <PlaceholderPage title="Deliveries" icon="🚚" description="View your delivery schedule" />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/orders"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <PlaceholderPage title="Order History" icon="📦" description="View your past orders" />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/progress"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <PlaceholderPage title="Progress Tracking" icon="📈" description="Track your weight and fitness goals" />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <PlaceholderPage title="Profile Settings" icon="👤" description="Manage your account settings" />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/payments"
              element={
                <ProtectedRoute requireUser>
                  <UserLayout>
                    <PlaceholderPage title="Payment Methods" icon="💳" description="Manage your payment methods and history" />
                  </UserLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<StaffLogin />} />
            
            {/* Admin dashboard - protected with AdminLayout */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Users />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/staff"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Staff />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/meals"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Meals />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Orders />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/locations"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Locations />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            
            <Route
              path="/admin/analytics"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <Analytics />
                  </AdminLayout>
                </AdminRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

