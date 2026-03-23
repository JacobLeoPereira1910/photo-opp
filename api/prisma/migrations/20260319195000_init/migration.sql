CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROMOTER');
CREATE TYPE "PhotoStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "photos" (
  "id" TEXT NOT NULL,
  "original_url" TEXT NOT NULL,
  "framed_url" TEXT NOT NULL,
  "download_url" TEXT NOT NULL,
  "qr_code_url" TEXT,
  "qr_code_value" TEXT,
  "status" "PhotoStatus" NOT NULL DEFAULT 'PROCESSING',
  "frame_name" TEXT,
  "metadata" JSONB,
  "promoter_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "logs" (
  "id" TEXT NOT NULL,
  "request_id" TEXT,
  "user_id" TEXT,
  "email_attempted" TEXT,
  "action" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "route" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "request_body" JSONB,
  "response_status" INTEGER NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "photos_promoter_id_idx" ON "photos"("promoter_id");
CREATE INDEX "photos_status_idx" ON "photos"("status");
CREATE INDEX "photos_created_at_idx" ON "photos"("created_at");
CREATE INDEX "logs_user_id_idx" ON "logs"("user_id");
CREATE INDEX "logs_action_idx" ON "logs"("action");
CREATE INDEX "logs_route_idx" ON "logs"("route");
CREATE INDEX "logs_created_at_idx" ON "logs"("created_at");

ALTER TABLE "photos"
ADD CONSTRAINT "photos_promoter_id_fkey"
FOREIGN KEY ("promoter_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "logs"
ADD CONSTRAINT "logs_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
