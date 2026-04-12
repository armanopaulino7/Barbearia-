import React from 'react';
import { supabase } from '../supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Chrome, Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + from
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Falha ao entrar com Google. Tente novamente.');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        setError('Verifique seu email para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-8 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Bem-vindo ao <span className="text-amber-600">BarberFlow</span>
        </h1>
        <p className="text-neutral-500">
          Entre para agendar seus cortes e gerenciar seus horários.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {error && (
          <div className={`rounded-lg p-3 text-sm ${error.includes('Verifique') ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-neutral-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-neutral-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-neutral-900 py-3 font-bold text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 px-2 text-neutral-500">Ou continue com</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-3 font-semibold text-neutral-700 transition-all hover:bg-neutral-50 active:scale-95 disabled:opacity-50"
        >
          <Chrome size={20} className="text-blue-600" />
          Google
        </button>

        <p className="text-sm text-neutral-500">
          {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 font-bold text-amber-600 hover:underline"
          >
            {isSignUp ? 'Entrar' : 'Cadastrar-se'}
          </button>
        </p>
      </div>
    </div>
  );
}
