import React, { useEffect, useState } from 'react';
import { supabase, Service } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Scissors, Clock, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!profile?.barbershop_id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', profile.barbershop_id)
        .order('name');
      
      if (!error && data) {
        setServices(data as Service[]);
      }
      setLoading(false);
    };

    fetchServices();

    // Real-time updates for services
    const channel = supabase
      .channel('services-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'services',
        filter: profile?.barbershop_id ? `barbershop_id=eq.${profile.barbershop_id}` : undefined
      }, () => {
        fetchServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.barbershop_id]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 p-8 text-white md:p-12">
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Estilo e Confiança em Cada Corte.
          </h1>
          <p className="text-neutral-400">
            Agende seu horário com os melhores barbeiros da região. Simples, rápido e eficiente.
          </p>
          <Link 
            to="/appointments"
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-semibold text-white transition-transform hover:scale-105 active:scale-95"
          >
            Agendar Agora
            <ChevronRight size={20} />
          </Link>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-600/20 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-neutral-800 blur-3xl"></div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Nossos Serviços</h2>
          <span className="text-sm font-medium text-neutral-500">{services.length} opções</span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.length > 0 ? (
            services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:shadow-md"
              >
                <div className="aspect-video w-full overflow-hidden bg-neutral-100">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300">
                      <Scissors size={48} />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-neutral-900">{service.name}</h3>
                    <span className="font-bold text-amber-600">
                      {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(service.price)}
                    </span>
                  </div>
                  {service.description && (
                    <p className="mb-4 text-sm text-neutral-500 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <Link
                    to={`/appointments?service=${service.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    Agendar
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-neutral-500">
              Nenhum serviço disponível no momento.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-amber-50 p-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock size={20} />
            </div>
            <h3 className="font-bold">Rápido e Fácil</h3>
            <p className="text-sm text-neutral-600">Agende seu corte em menos de 1 minuto pelo celular.</p>
          </div>
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Star size={20} />
            </div>
            <h3 className="font-bold">Qualidade Garantida</h3>
            <p className="text-sm text-neutral-600">Barbeiros profissionais avaliados pela comunidade.</p>
          </div>
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Scissors size={20} />
            </div>
            <h3 className="font-bold">Estilo Moderno</h3>
            <p className="text-sm text-neutral-600">As últimas tendências em cortes e barbas.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
