const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

async function list(query) {
  const where = {
    ...(query.nome ? { nome: { contains: query.nome, mode: 'insensitive' } } : {}),
    ...(query.formaGoverno ? { formaGoverno: { contains: query.formaGoverno, mode: 'insensitive' } } : {}),
  };
  return paginatedResult(prisma.reino, where, query);
}

async function create(data) {
  try {
    return await prisma.reino.create({
      data: { ...data, economia: { create: { ouro: 0, alimentos: 0, ferro: 0 } } },
      include: { economia: true },
    });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Já existe um reino com este nome');
    throw error;
  }
}

async function getById(id) {
  const reino = await prisma.reino.findUnique({
    where: { id },
    include: { economia: true, territorios: true },
  });
  if (!reino) throw new HttpError(404, 'Reino não encontrado');
  return reino;
}

async function getEconomy(id) {
  const reino = await prisma.reino.findUnique({ where: { id }, include: { economia: true } });
  if (!reino) throw new HttpError(404, 'Reino não encontrado');
  if (!reino.economia) throw new HttpError(404, 'Este reino ainda não possui economia registrada');
  return reino.economia;
}

async function adjustEconomy(id, { modo, ouro, alimentos, ferro }) {
  const reino = await prisma.reino.findUnique({ where: { id } });
  if (!reino) throw new HttpError(404, 'Reino não encontrado');
  const current = await prisma.economia.findUnique({ where: { reinoId: id } });
  const base = current || { ouro: 0, alimentos: 0, ferro: 0 };
  const values = { ouro, alimentos, ferro };

  const next = {};
  for (const field of ['ouro', 'alimentos', 'ferro']) {
    if (values[field] !== undefined) {
      next[field] = modo === 'DEFINIR' ? values[field] : base[field] + values[field];
    }
  }

  return prisma.economia.upsert({
    where: { reinoId: id },
    update: next,
    create: { reinoId: id, ouro: next.ouro ?? 0, alimentos: next.alimentos ?? 0, ferro: next.ferro ?? 0 },
  });
}

module.exports = { list, create, getById, getEconomy, adjustEconomy };
