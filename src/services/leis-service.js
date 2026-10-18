const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');
const { paginatedResult } = require('../utils/pagination');

async function ListarLeisDoReino(query) {
  const where = {
    ...(query.titulo ? { titulo: { contains: query.titulo, mode: 'insensitive' } } : {}),
    ...(query.reinoId ? { reinoId: query.reinoId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  return paginatedResult(prisma.lei, where, query, {
    reino: { select: { id: true, nome: true } },
  });
}

async function CriarDecretoOuLei(dadosDaLei) {
  const reinoExiste = await prisma.reino.findUnique({
    where: { id: dadosDaLei.reinoId },
  });

  if (!reinoExiste) {
    throw new HttpError(404, 'O reino informado não foi encontrado');
  }

  try {
    return await prisma.lei.create({
      data: dadosDaLei,
      include: { reino: { select: { id: true, nome: true } } },
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new HttpError(409, 'Já existe uma lei cadastrada com este título neste reino');
    }
    throw error;
  }
}

async function RevogarLeiOuDecreto(id) {
  const lei = await prisma.lei.findUnique({ where: { id } });
  if (!lei) {
    throw new HttpError(404, 'Lei ou decreto não encontrado');
  }

  if (lei.status === 'REVOGADA') {
    throw new HttpError(409, 'Esta lei já se encontra revogada');
  }

  return prisma.lei.update({
    where: { id },
    data: { status: 'REVOGADA' },
    include: { reino: { select: { id: true, nome: true } } },
  });
}

async function AplicarImpostoDoReino({ reinoId, periodoFiscal, valor, descricao }) {
  const reinoExiste = await prisma.reino.findUnique({ where: { id: reinoId } });
  if (!reinoExiste) {
    throw new HttpError(404, 'O reino informado não foi encontrado');
  }

  const impostoExistente = await prisma.imposto.findFirst({
    where: { reinoId, periodoFiscal },
  });

  if (impostoExistente) {
    throw new HttpError(409, 'Já existe um imposto aplicado para este reino neste período fiscal');
  }

  return prisma.imposto.create({
    data: { reinoId, periodoFiscal, valor, descricao },
    include: { reino: { select: { id: true, nome: true } } },
  });
}

async function ConsultarHistoricoImpostos(query) {
  const where = {
    ...(query.reinoId ? { reinoId: query.reinoId } : {}),
    ...(query.periodoFiscal ? { periodoFiscal: query.periodoFiscal } : {}),
  };

  return paginatedResult(prisma.imposto, where, query, {
    reino: { select: { id: true, nome: true } },
  });
}

module.exports = {
  ListarLeisDoReino,
  CriarDecretoOuLei,
  RevogarLeiOuDecreto,
  AplicarImpostoDoReino,
  ConsultarHistoricoImpostos,
};