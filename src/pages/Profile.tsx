import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Profile() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="h-32 bg-amber-600"></div>
        <div className="relative px-8 pb-8">
          <div className="absolute -top-12 left-8 h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 shadow-sm">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.display_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-neutral-300">
                <User size={48} />
              </div>
            )}
          </div>
          
          <div className="pt-16 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{profile.display_name}</h2>
              <p className="text-neutral-500 capitalize">{profile.role}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <Mail className="text-neutral-400" size={20} />
                <div>
                  <p className="text-xs font-medium text-neutral-400 uppercase">Email</p>
                  <p className="text-sm font-semibold">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                <Shield className="text-neutral-400" size={20} />
                <div>
                  <p className="text-xs font-medium text-neutral-400 uppercase">Status da Conta</p>
                  <p className="text-sm font-semibold">Ativa</p>
                </div>
              </div>
              {profile.subscription_expires_at && (
                <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
                  <Calendar className="text-neutral-400" size={20} />
                  <div>
                    <p className="text-xs font-medium text-neutral-400 uppercase">Assinatura até</p>
                    <p className="text-sm font-semibold">
                      {format(new Date(profile.subscription_expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
