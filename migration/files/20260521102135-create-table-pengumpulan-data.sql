
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."pengumpulan_data" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "id_pasar" uuid NOT NULL,
    "tanggal" DATE NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 0,
    "catatan" TEXT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fk_pengumpulan_data_pasar" FOREIGN KEY ("id_pasar") REFERENCES "sihp"."pasar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_pengumpulan_data_pasar_tanggal" ON "sihp"."pengumpulan_data" ("id_pasar", "tanggal");

-- +migrate Down
DROP INDEX IF EXISTS "idx_pengumpulan_data_pasar_tanggal";
DROP TABLE IF EXISTS "sihp"."pengumpulan_data";
