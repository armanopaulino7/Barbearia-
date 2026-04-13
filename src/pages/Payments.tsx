import React, { useEffect, useState } from 'react';
import { supabase, Order } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Payments() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.barbershop_id) {
      fetchPayments();
    }
  }, [profile?.barbershop_id]);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('barbershop_id', profile?.barbershop_id)
      .eq('status', 'completed')
      .order('scheduled_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + (curr.value || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Faturamento Total (Concluído)</p>
              <h3 className="text-3xl font-bold tracking-tight">
                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalRevenue)}
              </h3>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Cortes Realizados</p>
              <h3 className="text-3xl font-bold tracking-tight">{orders.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 text-neutral-900">
                  {format(new Date(order.scheduled_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 font-bold text-neutral-900">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(order.value)}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Concluído
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-neutral-400 italic">
                  Nenhum pagamento registrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
