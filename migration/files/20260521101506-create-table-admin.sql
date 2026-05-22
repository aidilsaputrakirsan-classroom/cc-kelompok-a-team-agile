
-- +migrate Up
CREATE TABLE IF NOT EXISTS "sihp"."admin" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" timestamptz NULL
);

CREATE INDEX IF NOT EXISTS "idx_admin_email" ON "sihp"."admin" ("email");
-- +migrate Down
DROP INDEX IF EXISTS "idx_admin_email";
DROP TABLE IF EXISTS "sihp"."admin";