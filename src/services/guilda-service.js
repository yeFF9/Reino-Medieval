const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

// Custo unitário de cada tipo de encomenda, em ouro e ferro.
const ITEM_COSTS = {
  ARMAS: { ouro: 20, ferro: 10 },
  ARMADURAS: { ouro: 30, ferro: 25 },
  MATERIAIS_CONSTRUCAO: { ouro: 10, ferro: 5 },
};

async function create(data) {
  const { membros, ...guild } = data;
  const reino = await prisma.reino.findUnique({ where: { id: guild.reinoId } });
  if (!reino) throw new HttpError(404, 'Reino não encontrado');
  try {
    return await prisma.guilda.create({
      data: {
        ...guild,
        ...(membros && membros.length ? { membros: { create: membros } } : {}),
      },
      include: {
        membros: true,
        reino: { select: { id: true, nome: true } },
      },
    });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Já existe uma guilda com este nome');
    throw error;
  }
}

async function getById(id) {
  const guilda = await prisma.guilda.findUnique({
    where: { id },
    include: {
      reino: { select: { id: true, nome: true } },
      encomendas: true,
    },
  });
  if (!guilda) throw new HttpError(404, 'Guilda não encontrada');
  return guilda;
}

async function listMembers(id, query) {
  const guilda = await prisma.guilda.findUnique({ where: { id } });
  if (!guilda) throw new HttpError(404, 'Guilda não encontrada');
  return paginatedResult(prisma.guildaMembro, { guildaId: id }, query);
}

async function createOrder(id, { item, quantidade }) {
  const guilda = await prisma.guilda.findUnique({ where: { id } });
  if (!guilda) throw new HttpError(404, 'Guilda não encontrada');
  const base = ITEM_COSTS[item];
  const custoOuro = base.ouro * quantidade;
  const custoFerro = base.ferro * quantidade;

  try {
    return await prisma.$transaction(async (tx) => {
      const debit = await tx.economia.updateMany({
        where: { reinoId: guilda.reinoId, ouro: { gte: custoOuro }, ferro: { gte: custoFerro } },
        data: { ouro: { decrement: custoOuro }, ferro: { decrement: custoFerro } },
      });
      if (debit.count !== 1) {
        throw new HttpError(422, 'O reino da guilda não possui recursos suficientes para a encomenda');
      }
      return tx.encomenda.create({
        data: { guildaId: id, item, quantidade, custoOuro, custoFerro },
        include: { guilda: { select: { id: true, nome: true, reinoId: true } } },
      });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao registrar a encomenda; tente novamente');
    throw error;
  }
}

module.exports = { create, getById, listMembers, createOrder };
