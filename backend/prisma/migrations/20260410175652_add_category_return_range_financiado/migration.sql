-- AlterEnum
ALTER TYPE "ProjectStatus" ADD VALUE 'financiado';

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "category" VARCHAR(80),
ADD COLUMN     "estimated_return_max_pct" DECIMAL(5,2),
ADD COLUMN     "estimated_return_min_pct" DECIMAL(5,2);
