const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

const MINIMUM_COMMANDER_RANK = 3;

async function list(query) {
  const where = {
    ...(query.nome ? { nome: { contains: query.nome, mode: 'insensitive' } } : {}),
    ...(query.reinoId ? { reinoId: query.reinoId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
  return paginatedResult(prisma.exercito, where, query, {
    reino: { select: { id: true, nome: true } },
    comandante: { select: { id: true, nome: true, patente: true, nivelPatente: true } },
  });
}

async function create(data) {
  const [reino, territory, commander] = await Promise.all([
    prisma.reino.findUnique({ where: { id: data.reinoId } }),
    prisma.territorio.findUnique({ where: { id: data.territorioId } }),
    prisma.comandante.findUnique({ where: { id: data.comandanteId } }),
  ]);
  if (!reino) throw new HttpError(404, 'Reino não encontrado');
  if (!territory) throw new HttpError(404, 'Território não encontrado');
  if (!commander) throw new HttpError(404, 'Comandante não encontrado');
  if (territory.reinoId !== data.reinoId) throw new HttpError(422, 'O exército deve ser estacionado em território do seu reino');
  if (commander.nivelPatente < MINIMUM_COMMANDER_RANK) {
    throw new HttpError(422, `O comandante precisa ter patente de nível ${MINIMUM_COMMANDER_RANK} ou superior`);
  }
  return prisma.exercito.create({ data, include: { reino: true, comandante: true } });
}

async function mobilize(id) {
  const min = {
    ouro: Number(process.env.MIN_ARMY_GOLD || 100),
    alimentos: Number(process.env.MIN_ARMY_FOOD || 50),
    ferro: Number(process.env.MIN_ARMY_IRON || 25),
  };
  try {
    return await prisma.$transaction(async (tx) => {
      const army = await tx.exercito.findUnique({ where: { id } });
      if (!army) throw new HttpError(404, 'Exército não encontrado');
      if (army.status === 'MOBILIZADO') throw new HttpError(409, 'O exército já está mobilizado');
      const economy = await tx.economia.findUnique({ where: { reinoId: army.reinoId } });
      if (!economy || economy.ouro < min.ouro || economy.alimentos < min.alimentos || economy.ferro < min.ferro) {
        throw new HttpError(422, 'Recursos insuficientes para mobilizar este exército');
      }
      const updated = await tx.economia.updateMany({
        where: { reinoId: army.reinoId, ouro: { gte: min.ouro }, alimentos: { gte: min.alimentos }, ferro: { gte: min.ferro } },
        data: { ouro: { decrement: min.ouro }, alimentos: { decrement: min.alimentos }, ferro: { decrement: min.ferro } },
      });
      if (updated.count !== 1) throw new HttpError(409, 'Os recursos do reino foram alterados; tente novamente');
      return tx.exercito.update({ where: { id }, data: { status: 'MOBILIZADO' } });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao mobilizar o exército; tente novamente');
    throw error;
  }
}

module.exports = { list, create, mobilize };
