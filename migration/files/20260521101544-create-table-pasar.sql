
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."pasar" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nama" VARCHAR(255) NOT NULL,
    "alamat" TEXT NULL,
    "status" SMALLINT NOT NULL DEFAULT 1,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL
);

CREATE INDEX IF NOT EXISTS "idx_pasar_nama" ON "sihp"."pasar" ("nama");

-- +migrate Down
DROP INDEX IF EXISTS "idx_pasar_nama";
DROP TABLE IF EXISTS "sihp"."pasar";
