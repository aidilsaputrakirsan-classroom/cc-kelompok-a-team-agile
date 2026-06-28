
-- +migrate Up
ALTER TABLE "sihp"."pasar" ADD COLUMN "latitude" DOUBLE PRECISION;
ALTER TABLE "sihp"."pasar" ADD COLUMN "longitude" DOUBLE PRECISION;
-- +migrate Down
ALTER TABLE "sihp"."pasar" DROP COLUMN "latitude";
ALTER TABLE "sihp"."pasar" DROP COLUMN "longitude";