import React, { useEffect, useState } from 'react';
import { supabase, Barbershop } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, CheckCircle, Clock, Calendar, RefreshCw } from 'lucide-react';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SuperAdmin() {
  const { profile } = useAuth();
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBarbershops(data as Barbershop[]);
    }
    setLoading(false);
  };

  const handleActivate = async (shopId: string) => {
    const newExpiry = addDays(new Date(), 30).toISOString();
    const { error } = await supabase
      .from('barbershops')
      .update({ 
        subscription_expires_at: newExpiry,
        payment_status: 'confirmed'
      })
      .eq('id', shopId);

    if (!error) {
      fetchBarbershops();
    }
  };

  const filteredShops = barbershops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin</h1>
        <button 
          onClick={fetchBarbershops}
          className="rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-neutral-400" size={20} />
        <input
          type="text"
          placeholder="Buscar barbearia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="px-6 py-4">Barbearia</th>
              <th className="px-6 py-4">Expira em</th>
              <th className="px-6 py-4">Status Pagamento</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredShops.map((shop) => (
              <tr key={shop.id} className="hover:bg-neutral-50">
                <td className="px-6 py-4 font-medium text-neutral-900">{shop.name}</td>
                <td className="px-6 py-4 text-neutral-500">
                  {format(new Date(shop.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4">
                  {shop.payment_status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      <Clock size={12} /> Pendente
                    </span>
                  ) : shop.payment_status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      <CheckCircle size={12} /> Confirmado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                      Nenhum
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleActivate(shop.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                  >
                    <Calendar size={14} />
                    Renovar +30 dias
                  </button>
                </td>
              </tr>
            ))}
            {filteredShops.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-neutral-400 italic">
                  Nenhuma barbearia encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
