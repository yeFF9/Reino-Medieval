-- AlterTable
ALTER TABLE "Comandante" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Exercito" ADD COLUMN "custoManutencao" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Diplomacia" ADD COLUMN "encerradaEm" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Patrulha" (
    "id" UUID NOT NULL,
    "cidadeId" UUID NOT NULL,
    "contingente" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Patrulha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guilda" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "oficio" TEXT NOT NULL,
    "reinoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Guilda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildaMembro" (
    "id" UUID NOT NULL,
    "guildaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuildaMembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Encomenda" (
    "id" UUID NOT NULL,
    "guildaId" UUID NOT NULL,
    "item" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "custoOuro" DOUBLE PRECISION NOT NULL,
    "custoFerro" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Encomenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tributo" (
    "id" UUID NOT NULL,
    "reinoOrigemId" UUID NOT NULL,
    "reinoDestinoId" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "ouro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "alimentos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ferro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ENVIADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tributo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Patrulha_cidadeId_idx" ON "Patrulha"("cidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "Guilda_nome_key" ON "Guilda"("nome");

-- CreateIndex
CREATE INDEX "Guilda_reinoId_oficio_idx" ON "Guilda"("reinoId", "oficio");

-- CreateIndex
CREATE INDEX "GuildaMembro_guildaId_idx" ON "GuildaMembro"("guildaId");

-- CreateIndex
CREATE INDEX "Encomenda_guildaId_status_idx" ON "Encomenda"("guildaId", "status");

-- CreateIndex
CREATE INDEX "Tributo_reinoOrigemId_status_idx" ON "Tributo"("reinoOrigemId", "status");

-- CreateIndex
CREATE INDEX "Tributo_reinoDestinoId_idx" ON "Tributo"("reinoDestinoId");

-- AddForeignKey
ALTER TABLE "Patrulha" ADD CONSTRAINT "Patrulha_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guilda" ADD CONSTRAINT "Guilda_reinoId_fkey" FOREIGN KEY ("reinoId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildaMembro" ADD CONSTRAINT "GuildaMembro_guildaId_fkey" FOREIGN KEY ("guildaId") REFERENCES "Guilda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Encomenda" ADD CONSTRAINT "Encomenda_guildaId_fkey" FOREIGN KEY ("guildaId") REFERENCES "Guilda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tributo" ADD CONSTRAINT "Tributo_reinoOrigemId_fkey" FOREIGN KEY ("reinoOrigemId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tributo" ADD CONSTRAINT "Tributo_reinoDestinoId_fkey" FOREIGN KEY ("reinoDestinoId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
