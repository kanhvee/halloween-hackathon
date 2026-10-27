import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar, { type AppRole } from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomerView from '@/components/CustomerView';
import CookDashboard from '@/components/CookDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import AuthPage from '@/components/AuthPage';
import Logo from '@/components/Logo';

function AppContent() {
  const { session, profile, loading } = useAuth();
  const [role, setRole] = useState<AppRole>('customer');

  useEffect(() => {
    if (profile) {
      if (profile.role === 'admin') setRole('admin');
      else if (profile.role === 'cook') setRole('cook');
      else setRole('customer');
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Logo className="w-16 h-16 mb-4" />
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role={role} onRoleChange={setRole} />
      <main className="flex-1">
        {role === 'customer' && <CustomerView />}
        {role === 'cook' && <CookDashboard />}
        {role === 'admin' && <AdminDashboard />}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
