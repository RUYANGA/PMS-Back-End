-- CreateTable
CREATE TABLE "attachment" (
    "id" UUID NOT NULL,
    "project_id" UUID,
    "uploader_id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_type" TEXT,
    "file_size" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachment_project_id_idx" ON "attachment"("project_id");

-- CreateIndex
CREATE INDEX "attachment_uploader_id_idx" ON "attachment"("uploader_id");

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
