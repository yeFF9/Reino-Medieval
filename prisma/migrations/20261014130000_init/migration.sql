CREATE TYPE "StatusGuerra" AS ENUM ('EM_ANDAMENTO', 'FINALIZADA');
CREATE TYPE "StatusExercito" AS ENUM ('DISPONIVEL', 'MOBILIZADO');
CREATE TYPE "StatusDiplomacia" AS ENUM ('ATIVA', 'ENCERRADA');

CREATE TABLE "Usuario" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senhaHash" TEXT NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Papel" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  CONSTRAINT "Papel_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Permissao" (
  "id" UUID NOT NULL,
  "codigo" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  CONSTRAINT "Permissao_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "UsuarioPapel" (
  "usuarioId" UUID NOT NULL,
  "papelId" UUID NOT NULL,
  CONSTRAINT "UsuarioPapel_pkey" PRIMARY KEY ("usuarioId", "papelId")
);
CREATE TABLE "PapelPermissao" (
  "papelId" UUID NOT NULL,
  "permissaoId" UUID NOT NULL,
  CONSTRAINT "PapelPermissao_pkey" PRIMARY KEY ("papelId", "permissaoId")
);
CREATE TABLE "Reino" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "formaGoverno" TEXT NOT NULL DEFAULT 'Monarquia',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Reino_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Economia" (
  "id" UUID NOT NULL,
  "reinoId" UUID NOT NULL,
  "ouro" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "alimentos" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ferro" DOUBLE PRECISION NOT NULL DEFAULT 0,
  CONSTRAINT "Economia_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Territorio" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT,
  "status" TEXT NOT NULL DEFAULT 'CONTROLADO',
  "reinoId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Territorio_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Cidade" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "territorioId" UUID NOT NULL,
  "populacao" INTEGER NOT NULL,
  "estoqueAlimentos" DOUBLE PRECISION NOT NULL,
  "producaoAgricola" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Cidade_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Comandante" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "patente" TEXT NOT NULL,
  "nivelPatente" INTEGER NOT NULL,
  CONSTRAINT "Comandante_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Exercito" (
  "id" UUID NOT NULL,
  "nome" TEXT NOT NULL,
  "reinoId" UUID NOT NULL,
  "territorioId" UUID NOT NULL,
  "comandanteId" UUID NOT NULL,
  "efetivo" INTEGER NOT NULL,
  "status" "StatusExercito" NOT NULL DEFAULT 'DISPONIVEL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Exercito_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Guerra" (
  "id" UUID NOT NULL,
  "reinoAtacanteId" UUID NOT NULL,
  "reinoDefensorId" UUID NOT NULL,
  "territorioId" UUID NOT NULL,
  "status" "StatusGuerra" NOT NULL DEFAULT 'EM_ANDAMENTO',
  "vencedorId" UUID,
  "declaradaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finalizadaEm" TIMESTAMP(3),
  CONSTRAINT "Guerra_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Diplomacia" (
  "id" UUID NOT NULL,
  "reinoAId" UUID NOT NULL,
  "reinoBId" UUID NOT NULL,
  "tipo" TEXT NOT NULL,
  "status" "StatusDiplomacia" NOT NULL DEFAULT 'ATIVA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Diplomacia_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Imposto" (
  "id" UUID NOT NULL,
  "territorioId" UUID,
  "cidadeId" UUID,
  "periodoFiscal" TEXT NOT NULL,
  "valor" DOUBLE PRECISION NOT NULL,
  "aplicadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Imposto_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Castelo" (
  "id" UUID NOT NULL,
  "territorioId" UUID NOT NULL,
  "capacidadeGuardas" INTEGER NOT NULL,
  "guardasAtuais" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Castelo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Papel_nome_key" ON "Papel"("nome");
CREATE UNIQUE INDEX "Permissao_codigo_key" ON "Permissao"("codigo");
CREATE UNIQUE INDEX "Reino_nome_key" ON "Reino"("nome");
CREATE UNIQUE INDEX "Economia_reinoId_key" ON "Economia"("reinoId");
CREATE UNIQUE INDEX "Territorio_nome_key" ON "Territorio"("nome");
CREATE UNIQUE INDEX "Cidade_nome_key" ON "Cidade"("nome");
CREATE INDEX "Cidade_territorioId_idx" ON "Cidade"("territorioId");
CREATE INDEX "Exercito_reinoId_status_idx" ON "Exercito"("reinoId", "status");
CREATE INDEX "Guerra_status_declaradaEm_idx" ON "Guerra"("status", "declaradaEm");
CREATE UNIQUE INDEX "Diplomacia_reinoAId_reinoBId_tipo_key" ON "Diplomacia"("reinoAId", "reinoBId", "tipo");
CREATE INDEX "Diplomacia_status_tipo_idx" ON "Diplomacia"("status", "tipo");
CREATE UNIQUE INDEX "Imposto_territorioId_periodoFiscal_key" ON "Imposto"("territorioId", "periodoFiscal");
CREATE UNIQUE INDEX "Imposto_cidadeId_periodoFiscal_key" ON "Imposto"("cidadeId", "periodoFiscal");
CREATE UNIQUE INDEX "Castelo_territorioId_key" ON "Castelo"("territorioId");

ALTER TABLE "UsuarioPapel" ADD CONSTRAINT "UsuarioPapel_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsuarioPapel" ADD CONSTRAINT "UsuarioPapel_papelId_fkey" FOREIGN KEY ("papelId") REFERENCES "Papel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PapelPermissao" ADD CONSTRAINT "PapelPermissao_papelId_fkey" FOREIGN KEY ("papelId") REFERENCES "Papel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PapelPermissao" ADD CONSTRAINT "PapelPermissao_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "Permissao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Economia" ADD CONSTRAINT "Economia_reinoId_fkey" FOREIGN KEY ("reinoId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Territorio" ADD CONSTRAINT "Territorio_reinoId_fkey" FOREIGN KEY ("reinoId") REFERENCES "Reino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Cidade" ADD CONSTRAINT "Cidade_territorioId_fkey" FOREIGN KEY ("territorioId") REFERENCES "Territorio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Exercito" ADD CONSTRAINT "Exercito_reinoId_fkey" FOREIGN KEY ("reinoId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Exercito" ADD CONSTRAINT "Exercito_territorioId_fkey" FOREIGN KEY ("territorioId") REFERENCES "Territorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercito" ADD CONSTRAINT "Exercito_comandanteId_fkey" FOREIGN KEY ("comandanteId") REFERENCES "Comandante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Guerra" ADD CONSTRAINT "Guerra_reinoAtacanteId_fkey" FOREIGN KEY ("reinoAtacanteId") REFERENCES "Reino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Guerra" ADD CONSTRAINT "Guerra_reinoDefensorId_fkey" FOREIGN KEY ("reinoDefensorId") REFERENCES "Reino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Guerra" ADD CONSTRAINT "Guerra_territorioId_fkey" FOREIGN KEY ("territorioId") REFERENCES "Territorio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Guerra" ADD CONSTRAINT "Guerra_vencedorId_fkey" FOREIGN KEY ("vencedorId") REFERENCES "Reino"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Diplomacia" ADD CONSTRAINT "Diplomacia_reinoAId_fkey" FOREIGN KEY ("reinoAId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Diplomacia" ADD CONSTRAINT "Diplomacia_reinoBId_fkey" FOREIGN KEY ("reinoBId") REFERENCES "Reino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Imposto" ADD CONSTRAINT "Imposto_territorioId_fkey" FOREIGN KEY ("territorioId") REFERENCES "Territorio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Imposto" ADD CONSTRAINT "Imposto_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "Cidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Castelo" ADD CONSTRAINT "Castelo_territorioId_fkey" FOREIGN KEY ("territorioId") REFERENCES "Territorio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
