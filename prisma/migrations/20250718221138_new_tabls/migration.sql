-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "sdg" (
    "id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sdg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_sdg" (
    "project_id" UUID NOT NULL,
    "sdg_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_sdg_pkey" PRIMARY KEY ("project_id","sdg_id")
);

-- CreateTable
CREATE TABLE "startup" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "registered" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_evaluation" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "evaluator_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "comments" TEXT,
    "status" "EvaluationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sdg_number_key" ON "sdg"("number");

-- CreateIndex
CREATE INDEX "sdg_number_idx" ON "sdg"("number");

-- CreateIndex
CREATE INDEX "project_sdg_project_id_idx" ON "project_sdg"("project_id");

-- CreateIndex
CREATE INDEX "project_sdg_sdg_id_idx" ON "project_sdg"("sdg_id");

-- CreateIndex
CREATE UNIQUE INDEX "startup_project_id_key" ON "startup"("project_id");

-- CreateIndex
CREATE INDEX "startup_project_id_idx" ON "startup"("project_id");

-- CreateIndex
CREATE INDEX "project_evaluation_project_id_idx" ON "project_evaluation"("project_id");

-- CreateIndex
CREATE INDEX "project_evaluation_evaluator_id_idx" ON "project_evaluation"("evaluator_id");

-- AddForeignKey
ALTER TABLE "project_sdg" ADD CONSTRAINT "project_sdg_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_sdg" ADD CONSTRAINT "project_sdg_sdg_id_fkey" FOREIGN KEY ("sdg_id") REFERENCES "sdg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "startup" ADD CONSTRAINT "startup_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_evaluation" ADD CONSTRAINT "project_evaluation_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_evaluation" ADD CONSTRAINT "project_evaluation_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
