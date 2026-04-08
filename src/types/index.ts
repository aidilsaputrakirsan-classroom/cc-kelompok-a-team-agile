export interface Pasar {
  id: string;
  nama: string;
  longitude: number;
  latitude: number;
  alamat: string;
  is_active: number;
}

export type SatuanDasar = 'kg' | 'gram' | 'ons' | 'ton' | 'liter' | 'ml';

export const SATUAN_DASAR_OPTIONS: { value: SatuanDasar; label: string }[] = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'gram', label: 'Gram (g)' },
  { value: 'ons', label: 'Ons' },
  { value: 'ton', label: 'Ton' },
  { value: 'liter', label: 'Liter (L)' },
  { value: 'ml', label: 'Mililiter (mL)' },
];

export interface Komoditas {
  id: string;
  nama: string;
  satuan_dasar: SatuanDasar;
  gambar: string; // base64 data URL
}

export interface TempatUsaha {
  id: string;
  nama: string;
  nama_pemilik: string;
  nama_narahubung: string;
  nomor_narahubung: string;
  berjualan_sejak: string;
  is_active: number;
  pasar_id: string;
}

export interface KomoditasDijual {
  id: string;
  tempat_usaha_id: string;
  komoditas_id: string;
  harga_normal: number;
  harga_mahal: number;
  satuan_stok: string;
  nilai_stok: number;
  nilai_periode: number;
  lokasi_supplier: string;
  pola_distribusi: number;
  standardized_stock_periode: number;
  is_active: boolean;
}

export type KelasKomoditas = 'besar' | 'menengah' | 'kecil';

export interface HargaRutin {
  id: string;
  nama_enumerator: string;
  tanggal: string;
  pasar_id: string;
  komoditas_id: string;
  kelas_komoditas: KelasKomoditas;
  tempat_usaha_id: string;
  harga: number;
  status: 'dalam_proses' | 'finalisasi';
}

export interface HargaPelaporan {
  id: string;
  tanggal: string;
  pasar_id: string;
  komoditas_id: string;
  harga_rata_rata: number;
  harga_besar: number | null;
  harga_menengah: number | null;
  harga_kecil: number | null;
}
