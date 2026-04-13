import React, { useEffect, useState } from 'react';
import { supabase, Service } from '../supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Scissors, Trash2, Edit2, Image as ImageIcon, Upload } from 'lucide-react';

export default function Services() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', description: '', image_url: '' });

  useEffect(() => {
    if (profile?.barbershop_id) {
      fetchServices();
    }
  }, [profile?.barbershop_id]);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', profile?.barbershop_id)
      .order('name');

    if (!error && data) {
      setServices(data as Service[]);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.barbershop_id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.barbershop_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('services')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('services')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Erro ao carregar imagem. Verifique se o bucket "services" existe no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.barbershop_id) return;

    const { error } = await supabase.from('services').insert({
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      image_url: formData.image_url,
      barbershop_id: profile.barbershop_id
    });

    if (!error) {
      setFormData({ name: '', price: '', description: '', image_url: '' });
      setIsAdding(false);
      fetchServices();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (!error) fetchServices();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 font-bold text-white hover:bg-amber-700"
        >
          <Plus size={20} />
          Novo Serviço
        </button>
      </div>

      {isAdding && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <form onSubmit={handleAddService} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Serviço</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 p-2.5 focus:border-amber-600 focus:outline-none"
                placeholder="Ex: Corte Degradê"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço (Kz)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 p-2.5 focus:border-amber-600 focus:outline-none"
                placeholder="Ex: 3000"
                required
              />
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium">Imagem do Corte</label>
              <div className="flex items-center gap-4">
                <div className="relative flex h-32 w-48 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 transition-colors hover:border-amber-600">
                  {formData.image_url ? (
                    <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-neutral-400">
                      {uploading ? (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
                      ) : (
                        <>
                          <ImageIcon size={24} />
                          <span className="text-xs">Clique para carregar</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={uploading}
                  />
                </div>
                {formData.image_url && (
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 p-2.5 focus:border-amber-600 focus:outline-none"
                placeholder="Breve descrição do serviço..."
                rows={3}
              />
            </div>
            <div className="col-span-full flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="rounded-xl px-4 py-2 font-medium text-neutral-500 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 px-6 py-2 font-bold text-white hover:bg-neutral-800"
              >
                Salvar Serviço
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Scissors size={24} />
              </div>
              <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="text-neutral-400 hover:text-amber-600">
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="text-neutral-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold">{service.name}</h3>
            <p className="mt-1 text-2xl font-black text-amber-600">
              {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(service.price)}
            </p>
            {service.description && (
              <p className="mt-3 text-sm text-neutral-500 line-clamp-2">{service.description}</p>
            )}
          </div>
        ))}
        {services.length === 0 && !loading && (
          <p className="col-span-full py-12 text-center text-neutral-500 italic">
            Nenhum serviço cadastrado ainda.
          </p>
        )}
      </div>
    </div>
  );
}
