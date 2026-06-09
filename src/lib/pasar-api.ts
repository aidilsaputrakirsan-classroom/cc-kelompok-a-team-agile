import type { Pasar } from '@/types';
import { apiFetch } from '@/lib/api';

interface ResPasar {
  id: string;
  nama: string;
  alamat?: string | null;
  status: number;
}

interface ResPasarSingle {
  data?: ResPasar;
}

interface ResPasarList {
  data: ResPasar[];
}

export function mapResPasarToPasar(item: ResPasar): Pasar {
  return {
    id: item.id,
    nama: item.nama,
    alamat: item.alamat ?? '',
    is_active: item.status,
    longitude: 0,
    latitude: 0,
  };
}

function toCreatePayload(p: Omit<Pasar, 'id'>) {
  return {
    nama: p.nama,
    alamat: p.alamat || undefined,
  };
}

function toUpdatePayload(p: Partial<Pasar>) {
  const payload: Record<string, unknown> = {};
  if (p.nama !== undefined) payload.nama = p.nama;
  if (p.alamat !== undefined) payload.alamat = p.alamat;
  if (p.is_active !== undefined) payload.status = p.is_active;
  return payload;
}

export const pasarApi = {
  async list(params?: { name?: string; status?: number; limit?: number }): Promise<Pasar[]> {
    const search = new URLSearchParams();
    if (params?.name) search.set('name', params.name);
    if (params?.status !== undefined) search.set('status', String(params.status));
    search.set('limit', String(params?.limit ?? 500));

    const query = search.toString();
    const res = await apiFetch<ResPasarList>(`/v1/admin/pasar${query ? `?${query}` : ''}`);
    return (res.data ?? []).map(mapResPasarToPasar);
  },

  async getById(id: string): Promise<Pasar> {
    const res = await apiFetch<ResPasarSingle>(`/v1/admin/pasar/${id}`);
    if (!res.data) throw new Error('Pasar tidak ditemukan');
    return mapResPasarToPasar(res.data);
  },

  async create(p: Omit<Pasar, 'id'>): Promise<Pasar> {
    const res = await apiFetch<ResPasarSingle>('/v1/admin/pasar', {
      method: 'POST',
      body: JSON.stringify(toCreatePayload(p)),
    });
    if (!res.data) throw new Error('Gagal membuat pasar');
    return mapResPasarToPasar(res.data);
  },

  async update(id: string, p: Partial<Pasar>): Promise<Pasar> {
    const res = await apiFetch<ResPasarSingle>(`/v1/admin/pasar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(toUpdatePayload(p)),
    });
    if (!res.data) throw new Error('Gagal memperbarui pasar');
    return mapResPasarToPasar(res.data);
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/v1/admin/pasar/${id}`, { method: 'DELETE' });
  },
};
