
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."harga_pelaporan" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "id_pengumpulan_data" uuid NOT NULL,
    "id_komoditas" uuid NOT NULL,
    "tanggal" DATE NOT NULL,
    "harga" BIGINT NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fk_harga_pelaporan_pengumpulan_data" FOREIGN KEY ("id_pengumpulan_data") REFERENCES "sihp"."pengumpulan_data" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_harga_pelaporan_komoditas" FOREIGN KEY ("id_komoditas") REFERENCES "sihp"."komoditas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uq_harga_pelaporan_batch_komoditas" UNIQUE ("id_pengumpulan_data", "id_komoditas")
);

CREATE INDEX IF NOT EXISTS "idx_harga_pelaporan_komoditas_pengumpulan" ON "sihp"."harga_pelaporan" ("id_komoditas", "id_pengumpulan_data");

-- +migrate Down
DROP INDEX IF EXISTS "idx_harga_pelaporan_komoditas_pengumpulan";
DROP TABLE IF EXISTS "sihp"."harga_pelaporan";