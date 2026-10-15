const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

async function declare({ reinoAtacanteId, reinoDefensorId, territorioId }) {
  const [attacker, defender, territory] = await Promise.all([
    prisma.reino.findUnique({ where: { id: reinoAtacanteId } }),
    prisma.reino.findUnique({ where: { id: reinoDefensorId } }),
    prisma.territorio.findUnique({ where: { id: territorioId } }),
  ]);
  if (!attacker || !defender) throw new HttpError(404, 'Reino atacante ou defensor não encontrado');
  if (!territory) throw new HttpError(404, 'Território disputado não encontrado');
  if (territory.reinoId !== reinoDefensorId) {
    throw new HttpError(422, 'O território disputado deve estar sob controle do reino defensor');
  }

  const pact = await prisma.diplomacia.findFirst({
    where: {
      status: 'ATIVA',
      tipo: { in: ['ALIANCA', 'PACTO_NAO_AGRESSAO'] },
      OR: [
        { reinoAId: reinoAtacanteId, reinoBId: reinoDefensorId },
        { reinoAId: reinoDefensorId, reinoBId: reinoAtacanteId },
      ],
    },
  });
  if (pact) throw new HttpError(409, 'Não é permitido declarar guerra contra um reino aliado');

  return prisma.guerra.create({ data: { reinoAtacanteId, reinoDefensorId, territorioId } });
}

async function history(query) {
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.reinoId ? { OR: [{ reinoAtacanteId: query.reinoId }, { reinoDefensorId: query.reinoId }] } : {}),
  };
  return paginatedResult(prisma.guerra, where, query, {
    atacante: { select: { id: true, nome: true } },
    defensor: { select: { id: true, nome: true } },
    territorio: { select: { id: true, nome: true } },
    vencedor: { select: { id: true, nome: true } },
  });
}

async function finalize({ guerraId, vencedorId }) {
  return prisma.$transaction(async (tx) => {
    const war = await tx.guerra.findUnique({ where: { id: guerraId } });
    if (!war) throw new HttpError(404, 'Guerra não encontrada');
    if (war.status === 'FINALIZADA') throw new HttpError(409, 'A guerra já foi finalizada');
    if (![war.reinoAtacanteId, war.reinoDefensorId].includes(vencedorId)) {
      throw new HttpError(422, 'O vencedor deve ser um dos reinos em guerra');
    }
    await tx.territorio.update({ where: { id: war.territorioId }, data: { reinoId: vencedorId, status: 'CONTROLADO' } });
    return tx.guerra.update({
      where: { id: guerraId },
      data: { vencedorId, status: 'FINALIZADA', finalizadaEm: new Date() },
    });
  });
}

async function createDiplomaticAgreement({ reinoAId, reinoBId, tipo }) {
  if (reinoAId === reinoBId) throw new HttpError(422, 'Um reino não pode firmar acordo consigo mesmo');
  const kingdoms = await prisma.reino.count({ where: { id: { in: [reinoAId, reinoBId] } } });
  if (kingdoms !== 2) throw new HttpError(404, 'Um ou ambos os reinos não foram encontrados');
  const activeWar = await prisma.guerra.findFirst({
    where: {
      status: 'EM_ANDAMENTO',
      OR: [
        { reinoAtacanteId: reinoAId, reinoDefensorId: reinoBId },
        { reinoAtacanteId: reinoBId, reinoDefensorId: reinoAId },
      ],
    },
  });
  if (activeWar) throw new HttpError(409, 'Reinos em guerra direta não podem firmar acordos diplomáticos ou comerciais');
  const [first, second] = [reinoAId, reinoBId].sort();
  try {
    return await prisma.diplomacia.create({ data: { reinoAId: first, reinoBId: second, tipo } });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Este acordo diplomático já está registrado');
    throw error;
  }
}

module.exports = { declare, history, finalize, createDiplomaticAgreement };
