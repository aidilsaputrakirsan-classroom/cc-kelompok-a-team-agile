-- +migrate Up
-- Perbaiki pasar dengan latitude/longitude tertukar (latitude berisi 95-141, longitude berisi -11..6)
UPDATE sihp.pasar
SET
    longitude = latitude,
    latitude = longitude
WHERE deleted_at IS NULL
  AND latitude BETWEEN 95 AND 141
  AND longitude BETWEEN -11 AND 6;

-- +migrate Down
-- Tidak dapat dipulihkan otomatis tanpa backup; no-op
