-- CreateEnum
CREATE TYPE "StatusPatrulha" AS ENUM ('ATIVA', 'ENCERRADA');

-- AlterTable
ALTER TABLE "Patrulha" ADD COLUMN "status" "StatusPatrulha" NOT NULL DEFAULT 'ATIVA',
ADD COLUMN "encerradaEm" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Patrulha_status_idx" ON "Patrulha"("status");
