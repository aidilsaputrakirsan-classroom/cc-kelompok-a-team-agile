
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."komoditas_dijual" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "id_tempat_usaha" uuid NOT NULL,
    "id_komoditas" uuid NOT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fk_komoditas_dijual_tempat_usaha" FOREIGN KEY ("id_tempat_usaha") REFERENCES "sihp"."tempat_usaha" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "fk_komoditas_dijual_komoditas" FOREIGN KEY ("id_komoditas") REFERENCES "sihp"."komoditas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "uq_komoditas_dijual_tempat_komoditas" UNIQUE ("id_tempat_usaha", "id_komoditas")
);

CREATE INDEX IF NOT EXISTS "idx_komoditas_dijual_tempat_komoditas" ON "sihp"."komoditas_dijual" ("id_tempat_usaha", "id_komoditas");

-- +migrate Down
DROP INDEX IF EXISTS "idx_komoditas_dijual_tempat_komoditas";
DROP TABLE IF EXISTS "sihp"."komoditas_dijual";
