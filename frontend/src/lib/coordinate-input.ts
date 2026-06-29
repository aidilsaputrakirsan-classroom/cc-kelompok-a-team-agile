/** Format angka koordinat untuk ditampilkan di input teks. */
export function formatCoordinateForInput(value: number): string {
  if (!value) return '';
  return String(value);
}

/** Izinkan input parsial saat mengetik: -6.9147, 107., -, dll. */
export function isValidCoordinateDraft(value: string): boolean {
  return value === '' || /^-?\d*\.?\d*$/.test(value);
}

/** Parse koordinat dari input teks; kosong → 0, invalid → NaN. */
export function parseCoordinateInput(value: string): number {
  const trimmed = value.trim();
  if (!trimmed || trimmed === '-' || trimmed === '.') return 0;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : NaN;
}
