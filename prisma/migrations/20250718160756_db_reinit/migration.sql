-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('STUDENT', 'STAFF', 'INDIVIDUAL', 'ORGANISATION');

-- CreateEnum
CREATE TYPE "StakeholderRole" AS ENUM ('OWNER', 'PARTNER', 'SPONSOR', 'REGULATOR', 'BENEFICIARY');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FUNDED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IpType" AS ENUM ('PATENT', 'UTILITY_MODEL', 'COPYRIGHT', 'TRADEMARK', 'NONE');

-- CreateEnum
CREATE TYPE "AuthorRole" AS ENUM ('LEAD', 'CO_AUTHOR', 'SUPERVISOR');

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_unit" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position" (
    "id" UUID NOT NULL,
    "organisation_unit_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "username" TEXT,
    "user_type" "UserType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organisation_unit_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_position" (
    "user_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_position_pkey" PRIMARY KEY ("user_id","position_id","start_date")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "funder" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "funder_type" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholder" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "stakeholder_type" TEXT NOT NULL,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "organisation_unit_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholder_user" (
    "stakeholder_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "StakeholderRole" NOT NULL DEFAULT 'BENEFICIARY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholder_user_pkey" PRIMARY KEY ("stakeholder_id","user_id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "title_norm" TEXT NOT NULL,
    "abstract" TEXT,
    "project_type" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "innovation_field" TEXT,
    "expected_ip" "IpType",
    "progress_percent" DECIMAL(5,2),
    "organisation_unit_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_author" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "AuthorRole" NOT NULL DEFAULT 'CO_AUTHOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_report" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "reporting_period" TEXT,
    "content" TEXT,
    "fund_usage" DECIMAL(12,2),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_category" (
    "project_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_category_pkey" PRIMARY KEY ("project_id","category_id")
);

-- CreateTable
CREATE TABLE "project_funder" (
    "project_id" UUID NOT NULL,
    "funder_id" UUID NOT NULL,
    "amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_funder_pkey" PRIMARY KEY ("project_id","funder_id")
);

-- CreateTable
CREATE TABLE "project_stakeholder" (
    "project_id" UUID NOT NULL,
    "stakeholder_id" UUID NOT NULL,
    "role" "StakeholderRole" NOT NULL DEFAULT 'BENEFICIARY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_stakeholder_pkey" PRIMARY KEY ("project_id","stakeholder_id")
);

-- CreateIndex
CREATE INDEX "category_parent_id_idx" ON "category"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_parent_id_name_key" ON "category"("parent_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_unit_code_key" ON "organisation_unit"("code");

-- CreateIndex
CREATE INDEX "organisation_unit_parent_id_idx" ON "organisation_unit"("parent_id");

-- CreateIndex
CREATE INDEX "position_organisation_unit_id_idx" ON "position"("organisation_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE INDEX "role_organisation_unit_id_idx" ON "role"("organisation_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_organisation_unit_id_name_key" ON "role"("organisation_unit_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE INDEX "user_position_user_id_idx" ON "user_position"("user_id");

-- CreateIndex
CREATE INDEX "user_position_position_id_idx" ON "user_position"("position_id");

-- CreateIndex
CREATE INDEX "user_role_user_id_idx" ON "user_role"("user_id");

-- CreateIndex
CREATE INDEX "user_role_role_id_idx" ON "user_role"("role_id");

-- CreateIndex
CREATE INDEX "role_permission_role_id_idx" ON "role_permission"("role_id");

-- CreateIndex
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "funder_name_key" ON "funder"("name");

-- CreateIndex
CREATE INDEX "stakeholder_organisation_unit_id_idx" ON "stakeholder"("organisation_unit_id");

-- CreateIndex
CREATE INDEX "stakeholder_user_stakeholder_id_idx" ON "stakeholder_user"("stakeholder_id");

-- CreateIndex
CREATE INDEX "stakeholder_user_user_id_idx" ON "stakeholder_user"("user_id");

-- CreateIndex
CREATE INDEX "project_organisation_unit_id_idx" ON "project"("organisation_unit_id");

-- CreateIndex
CREATE INDEX "project_status_idx" ON "project"("status");

-- CreateIndex
CREATE INDEX "project_year_idx" ON "project"("year");

-- CreateIndex
CREATE INDEX "project_author_project_id_idx" ON "project_author"("project_id");

-- CreateIndex
CREATE INDEX "project_author_user_id_idx" ON "project_author"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_author_project_id_user_id_key" ON "project_author"("project_id", "user_id");

-- CreateIndex
CREATE INDEX "project_report_project_id_idx" ON "project_report"("project_id");

-- CreateIndex
CREATE INDEX "project_report_submitted_by_id_idx" ON "project_report"("submitted_by_id");

-- CreateIndex
CREATE INDEX "project_category_project_id_idx" ON "project_category"("project_id");

-- CreateIndex
CREATE INDEX "project_category_category_id_idx" ON "project_category"("category_id");

-- CreateIndex
CREATE INDEX "project_funder_project_id_idx" ON "project_funder"("project_id");

-- CreateIndex
CREATE INDEX "project_funder_funder_id_idx" ON "project_funder"("funder_id");

-- CreateIndex
CREATE INDEX "project_stakeholder_project_id_idx" ON "project_stakeholder"("project_id");

-- CreateIndex
CREATE INDEX "project_stakeholder_stakeholder_id_idx" ON "project_stakeholder"("stakeholder_id");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_unit" ADD CONSTRAINT "organisation_unit_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "organisation_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_organisation_unit_id_fkey" FOREIGN KEY ("organisation_unit_id") REFERENCES "organisation_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_organisation_unit_id_fkey" FOREIGN KEY ("organisation_unit_id") REFERENCES "organisation_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_position" ADD CONSTRAINT "user_position_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_position" ADD CONSTRAINT "user_position_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder" ADD CONSTRAINT "stakeholder_organisation_unit_id_fkey" FOREIGN KEY ("organisation_unit_id") REFERENCES "organisation_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_user" ADD CONSTRAINT "stakeholder_user_stakeholder_id_fkey" FOREIGN KEY ("stakeholder_id") REFERENCES "stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholder_user" ADD CONSTRAINT "stakeholder_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project" ADD CONSTRAINT "project_organisation_unit_id_fkey" FOREIGN KEY ("organisation_unit_id") REFERENCES "organisation_unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_author" ADD CONSTRAINT "project_author_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_author" ADD CONSTRAINT "project_author_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_report" ADD CONSTRAINT "project_report_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_report" ADD CONSTRAINT "project_report_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_category" ADD CONSTRAINT "project_category_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_category" ADD CONSTRAINT "project_category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_funder" ADD CONSTRAINT "project_funder_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_funder" ADD CONSTRAINT "project_funder_funder_id_fkey" FOREIGN KEY ("funder_id") REFERENCES "funder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_stakeholder" ADD CONSTRAINT "project_stakeholder_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_stakeholder" ADD CONSTRAINT "project_stakeholder_stakeholder_id_fkey" FOREIGN KEY ("stakeholder_id") REFERENCES "stakeholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
