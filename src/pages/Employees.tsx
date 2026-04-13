import React, { useEffect, useState } from 'react';
import { supabase, Profile } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Shield, Trash2, User } from 'lucide-react';

export default function Employees() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.barbershop_id) {
      fetchEmployees();
    }
  }, [profile?.barbershop_id]);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('barbershop_id', profile?.barbershop_id)
      .eq('role', 'employee');

    if (!error && data) {
      setEmployees(data as Profile[]);
    }
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Note: In a real app, you'd send an invite or create a user.
    // Here we'll just try to find a user by email and promote them.
    try {
      const { data, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newEmail)
        .single();

      if (findError || !data) {
        throw new Error('Usuário não encontrado. Peça para o funcionário se cadastrar no app primeiro.');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'employee',
          barbershop_id: profile?.barbershop_id 
        })
        .eq('id', data.id);

      if (updateError) throw updateError;

      setNewEmail('');
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Funcionários</h1>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold">Adicionar Funcionário</h3>
        <form onSubmit={handleAddEmployee} className="flex gap-4">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-3 text-neutral-400" size={18} />
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email do funcionário"
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-2.5 font-bold text-white hover:bg-neutral-800"
          >
            <UserPlus size={18} />
            Adicionar
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <div key={emp.id} className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-100">
              {emp.photo_url ? (
                <img src={emp.photo_url} alt={emp.display_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-300">
                  <User size={24} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold">{emp.display_name}</h4>
              <p className="text-sm text-neutral-500">{emp.email}</p>
            </div>
            <button className="text-neutral-400 hover:text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {employees.length === 0 && !loading && (
          <p className="col-span-full py-8 text-center text-neutral-500 italic">
            Nenhum funcionário cadastrado.
          </p>
        )}
      </div>
    </div>
  );
}
