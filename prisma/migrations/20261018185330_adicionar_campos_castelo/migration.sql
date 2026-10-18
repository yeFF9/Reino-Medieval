-- CreateEnum
CREATE TYPE "StatusLei" AS ENUM ('ATIVA', 'REVOGADA');

-- AlterTable
ALTER TABLE "Castelo" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "integridade" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
ADD COLUMN     "nivelMuralha" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Lei" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "StatusLei" NOT NULL DEFAULT 'ATIVA',
    "reinoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lei_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lei_reinoId_titulo_key" ON "Lei"("reinoId", "titulo");

-- AddForeignKey
ALTER TABLE "Lei" ADD CONSTRAINT "Lei_reinoId_fkey" FOREIGN KEY ("reinoId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
