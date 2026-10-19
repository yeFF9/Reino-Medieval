const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

const CITIZENS_PER_GUARD = Number(process.env.CITIZENS_PER_GUARD || 100);
const citySummary = { cidade: { select: { id: true, nome: true, populacao: true } } };

async function list(query) {
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.cidadeId ? { cidadeId: query.cidadeId } : {}),
    ...(query.contingenteMinimo ? { contingente: { gte: query.contingenteMinimo } } : {}),
  };
  return paginatedResult(prisma.patrulha, where, query, citySummary);
}

async function reinforce(id, { contingente }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const patrulha = await tx.patrulha.findUnique({ where: { id }, include: { cidade: true } });
      if (!patrulha) throw new HttpError(404, 'Patrulha não encontrada');
      if (patrulha.status !== 'ATIVA') throw new HttpError(409, 'Somente patrulhas ativas podem ser reforçadas');

      // Uma patrulha não pode ter mais de um guarda para cada CITIZENS_PER_GUARD habitantes.
      const limit = Math.floor(patrulha.cidade.populacao / CITIZENS_PER_GUARD);
      if (patrulha.contingente + contingente > limit) {
        throw new HttpError(
          422,
          `A patrulha pode ter no máximo ${limit} guardas para ${patrulha.cidade.populacao} habitantes`,
        );
      }

      const castle = await tx.castelo.findUnique({ where: { territorioId: patrulha.cidade.territorioId } });
      if (!castle) throw new HttpError(422, 'A cidade não possui castelo para fornecer guardas');
      if (castle.guardasAtuais < contingente) {
        throw new HttpError(422, `O castelo possui apenas ${castle.guardasAtuais} guardas disponíveis`);
      }
      const updated = await tx.castelo.updateMany({
        where: { id: castle.id, guardasAtuais: { gte: contingente } },
        data: { guardasAtuais: { decrement: contingente } },
      });
      if (updated.count !== 1) throw new HttpError(409, 'Os guardas do castelo foram alterados; tente novamente');

      return tx.patrulha.update({
        where: { id },
        data: { contingente: { increment: contingente } },
        include: citySummary,
      });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao reforçar a patrulha; tente novamente');
    throw error;
  }
}

async function close(id) {
  try {
    return await prisma.$transaction(async (tx) => {
      const patrulha = await tx.patrulha.findUnique({ where: { id }, include: { cidade: true } });
      if (!patrulha) throw new HttpError(404, 'Patrulha não encontrada');
      if (patrulha.status !== 'ATIVA') throw new HttpError(409, 'A patrulha já está encerrada');

      // Os guardas voltam ao castelo até o limite estrutural; o excedente é dispensado.
      const castle = await tx.castelo.findUnique({ where: { territorioId: patrulha.cidade.territorioId } });
      const vagas = castle ? Math.max(castle.capacidadeGuardas - castle.guardasAtuais, 0) : 0;
      const guardasRetornados = Math.min(patrulha.contingente, vagas);
      if (guardasRetornados > 0) {
        await tx.castelo.update({
          where: { id: castle.id },
          data: { guardasAtuais: { increment: guardasRetornados } },
        });
      }

      const encerrada = await tx.patrulha.update({
        where: { id },
        data: { status: 'ENCERRADA', encerradaEm: new Date() },
        include: citySummary,
      });
      return { ...encerrada, guardasRetornados, guardasDispensados: patrulha.contingente - guardasRetornados };
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao encerrar a patrulha; tente novamente');
    throw error;
  }
}

module.exports = { list, reinforce, close };
