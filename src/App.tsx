import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Appointments from './pages/Appointments';
import AdminDashboard from './pages/AdminDashboard';
import SubscriptionBlocked from './pages/SubscriptionBlocked';
import Profile from './pages/Profile';
import { isAfter } from 'date-fns';

function AppRoutes() {
  const { profile, loading, isAuthReady, user } = useAuth();

  const isSubscriptionExpired = () => {
    if (profile?.role === 'admin' && profile.subscription_expires_at) {
      const expiryDate = new Date(profile.subscription_expires_at);
      return isAfter(new Date(), expiryDate);
    }
    return false;
  };

  if (!isAuthReady || (loading && user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (isSubscriptionExpired()) {
    return <SubscriptionBlocked />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout userRole={profile?.role}><Home /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/appointments" element={<Layout userRole={profile?.role}><Appointments /></Layout>} />
      <Route path="/profile" element={<Layout userRole={profile?.role}><Profile /></Layout>} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          profile?.role === 'admin' 
            ? <Layout userRole={profile.role}><AdminDashboard /></Layout> 
            : <Navigate to="/" />
        } 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
