import React from 'react';
import { CreditCard, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SubscriptionBlocked() {
  const { profile } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6 text-center">
      <div className="max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-neutral-200/50">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Acesso Expirado</h1>
          <p className="text-neutral-500">
            Seu acesso ao <span className="font-bold text-amber-600">BarberFlow</span> expirou. 
            Faça o pagamento para continuar usando o aplicativo.
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-6 text-left space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Valor da Mensalidade</span>
            <span className="font-bold text-neutral-900">5.000 Kz</span>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">IBAN para Transferência</span>
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 font-mono text-sm">
              AO06.0000.0000.0000.0000.0
              <button className="text-amber-600 hover:text-amber-700">Copiar</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 font-bold text-white transition-all hover:bg-neutral-800 active:scale-95">
            Já paguei, enviar comprovativo
            <ExternalLink size={18} />
          </button>
          <p className="text-xs text-neutral-400">
            Após o envio, nosso administrador confirmará seu pagamento em até 24 horas.
          </p>
        </div>
      </div>
    </div>
  );
}
