const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const cidadeService = require('./cidade-service');

async function applyTax({ territorioId, cidadeId, periodoFiscal, valor }) {
  if (Boolean(territorioId) === Boolean(cidadeId)) {
    throw new HttpError(422, 'Informe exatamente uma cidade ou um território para o imposto');
  }
  if (!periodoFiscal || !Number.isFinite(valor) || valor < 0) {
    throw new HttpError(422, 'Informe um período fiscal e um valor de imposto não negativo');
  }
  if (territorioId && !(await prisma.territorio.findUnique({ where: { id: territorioId } }))) {
    throw new HttpError(404, 'Território não encontrado');
  }
  if (cidadeId && !(await prisma.cidade.findUnique({ where: { id: cidadeId } }))) {
    throw new HttpError(404, 'Cidade não encontrada');
  }
  const where = territorioId ? { territorioId, periodoFiscal } : { cidadeId, periodoFiscal };
  if (await prisma.imposto.findFirst({ where })) {
    throw new HttpError(409, 'Já existe imposto aplicado a este alvo neste período fiscal');
  }
  try {
    return await prisma.imposto.create({ data: { territorioId, cidadeId, periodoFiscal, valor } });
  } catch (error) {
    if (error.code === 'P2002') throw new HttpError(409, 'Imposto já aplicado neste período fiscal');
    throw error;
  }
}

async function setCastleGuards(castleId, guardCount) {
  const castle = await prisma.castelo.findUnique({ where: { id: castleId } });
  if (!castle) throw new HttpError(404, 'Castelo não encontrado');
  if (!Number.isInteger(guardCount) || guardCount < 0) {
    throw new HttpError(422, 'A quantidade de guardas deve ser um inteiro não negativo');
  }
  if (guardCount > castle.capacidadeGuardas) {
    throw new HttpError(422, 'A quantidade de guardas excede a capacidade estrutural do castelo');
  }
  return prisma.castelo.update({ where: { id: castleId }, data: { guardasAtuais: guardCount } });
}

async function changeCityPopulation(cityId, population) {
  if (!Number.isInteger(population) || population < 1) throw new HttpError(422, 'A população deve ser um inteiro positivo');
  return cidadeService.maintain(cityId, { populacao: population });
}

module.exports = { applyTax, setCastleGuards, changeCityPopulation };
