UPDATE "investments"
SET "status" = 'transfer_pending'
WHERE "status" = 'pending';

ALTER TABLE "investments"
ALTER COLUMN "status" SET DEFAULT 'transfer_pending';
