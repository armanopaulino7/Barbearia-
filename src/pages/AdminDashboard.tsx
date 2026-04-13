import React, { useEffect, useState } from 'react';
import { supabase, Order } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Scissors,
  CreditCard,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';

interface Stats {
  totalOrders: number;
  totalClients: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export default function AdminDashboard() {
  const { profile, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthReady && profile?.role !== 'admin') {
      navigate('/');
    }
  }, [profile, isAuthReady, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.barbershop_id) return;

      const [ordersRes, clientsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('barbershop_id', profile.barbershop_id),
        supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'client')
          .eq('barbershop_id', profile.barbershop_id)
      ]);

      if (ordersRes.data) {
        const orders = ordersRes.data as Order[];
        const completed = orders.filter(o => o.status === 'completed');
        
        setStats({
          totalOrders: orders.length,
          totalClients: clientsRes.count || 0,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          completedOrders: completed.length,
          totalRevenue: completed.reduce((acc, curr) => acc + (curr.value || 0), 0)
        });
      }
      setLoading(false);
    };

    fetchStats();

    // Real-time updates
    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: profile?.barbershop_id ? `barbershop_id=eq.${profile.barbershop_id}` : undefined
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.barbershop_id]);

  const statCards = [
    { label: 'Faturamento Total', value: new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(stats.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total de Pedidos', value: stats.totalOrders, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Clientes Ativos', value: stats.totalClients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pedidos Pendentes', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-600">
          Tempo Real
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl ${card.bg} p-3 ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-500">{card.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-6 text-lg font-bold">Pedidos Recentes</h3>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 italic">Monitorando pedidos em tempo real...</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h3 className="mb-6 text-lg font-bold">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/admin/employees"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
            >
              <Users className="text-neutral-600" />
              <span className="text-sm font-medium">Funcionários</span>
            </Link>
            <Link 
              to="/admin/services"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
            >
              <Scissors className="text-neutral-600" />
              <span className="text-sm font-medium">Serviços</span>
            </Link>
            <Link 
              to="/admin/payments"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
            >
              <CreditCard className="text-neutral-600" />
              <span className="text-sm font-medium">Pagamentos</span>
            </Link>
            <Link 
              to="/reviews"
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50"
            >
              <Star className="text-neutral-600" />
              <span className="text-sm font-medium">Avaliações</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
