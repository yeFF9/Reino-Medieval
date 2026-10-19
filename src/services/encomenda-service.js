const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

const UNITS_PER_ARTISAN = Number(process.env.UNITS_PER_ARTISAN || 10);
const CANCEL_REFUND_RATE = Number(process.env.ORDER_CANCEL_REFUND_RATE || 0.8);

// Cada artesão da guilda consegue produzir até UNITS_PER_ARTISAN unidades.
function requiredArtisans(quantidade) {
  return Math.ceil(quantidade / UNITS_PER_ARTISAN);
}

async function list(query) {
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.item ? { item: query.item } : {}),
    ...(query.guildaId ? { guildaId: query.guildaId } : {}),
    ...(query.quantidadeMinima ? { quantidade: { gte: query.quantidadeMinima } } : {}),
  };
  return paginatedResult(prisma.encomenda, where, query, { guilda: { select: { id: true, nome: true, reinoId: true } } });
}

async function getById(id) {
  const encomenda = await prisma.encomenda.findUnique({
    where: { id },
    include: {
      guilda: { select: { id: true, nome: true, oficio: true, reino: { select: { id: true, nome: true } } } },
    },
  });
  if (!encomenda) throw new HttpError(404, 'Encomenda não encontrada');
  return encomenda;
}

async function complete(id) {
  const encomenda = await prisma.encomenda.findUnique({
    where: { id },
    include: { guilda: { include: { _count: { select: { membros: true } } } } },
  });
  if (!encomenda) throw new HttpError(404, 'Encomenda não encontrada');
  if (encomenda.status !== 'PENDENTE') throw new HttpError(409, `A encomenda já está ${encomenda.status}`);

  const needed = requiredArtisans(encomenda.quantidade);
  const artisans = encomenda.guilda._count.membros;
  if (artisans < needed) {
    throw new HttpError(422, `A guilda precisa de ${needed} artesãos para concluir esta encomenda e possui ${artisans}`);
  }
  return prisma.encomenda.update({
    where: { id },
    data: { status: 'CONCLUIDA' },
    include: { guilda: { select: { id: true, nome: true } } },
  });
}

async function cancel(id) {
  try {
    return await prisma.$transaction(async (tx) => {
      const encomenda = await tx.encomenda.findUnique({ where: { id }, include: { guilda: true } });
      if (!encomenda) throw new HttpError(404, 'Encomenda não encontrada');
      if (encomenda.status !== 'PENDENTE') {
        throw new HttpError(409, 'Somente encomendas pendentes podem ser canceladas');
      }

      // O reino recupera parte do pagamento; o restante cobre o material já separado.
      const reembolso = {
        ouro: Math.round(encomenda.custoOuro * CANCEL_REFUND_RATE * 100) / 100,
        ferro: Math.round(encomenda.custoFerro * CANCEL_REFUND_RATE * 100) / 100,
      };
      await tx.economia.upsert({
        where: { reinoId: encomenda.guilda.reinoId },
        update: { ouro: { increment: reembolso.ouro }, ferro: { increment: reembolso.ferro } },
        create: { reinoId: encomenda.guilda.reinoId, ouro: reembolso.ouro, ferro: reembolso.ferro },
      });
      const updated = await tx.encomenda.update({
        where: { id },
        data: { status: 'CANCELADA' },
        include: { guilda: { select: { id: true, nome: true, reinoId: true } } },
      });
      return { ...updated, reembolso };
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao cancelar a encomenda; tente novamente');
    throw error;
  }
}

module.exports = { list, getById, complete, cancel, requiredArtisans };
