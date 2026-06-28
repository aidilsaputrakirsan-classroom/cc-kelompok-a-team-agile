
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."harga_rutin" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "id_pengumpulan_data" uuid NOT NULL,
    "id_tempat_usaha" uuid NOT NULL,
    "id_komoditas" uuid NOT NULL,
    "kelas_komoditas" TEXT NOT NULL,
    "harga" BIGINT NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fk_harga_rutin_pengumpulan_data" FOREIGN KEY ("id_pengumpulan_data") REFERENCES "sihp"."pengumpulan_data" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_harga_rutin_tempat_usaha" FOREIGN KEY ("id_tempat_usaha") REFERENCES "sihp"."tempat_usaha" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_harga_rutin_komoditas" FOREIGN KEY ("id_komoditas") REFERENCES "sihp"."komoditas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uq_harga_rutin_batch_komoditas_kelas" UNIQUE ("id_pengumpulan_data", "id_komoditas", "kelas_komoditas")
);

CREATE INDEX IF NOT EXISTS "idx_harga_rutin_pengumpulan_komoditas" ON "sihp"."harga_rutin" ("id_pengumpulan_data", "id_komoditas");

-- +migrate Down
DROP INDEX IF EXISTS "idx_harga_rutin_pengumpulan_komoditas";
DROP TABLE IF EXISTS "sihp"."harga_rutin";
