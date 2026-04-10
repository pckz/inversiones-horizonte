CREATE TABLE IF NOT EXISTS "post_attachments" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" VARCHAR(80) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_attachments_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "post_attachments" ADD CONSTRAINT "post_attachments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "project_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
