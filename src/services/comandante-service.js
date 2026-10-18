const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

async function list(query) {
  const where = {
    ...(query.nome ? { nome: { contains: query.nome, mode: 'insensitive' } } : {}),
    ...(query.patente ? { patente: { contains: query.patente, mode: 'insensitive' } } : {}),
    ...(query.nivelPatenteMinimo !== undefined ? { nivelPatente: { gte: query.nivelPatenteMinimo } } : {}),
  };
  return paginatedResult(prisma.comandante, where, query);
}

async function create(data) {
  return prisma.comandante.create({ data });
}

async function getById(id) {
  const comandante = await prisma.comandante.findUnique({
    where: { id },
    include: {
      exercitos: { select: { id: true, nome: true, efetivo: true, status: true } },
    },
  });
  if (!comandante) throw new HttpError(404, 'Comandante não encontrado');
  return comandante;
}

async function promote(id, { nivelPatente, patente }) {
  const comandante = await prisma.comandante.findUnique({ where: { id } });
  if (!comandante) throw new HttpError(404, 'Comandante não encontrado');
  if (nivelPatente <= comandante.nivelPatente) {
    throw new HttpError(422, 'A nova patente deve ser superior à patente atual');
  }
  return prisma.comandante.update({
    where: { id },
    data: { nivelPatente, ...(patente ? { patente } : {}) },
  });
}

module.exports = { list, create, getById, promote };
