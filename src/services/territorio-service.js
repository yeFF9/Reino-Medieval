const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

async function list(query) {
  const where = {
    ...(query.nome ? { nome: { contains: query.nome, mode: 'insensitive' } } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.reinoId ? { reinoId: query.reinoId } : {}),
  };
  return paginatedResult(prisma.territorio, where, query, { reino: { select: { id: true, nome: true } } });
}

async function create(data) {
  if (data.reinoId && !(await prisma.reino.findUnique({ where: { id: data.reinoId } }))) {
    throw new HttpError(404, 'Reino não encontrado');
  }
  try {
    return await prisma.territorio.create({ data });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Já existe um território com este nome');
    throw error;
  }
}

async function update(id, data) {
  const current = await prisma.territorio.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, 'Território não encontrado');
  if (data.reinoId && !(await prisma.reino.findUnique({ where: { id: data.reinoId } }))) {
    throw new HttpError(404, 'Reino não encontrado');
  }
  try {
    return await prisma.territorio.update({ where: { id }, data });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Já existe um território com este nome');
    throw error;
  }
}

module.exports = { list, create, update };
