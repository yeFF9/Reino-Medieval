const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

async function CriarCastelo({ territorioId, capacidadeGuardas }) {
  const territorioExiste = await prisma.territorio.findUnique({
    where: { id: territorioId },
    include: { castelo: true },
  });

  if (!territorioExiste) {
    throw new HttpError(404, 'O território informado não foi encontrado');
  }

  if (territorioExiste.castelo) {
    throw new HttpError(409, 'Este território já possui um castelo construído');
  }

  return prisma.castelo.create({
    data: {
      territorioId,
      capacidadeGuardas,
      nivelMuralha: 1,
      integridade: 100.0,
    },
    include: { territorio: { select: { id: true, nome: true, reinoId: true } } },
  });
}

async function ObterDetalhesCastelo(id) {
  const castelo = await prisma.castelo.findUnique({
    where: { id },
    include: {
      territorio: {
        select: {
          id: true,
          nome: true,
          status: true,
          reino: { select: { id: true, nome: true } },
        },
      },
    },
  });

  if (!castelo) {
    throw new HttpError(404, 'Castelo ou fortaleza não encontrado');
  }

  return castelo;
}

async function MelhorarInfraestruturaCastelo(id, { reinoId }) {
  const castelo = await prisma.castelo.findUnique({
    where: { id },
    include: { territorio: { include: { reino: { include: { economia: true } } } } },
  });

  if (!castelo) {
    throw new HttpError(404, 'Castelo não encontrado');
  }

  const economia = castelo.territorio.reino?.economia;
  if (!economia) {
    throw new HttpError(400, 'O reino controlador deste castelo não possui economia registrada');
  }

  const custoOuro = castelo.nivelMuralha * 150;
  const custoFerro = castelo.nivelMuralha * 80;

  if (economia.ouro < custoOuro || economia.ferro < custoFerro) {
    throw new HttpError(400, `Recursos insuficientes no reino. Necessário: ${custoOuro} de Ouro e ${custoFerro} de Ferro.`);
  }

  return prisma.$transaction(async (tx) => {
    await tx.economia.update({
      where: { id: economia.id },
      data: {
        ouro: { decrement: custoOuro },
        ferro: { decrement: custoFerro },
      },
    });

    return tx.castelo.update({
      where: { id },
      data: {
        nivelMuralha: { increment: 1 },
        capacidadeGuardas: { increment: 50 }, 
      },
      include: { territorio: { select: { id: true, nome: true } } },
    });
  });
}

async function RepararEstruturaCastelo(id, { reinoId }) {
  const castelo = await prisma.castelo.findUnique({
    where: { id },
    include: { territorio: { include: { reino: { include: { economia: true } } } } },
  });

  if (!castelo) {
    throw new HttpError(404, 'Castelo não encontrado');
  }

  if (castelo.integridade >= 100) {
    throw new HttpError(400, 'A estrutura deste castelo já está com 100% de integridade');
  }

  const economia = castelo.territorio.reino?.economia;
  if (!economia) {
    throw new HttpError(400, 'O reino controlador não possui economia registrada');
  }

  const custoReparoOuro = 50;
  if (economia.ouro < custoReparoOuro) {
    throw new HttpError(400, 'Ouro insuficiente no reino para realizar os reparos');
  }

  return prisma.$transaction(async (tx) => {
    await tx.economia.update({
      where: { id: economia.id },
      data: { ouro: { decrement: custoReparoOuro } },
    });

    return tx.castelo.update({
      where: { id },
      data: { integridade: 100.0 },
      include: { territorio: { select: { id: true, nome: true } } },
    });
  });
}

module.exports = {
  CriarCastelo,
  ObterDetalhesCastelo,
  MelhorarInfraestruturaCastelo,
  RepararEstruturaCastelo,
};