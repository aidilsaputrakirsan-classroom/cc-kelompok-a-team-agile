
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."komoditas" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nama" VARCHAR(255) NOT NULL,
    "satuan" VARCHAR(100) NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL
);

CREATE INDEX IF NOT EXISTS "idx_komoditas_nama" ON "sihp"."komoditas" ("nama");

-- +migrate Down
DROP INDEX IF EXISTS "idx_komoditas_nama";
DROP TABLE IF EXISTS "sihp"."komoditas";