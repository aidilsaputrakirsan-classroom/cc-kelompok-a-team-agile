/** Rentang kasar koordinat Indonesia (untuk deteksi lat/lng tertukar). */
const INDO_LAT_MIN = -11;
const INDO_LAT_MAX = 6;
const INDO_LNG_MIN = 95;
const INDO_LNG_MAX = 141;

export type GeoPoint = { longitude: number; latitude: number };

function isIndonesiaLatitude(value: number): boolean {
  return value >= INDO_LAT_MIN && value <= INDO_LAT_MAX;
}

function isIndonesiaLongitude(value: number): boolean {
  return value >= INDO_LNG_MIN && value <= INDO_LNG_MAX;
}

/** Deteksi & perbaiki latitude/longitude yang tertukar (kasus umum di Indonesia). */
export function normalizeGeoCoordinates(
  longitude: number,
  latitude: number,
): GeoPoint & { swapped: boolean } {
  if (Math.abs(longitude) < 0.0001 && Math.abs(latitude) < 0.0001) {
    return { longitude, latitude, swapped: false };
  }

  const shouldSwap =
    (isIndonesiaLongitude(latitude) && isIndonesiaLatitude(longitude)) ||
    (Math.abs(latitude) > 90 && Math.abs(longitude) <= 90) ||
    (isIndonesiaLongitude(latitude) &&
      !isIndonesiaLatitude(latitude) &&
      Math.abs(longitude) <= INDO_LAT_MAX);

  if (shouldSwap) {
    return { longitude: latitude, latitude: longitude, swapped: true };
  }

  return { longitude, latitude, swapped: false };
}

export function getLeafletPosition(point: GeoPoint): [number, number] {
  const { longitude, latitude } = normalizeGeoCoordinates(
    point.longitude,
    point.latitude,
  );
  return [latitude, longitude];
}

export function hasValidMapCoords(point: GeoPoint): boolean {
  const { longitude, latitude } = normalizeGeoCoordinates(
    point.longitude,
    point.latitude,
  );
  return (
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    Math.abs(latitude) > 0.0001 &&
    Math.abs(longitude) > 0.0001
  );
}

export function validateCoordinatePair(
  longitude: number,
  latitude: number,
): string | null {
  if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
    return "Longitude dan latitude harus berupa angka.";
  }
  if (Math.abs(latitude) > 90) {
    return "Latitude harus antara -90 dan 90. Pastikan tidak tertukar dengan longitude.";
  }
  if (Math.abs(longitude) > 180) {
    return "Longitude harus antara -180 dan 180.";
  }
  const normalized = normalizeGeoCoordinates(longitude, latitude);
  if (normalized.swapped) {
    return null;
  }
  if (
    !isIndonesiaLatitude(latitude) &&
    !isIndonesiaLongitude(longitude) &&
    (Math.abs(longitude) > 0.0001 || Math.abs(latitude) > 0.0001)
  ) {
    return "Koordinat di luar rentang Indonesia. Periksa kembali nilai latitude (±11) dan longitude (95–141).";
  }
  return null;
}
