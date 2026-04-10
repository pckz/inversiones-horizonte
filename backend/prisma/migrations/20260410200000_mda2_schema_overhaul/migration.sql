-- MDA2: Schema overhaul

-- 1. Add readonly_admin to UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'readonly_admin';

-- 2. Add is_verified to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" BOOLEAN NOT NULL DEFAULT false;

-- 3. Migrate existing draft/pausado projects before removing enum values
UPDATE "projects" SET "status" = 'por_financiarse' WHERE "status" = 'draft';
UPDATE "projects" SET "status" = 'terminado' WHERE "status" = 'pausado';

-- 4. Remove draft and pausado from ProjectStatus
-- PostgreSQL doesn't support DROP VALUE from enum, so we recreate
CREATE TYPE "ProjectStatus_new" AS ENUM ('por_financiarse', 'financiado', 'en_ejecucion', 'terminado');
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
DROP TYPE "ProjectStatus";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'por_financiarse';

-- 5. Project: remove estimated_profitability_text and progress_pct
ALTER TABLE "projects" DROP COLUMN IF EXISTS "estimated_profitability_text";
ALTER TABLE "projects" DROP COLUMN IF EXISTS "progress_pct";

-- 6. Project: add start_date and cover_video_url
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "start_date" DATE;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "cover_video_url" TEXT;

-- 7. ProjectUpdate: remove progress_pct
ALTER TABLE "project_updates" DROP COLUMN IF EXISTS "progress_pct";

-- 8. ProjectDocument: add sort_order
ALTER TABLE "project_documents" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;

-- 9. Add signed to InvestmentStatus
-- Recreate enum to ensure order
CREATE TYPE "InvestmentStatus_new" AS ENUM ('pending', 'transfer_pending', 'transfer_review', 'signed', 'active', 'completed', 'cancelled');
ALTER TABLE "investments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "investments" ALTER COLUMN "status" TYPE "InvestmentStatus_new" USING ("status"::text::"InvestmentStatus_new");
DROP TYPE "InvestmentStatus";
ALTER TYPE "InvestmentStatus_new" RENAME TO "InvestmentStatus";
ALTER TABLE "investments" ALTER COLUMN "status" SET DEFAULT 'pending';

-- 10. Create project_posts table
CREATE TABLE IF NOT EXISTS "project_posts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(280) NOT NULL,
    "body" TEXT NOT NULL,
    "cover_image" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "sent_by_email" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_posts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_posts_project_id_slug_key" ON "project_posts"("project_id", "slug");

ALTER TABLE "project_posts" ADD CONSTRAINT "project_posts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
