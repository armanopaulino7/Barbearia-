import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Users,
  Scissors,
  CreditCard,
  Star
} from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'employee' | 'client';
}

export default function Layout({ children, userRole }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [
    { icon: Home, label: 'Vitrine', path: '/', roles: ['admin', 'employee', 'client', undefined] },
    { icon: Calendar, label: 'Agendamentos', path: '/appointments', roles: ['admin', 'employee', 'client'] },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin'] },
    { icon: Users, label: 'Funcionários', path: '/admin/employees', roles: ['admin'] },
    { icon: Scissors, label: 'Serviços', path: '/admin/services', roles: ['admin'] },
    { icon: CreditCard, label: 'Pagamentos', path: '/admin/payments', roles: ['admin'] },
    { icon: Star, label: 'Avaliações', path: '/reviews', roles: ['admin', 'employee', 'client'] },
    { icon: User, label: 'Perfil', path: '/profile', roles: ['admin', 'employee', 'client'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole)) || (!userRole && item.roles.includes(undefined as any))
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-sm md:hidden">
        <Link to="/" className="text-xl font-bold tracking-tighter text-neutral-900">
          BARBER<span className="text-amber-600">FLOW</span>
        </Link>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-full p-2 hover:bg-neutral-100"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-neutral-200 bg-white p-6 md:block">
        <div className="mb-10">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-neutral-900">
            BARBER<span className="text-amber-600">FLOW</span>
          </Link>
        </div>
        
        <nav className="space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === item.path 
                  ? 'bg-amber-50 text-amber-700' 
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-40 bg-white p-6 md:hidden"
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="text-2xl font-bold tracking-tighter text-neutral-900">
                BARBER<span className="text-amber-600">FLOW</span>
              </span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            
            <nav className="space-y-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 text-lg font-medium ${
                    location.pathname === item.path ? 'text-amber-600' : 'text-neutral-600'
                  }`}
                >
                  <item.icon size={24} />
                  {item.label}
                </Link>
              ))}
              
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 pt-4 text-lg font-medium text-red-600"
                >
                  <LogOut size={24} />
                  Sair
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-screen md:pl-64">
        <div className="mx-auto max-w-5xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
