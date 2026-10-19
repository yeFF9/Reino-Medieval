const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');
const { requiredArtisans } = require('./encomenda-service');

const MAX_MEMBERS = Number(process.env.GUILD_MAX_MEMBERS || 50);
const guildSummary = { guilda: { select: { id: true, nome: true, reinoId: true } } };

async function list(query) {
  const where = {
    ...(query.nome ? { nome: { contains: query.nome, mode: 'insensitive' } } : {}),
    ...(query.especialidade ? { especialidade: { contains: query.especialidade, mode: 'insensitive' } } : {}),
    ...(query.guildaId ? { guildaId: query.guildaId } : {}),
  };
  return paginatedResult(prisma.guildaMembro, where, query, guildSummary);
}

async function ensureVacancy(guildaId) {
  const members = await prisma.guildaMembro.count({ where: { guildaId } });
  if (members >= MAX_MEMBERS) {
    throw new HttpError(422, `A guilda já atingiu o limite de ${MAX_MEMBERS} membros`);
  }
}

// A guilda não pode perder artesãos necessários para as encomendas ainda pendentes.
async function ensureCapacityAfterLeaving(guildaId) {
  const [members, pending] = await Promise.all([
    prisma.guildaMembro.count({ where: { guildaId } }),
    prisma.encomenda.aggregate({ where: { guildaId, status: 'PENDENTE' }, _sum: { quantidade: true } }),
  ]);
  const needed = requiredArtisans(pending._sum.quantidade || 0);
  if (members - 1 < needed) {
    throw new HttpError(
      422,
      `A guilda ficaria com ${members - 1} artesãos e precisa de ${needed} para as encomendas pendentes`,
    );
  }
}

async function create({ guildaId, nome, especialidade }) {
  const guilda = await prisma.guilda.findUnique({ where: { id: guildaId } });
  if (!guilda) throw new HttpError(404, 'Guilda não encontrada');
  await ensureVacancy(guildaId);
  const duplicate = await prisma.guildaMembro.findFirst({
    where: { guildaId, nome: { equals: nome, mode: 'insensitive' } },
  });
  if (duplicate) throw new HttpError(409, 'Já existe um artesão com este nome nesta guilda');

  return prisma.guildaMembro.create({ data: { guildaId, nome, especialidade }, include: guildSummary });
}

async function transfer(id, { guildaDestinoId }) {
  const membro = await prisma.guildaMembro.findUnique({ where: { id }, include: { guilda: true } });
  if (!membro) throw new HttpError(404, 'Membro da guilda não encontrado');
  const destino = await prisma.guilda.findUnique({ where: { id: guildaDestinoId } });
  if (!destino) throw new HttpError(404, 'Guilda de destino não encontrada');
  if (destino.id === membro.guildaId) throw new HttpError(422, 'O artesão já pertence a esta guilda');
  if (destino.reinoId !== membro.guilda.reinoId) {
    throw new HttpError(422, 'Artesãos só podem ser transferidos entre guildas do mesmo reino');
  }
  await ensureVacancy(destino.id);
  await ensureCapacityAfterLeaving(membro.guildaId);

  return prisma.guildaMembro.update({ where: { id }, data: { guildaId: destino.id }, include: guildSummary });
}

async function remove(id) {
  const membro = await prisma.guildaMembro.findUnique({ where: { id } });
  if (!membro) throw new HttpError(404, 'Membro da guilda não encontrado');
  await ensureCapacityAfterLeaving(membro.guildaId);
  return prisma.guildaMembro.delete({ where: { id } });
}

module.exports = { list, create, transfer, remove };
