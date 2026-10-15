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

module.exports = { list, create, getById };
