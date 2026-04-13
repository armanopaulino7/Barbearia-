import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Calendar, Camera, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../supabase';

export default function Profile() {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);

  if (!profile) return null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      // Profile will update via real-time channel in AuthContext
    } catch (err) {
      console.error('Error uploading avatar:', err);
      alert('Erro ao carregar foto de perfil. Verifique se o bucket "avatars" existe no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>

      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
        <div className="h-32 bg-amber-600"></div>
        <div className="relative px-8 pb-8">
          <div className="absolute -top-12 left-8">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-neutral-100 shadow-sm">
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.display_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-300">
                  <User size={48} />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="animate-spin text-white" size={24} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-transform hover:scale-110">
              <Camera size={16} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
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
