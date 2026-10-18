const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');
const guerraService = require('./guerra-service');

async function createPact({ reinoAId, reinoBId, tipo }) {
  return guerraService.createDiplomaticAgreement({ reinoAId, reinoBId, tipo });
}

async function listPacts(reinoId, query) {
  const reino = await prisma.reino.findUnique({ where: { id: reinoId } });
  if (!reino) throw new HttpError(404, 'Reino não encontrado');
  const where = {
    OR: [{ reinoAId: reinoId }, { reinoBId: reinoId }],
    ...(query.status ? { status: query.status } : {}),
    ...(query.tipo ? { tipo: query.tipo } : {}),
  };
  return paginatedResult(prisma.diplomacia, where, query, {
    reinoA: { select: { id: true, nome: true } },
    reinoB: { select: { id: true, nome: true } },
  });
}

async function breakPact(id, { reinoId } = {}) {
  const penalty = Number(process.env.DIPLOMACY_BREAK_PENALTY_OURO || 50);
  return prisma.$transaction(async (tx) => {
    const pact = await tx.diplomacia.findUnique({ where: { id } });
    if (!pact) throw new HttpError(404, 'Pacto não encontrado');
    if (pact.status === 'ENCERRADA') throw new HttpError(409, 'O pacto já está encerrado');

    if (reinoId) {
      if (![pact.reinoAId, pact.reinoBId].includes(reinoId)) {
        throw new HttpError(422, 'O reino informado não faz parte deste pacto');
      }
      const updated = await tx.economia.updateMany({
        where: { reinoId, ouro: { gte: penalty } },
        data: { ouro: { decrement: penalty } },
      });
      if (updated.count !== 1) {
        throw new HttpError(422, 'Ouro insuficiente para arcar com a penalização do rompimento');
      }
    }

    return tx.diplomacia.update({
      where: { id },
      data: { status: 'ENCERRADA', encerradaEm: new Date() },
    });
  });
}

async function sendTribute({ reinoOrigemId, reinoDestinoId, tipo, ouro, alimentos, ferro }) {
  const kingdoms = await prisma.reino.count({ where: { id: { in: [reinoOrigemId, reinoDestinoId] } } });
  if (kingdoms !== 2) throw new HttpError(404, 'Um ou ambos os reinos não foram encontrados');

  try {
    return await prisma.$transaction(async (tx) => {
      const debit = await tx.economia.updateMany({
        where: {
          reinoId: reinoOrigemId,
          ouro: { gte: ouro },
          alimentos: { gte: alimentos },
          ferro: { gte: ferro },
        },
        data: {
          ouro: { decrement: ouro },
          alimentos: { decrement: alimentos },
          ferro: { decrement: ferro },
        },
      });
      if (debit.count !== 1) {
        throw new HttpError(422, 'O reino de origem não possui recursos suficientes para o tributo');
      }
      await tx.economia.upsert({
        where: { reinoId: reinoDestinoId },
        update: {
          ouro: { increment: ouro },
          alimentos: { increment: alimentos },
          ferro: { increment: ferro },
        },
        create: { reinoId: reinoDestinoId, ouro, alimentos, ferro },
      });
      return tx.tributo.create({
        data: { reinoOrigemId, reinoDestinoId, tipo, ouro, alimentos, ferro },
        include: {
          reinoOrigem: { select: { id: true, nome: true } },
          reinoDestino: { select: { id: true, nome: true } },
        },
      });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao enviar o tributo; tente novamente');
    throw error;
  }
}

module.exports = { createPact, listPacts, breakPact, sendTribute };
