import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Star, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  client: { display_name: string; photo_url: string };
}

export default function Reviews() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.barbershop_id) {
      fetchReviews();
    }
  }, [profile?.barbershop_id]);

  const fetchReviews = async () => {
    setLoading(true);
    // Note: This assumes a join which might need specific setup in Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        client:client_id (display_name, photo_url)
      `)
      .eq('barbershop_id', profile?.barbershop_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReviews(data as any[]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Avaliações</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-100">
                  {review.client?.photo_url ? (
                    <img src={review.client.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-300">
                      <User size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{review.client?.display_name || 'Cliente'}</h4>
                  <p className="text-xs text-neutral-400">
                    {format(new Date(review.created_at), "dd 'de' MMM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < review.rating ? "currentColor" : "none"} 
                    className={i < review.rating ? "" : "text-neutral-200"}
                  />
                ))}
              </div>
            </div>
            {review.comment && (
              <div className="flex gap-3 rounded-xl bg-neutral-50 p-4">
                <MessageSquare size={18} className="mt-1 shrink-0 text-neutral-400" />
                <p className="text-sm text-neutral-600 italic">"{review.comment}"</p>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-neutral-500 italic">
            Nenhuma avaliação recebida ainda.
          </div>
        )}
      </div>
    </div>
  );
}
