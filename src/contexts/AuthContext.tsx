import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile, Barbershop } from '../supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  barbershop: Barbershop | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  barbershop: null,
  loading: true,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
      if (!session) setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthReady(true);
      if (!session) {
        setProfile(null);
        setBarbershop(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      
      const fetchProfileAndBarbershop = async () => {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profileError && profileData) {
          const p = profileData as Profile;
          setProfile(p);

          if (p.barbershop_id) {
            const { data: shopData } = await supabase
              .from('barbershops')
              .select('*')
              .eq('id', p.barbershop_id)
              .single();
            
            if (shopData) {
              setBarbershop(shopData as Barbershop);
            }
          }
        }
        setLoading(false);
      };

      fetchProfileAndBarbershop();

      // Real-time profile updates
      const profileChannel = supabase
        .channel(`profile:${user.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          setProfile(payload.new as Profile);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, barbershop, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};
