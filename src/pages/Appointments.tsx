import React, { useEffect, useState } from 'react';
import { supabase, Service, Profile } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User as UserIcon, Scissors, CheckCircle2 } from 'lucide-react';
import { format, addDays, startOfToday, setHours, setMinutes, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'motion/react';

export default function Appointments() {
  const { user, profile, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service');

  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Profile[]>([]);
  const [selectedService, setSelectedService] = useState<string>(initialServiceId || '');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthReady && !user) {
      navigate('/login', { state: { from: { pathname: '/appointments' } } });
    }
  }, [user, isAuthReady, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.barbershop_id) return;

      const [servicesRes, barbersRes] = await Promise.all([
        supabase.from('services').select('*').eq('barbershop_id', profile.barbershop_id),
        supabase.from('profiles').select('*').eq('role', 'employee').eq('barbershop_id', profile.barbershop_id)
      ]);

      if (servicesRes.data) setServices(servicesRes.data as Service[]);
      if (barbersRes.data) setBarbers(barbersRes.data as Profile[]);
    };

    fetchData();
  }, [profile?.barbershop_id]);

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleBooking = async () => {
    if (!user || !profile?.barbershop_id || !selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes);
      
      const service = services.find(s => s.id === selectedService);

      const { error } = await supabase.from('orders').insert({
        client_id: user.id,
        barber_id: selectedBarber,
        service_id: selectedService,
        barbershop_id: profile.barbershop_id,
        status: 'pending',
        value: service?.price || 0,
        scheduled_at: scheduledAt.toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="rounded-full bg-green-100 p-4 text-green-600"
        >
          <CheckCircle2 size={64} />
        </motion.div>
        <h2 className="text-2xl font-bold">Agendamento Realizado!</h2>
        <p className="text-neutral-500">Seu horário foi reservado com sucesso. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agendar Horário</h1>
        <p className="text-neutral-500">Escolha o serviço, profissional e horário de sua preferência.</p>
      </div>

      <div className="space-y-6">
        {/* Service Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <Scissors size={18} className="text-amber-600" />
            Serviço
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`flex flex-col rounded-xl border p-4 text-left transition-all ${
                  selectedService === service.id 
                    ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600' 
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <span className="font-bold">{service.name}</span>
                <span className="text-sm text-neutral-500">
                  {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(service.price)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Barber Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <UserIcon size={18} className="text-amber-600" />
            Barbeiro
          </label>
          <div className="flex flex-wrap gap-3">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => setSelectedBarber(barber.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  selectedBarber === barber.id 
                    ? 'border-amber-600 bg-amber-600 text-white' 
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {barber.display_name}
              </button>
            ))}
            {barbers.length === 0 && (
              <p className="text-sm text-neutral-400 italic">Nenhum barbeiro disponível no momento.</p>
            )}
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <CalendarIcon size={18} className="text-amber-600" />
            Data
          </label>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[0, 1, 2, 3, 4, 5, 6].map((days) => {
              const date = addDays(startOfToday(), days);
              const isSelected = isSameDay(selectedDate, date);
              return (
                <button
                  key={days}
                  onClick={() => setSelectedDate(date)}
                  className={`flex min-w-[80px] flex-col items-center rounded-xl border p-3 transition-all ${
                    isSelected 
                      ? 'border-amber-600 bg-amber-50 ring-1 ring-amber-600' 
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <span className="text-xs uppercase text-neutral-500">
                    {format(date, 'EEE', { locale: ptBR })}
                  </span>
                  <span className="text-lg font-bold">
                    {format(date, 'dd')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <Clock size={18} className="text-amber-600" />
            Horário
          </label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-lg border py-2 text-sm font-medium transition-all ${
                  selectedTime === time 
                    ? 'border-amber-600 bg-amber-600 text-white' 
                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleBooking}
          disabled={loading || !selectedService || !selectedBarber || !selectedTime}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-4 text-lg font-bold text-white transition-all hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-400 border-t-white"></div>
          ) : (
            'Confirmar Agendamento'
          )}
        </button>
      </div>
    </div>
  );
}
