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

/**
 * Tabel konversi satuan ke satuan dasar (kg atau liter).
 * Contoh: 1 ons = 0.1 kg, 1 ton = 1000 kg, 1 ml = 0.001 liter.
 */
export const KONVERSI_SATUAN: Record<SatuanDasar, { base: 'kg' | 'liter'; factor: number }> = {
  kg:    { base: 'kg',    factor: 1 },
  gram:  { base: 'kg',    factor: 0.001 },
  ons:   { base: 'kg',    factor: 0.1 },
  ton:   { base: 'kg',    factor: 1000 },
  liter: { base: 'liter', factor: 1 },
  ml:    { base: 'liter', factor: 0.001 },
};

/**
 * Menghitung harga terstandarisasi per satuan dasar komoditas.
 * @param hargaInput - Harga yang diinput pengguna
 * @param jumlahInput - Jumlah/berat yang diinput
 * @param satuanInput - Satuan berat input pengguna
 * @param satuanDasar - Satuan dasar komoditas (target konversi)
 * @returns Harga per satuan dasar, dibulatkan
 */
export function hitungHargaStandar(
  hargaInput: number,
  jumlahInput: number,
  satuanInput: SatuanDasar,
  satuanDasar: SatuanDasar,
): number {
  if (jumlahInput <= 0) return 0;
  const konversiInput = KONVERSI_SATUAN[satuanInput];
  const konversiDasar = KONVERSI_SATUAN[satuanDasar];
  // Konversi jumlah input ke satuan dasar komoditas
  const jumlahDalamSatuanDasar = (jumlahInput * konversiInput.factor) / konversiDasar.factor;
  // Harga per satuan dasar
  return Math.round(hargaInput / jumlahDalamSatuanDasar);
}

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
  /** Harga asli yang diinput pengguna */
  harga_input: number;
  /** Jumlah/berat yang diinput pengguna */
  jumlah_input: number;
  /** Satuan berat yang diinput pengguna */
  satuan_input: SatuanDasar;
  /** Harga terstandarisasi per satuan dasar komoditas (dihitung otomatis) */
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
