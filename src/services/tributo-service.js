const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

const REFUND_WINDOW_HOURS = Number(process.env.TRIBUTE_REFUND_HOURS || 24);
const kingdoms = {
  reinoOrigem: { select: { id: true, nome: true } },
  reinoDestino: { select: { id: true, nome: true } },
};

async function list(query) {
  const where = {
    ...(query.tipo ? { tipo: query.tipo } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.reinoOrigemId ? { reinoOrigemId: query.reinoOrigemId } : {}),
    ...(query.reinoDestinoId ? { reinoDestinoId: query.reinoDestinoId } : {}),
  };
  return paginatedResult(prisma.tributo, where, query, kingdoms);
}

async function getById(id) {
  const tributo = await prisma.tributo.findUnique({ where: { id }, include: kingdoms });
  if (!tributo) throw new HttpError(404, 'Tributo não encontrado');
  return tributo;
}

async function balance(reinoId) {
  const reino = await prisma.reino.findUnique({ where: { id: reinoId }, select: { id: true, nome: true } });
  if (!reino) throw new HttpError(404, 'Reino não encontrado');

  // Tributos estornados foram desfeitos e não entram no balanço.
  const sum = { ouro: true, alimentos: true, ferro: true };
  const [enviados, recebidos] = await Promise.all([
    prisma.tributo.aggregate({ where: { reinoOrigemId: reinoId, status: 'ENVIADO' }, _sum: sum, _count: true }),
    prisma.tributo.aggregate({ where: { reinoDestinoId: reinoId, status: 'ENVIADO' }, _sum: sum, _count: true }),
  ]);

  const totals = (result) => ({
    quantidade: result._count,
    ouro: result._sum.ouro || 0,
    alimentos: result._sum.alimentos || 0,
    ferro: result._sum.ferro || 0,
  });
  const sent = totals(enviados);
  const received = totals(recebidos);

  return {
    reino,
    enviados: sent,
    recebidos: received,
    saldo: {
      ouro: received.ouro - sent.ouro,
      alimentos: received.alimentos - sent.alimentos,
      ferro: received.ferro - sent.ferro,
    },
  };
}

async function refund(id) {
  try {
    return await prisma.$transaction(async (tx) => {
      const tributo = await tx.tributo.findUnique({ where: { id } });
      if (!tributo) throw new HttpError(404, 'Tributo não encontrado');
      if (tributo.status !== 'ENVIADO') throw new HttpError(409, 'Este tributo já foi estornado');
      if (tributo.tipo === 'VASSALAGEM') {
        throw new HttpError(422, 'Tributos de vassalagem são obrigatórios e não podem ser estornados');
      }
      const hoursSinceSent = (Date.now() - tributo.createdAt.getTime()) / 3600000;
      if (hoursSinceSent > REFUND_WINDOW_HOURS) {
        throw new HttpError(422, `O estorno só é permitido até ${REFUND_WINDOW_HOURS} horas após o envio`);
      }

      const { ouro, alimentos, ferro } = tributo;
      const debit = await tx.economia.updateMany({
        where: {
          reinoId: tributo.reinoDestinoId,
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
        throw new HttpError(422, 'O reino de destino não possui mais os recursos recebidos para devolver');
      }
      await tx.economia.upsert({
        where: { reinoId: tributo.reinoOrigemId },
        update: {
          ouro: { increment: ouro },
          alimentos: { increment: alimentos },
          ferro: { increment: ferro },
        },
        create: { reinoId: tributo.reinoOrigemId, ouro, alimentos, ferro },
      });
      return tx.tributo.update({ where: { id }, data: { status: 'ESTORNADO' }, include: kingdoms });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao estornar o tributo; tente novamente');
    throw error;
  }
}

module.exports = { list, getById, balance, refund };
