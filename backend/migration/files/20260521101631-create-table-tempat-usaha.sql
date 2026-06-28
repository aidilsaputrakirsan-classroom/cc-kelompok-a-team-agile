
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."tempat_usaha" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "id_pasar" uuid NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "pemilik" VARCHAR(255) NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL,
    CONSTRAINT "fk_tempat_usaha_pasar" FOREIGN KEY ("id_pasar") REFERENCES "sihp"."pasar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_tempat_usaha_nama" ON "sihp"."tempat_usaha" ("nama");

-- +migrate Down
DROP INDEX IF EXISTS "idx_tempat_usaha_nama";
DROP TABLE IF EXISTS "sihp"."tempat_usaha";