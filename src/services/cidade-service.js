const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

const minimumFood = Number(process.env.MIN_CITY_FOOD_STOCK || 100);

async function list(query) {
  const where = {
    ...(query.nome ? { nome: { contains: query.nome, mode: 'insensitive' } } : {}),
    ...(query.reinoId ? { territorio: { reinoId: query.reinoId } } : {}),
    ...(query.populacaoMinima ? { populacao: { gte: query.populacaoMinima } } : {}),
  };
  return paginatedResult(prisma.cidade, where, query, { territorio: { select: { id: true, nome: true, reinoId: true } } });
}

async function create(data) {
  if (data.estoqueAlimentos < minimumFood) {
    throw new HttpError(422, `A cidade precisa armazenar pelo menos ${minimumFood} unidades de alimentos`);
  }
  const territory = await prisma.territorio.findUnique({ where: { id: data.territorioId } });
  if (!territory) throw new HttpError(404, 'Território não encontrado');

  try {
    return await prisma.cidade.create({
      data: {
        ...data,
        // A produção agrícola acompanha diretamente a população inicial.
        producaoAgricola: data.populacao * 0.01,
      },
      include: { territorio: { select: { id: true, nome: true, reinoId: true } } },
    });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Já existe uma cidade com este nome');
    throw error;
  }
}

async function maintain(cityId, changes) {
  const city = await prisma.cidade.findUnique({ where: { id: cityId } });
  if (!city) throw new HttpError(404, 'Cidade não encontrada');
  const estoqueAlimentos = changes.estoqueAlimentos ?? city.estoqueAlimentos;
  const populacao = changes.populacao ?? city.populacao;
  if (!Number.isFinite(estoqueAlimentos) || estoqueAlimentos < minimumFood) {
    throw new HttpError(422, `A cidade precisa manter pelo menos ${minimumFood} unidades de alimentos`);
  }
  if (!Number.isInteger(populacao) || populacao < 1) throw new HttpError(422, 'A população deve ser um inteiro positivo');

  return prisma.cidade.update({
    where: { id: cityId },
    data: {
      ...changes,
      estoqueAlimentos,
      populacao,
      producaoAgricola: populacao * 0.01,
    },
  });
}

module.exports = { list, create, maintain };
