import React, { useState } from 'react';
import { CreditCard, AlertTriangle, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabase';

export default function SubscriptionBlocked() {
  const { profile, barbershop } = useAuth();
  const [isPending, setIsPending] = useState(barbershop?.payment_status === 'pending');

  const handleAlreadyPaid = async () => {
    if (!barbershop) return;
    
    try {
      const { error } = await supabase
        .from('barbershops')
        .update({ payment_status: 'pending' })
        .eq('id', barbershop.id);
      
      if (error) throw error;
      setIsPending(true);
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 p-6 text-center">
      <div className="max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl shadow-neutral-200/50">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
          <AlertTriangle size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Seu acesso foi bloqueado</h1>
          <p className="text-neutral-500">
            Para continuar usando o aplicativo <span className="font-bold text-amber-600">BarberFlow</span>, pague a mensalidade.
          </p>
        </div>

        <div className="rounded-2xl bg-neutral-50 p-6 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <span className="text-sm font-medium text-neutral-500">Valor Mensal</span>
            <span className="text-xl font-bold text-neutral-900">5.000 Kz</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Método de Pagamento</p>
              <p className="font-bold text-neutral-800">Transferência via Kwik</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Número Kwik</p>
              <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-3 font-mono text-lg font-bold">
                938243909
                <button 
                  onClick={() => navigator.clipboard.writeText('938243909')}
                  className="text-xs font-sans font-medium text-amber-600 hover:text-amber-700"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">Instruções:</p>
            <p>Após o pagamento, envie o comprovativo pelo WhatsApp: <span className="font-bold">938243909</span></p>
          </div>

          {isPending ? (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 py-4 font-bold text-green-700">
              <CheckCircle2 size={20} />
              Aguardando confirmação do pagamento
            </div>
          ) : (
            <button 
              onClick={handleAlreadyPaid}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-4 font-bold text-white transition-all hover:bg-neutral-800 active:scale-95"
            >
              Já paguei
            </button>
          )}

          <a 
            href="https://wa.me/244938243909" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 font-semibold text-neutral-700 transition-all hover:bg-neutral-50"
          >
            <MessageCircle size={20} className="text-green-600" />
            Enviar Comprovativo no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
