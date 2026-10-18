const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

async function VerificarSuprimentos(id) {
  const cidade = await prisma.cidade.findUnique({ where: { id } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  const reservaMinima = cidade.populacao * 2;
  const atendeReserva = cidade.estoqueAlimentos >= reservaMinima;

  return {
    cidadeId: cidade.id,
    nome: cidade.nome,
    estoqueAlimentos: cidade.estoqueAlimentos,
    reservaMinimaExigida: reservaMinima,
    atendeReservaMinima: atendeReserva,
  };
}

async function ConsultarRacoes(id) {
  const cidade = await prisma.cidade.findUnique({ where: { id } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  return {
    cidadeId: cidade.id,
    nome: cidade.nome,
    estoqueRacoesMilitares: cidade.estoqueRacoes,
  };
}

async function ConverterEmRacoes(id, { percentualRacao }) {
  const cidade = await prisma.cidade.findUnique({ where: { id } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  const quantidadeParaConverter = (cidade.producaoAgricola * percentualRacao) / 100;

  if (cidade.estoqueAlimentos < quantidadeParaConverter) {
    throw new HttpError(400, 'Alimentos insuficientes em estoque para realizar esta conversão em rações');
  }

  return prisma.cidade.update({
    where: { id },
    data: {
      estoqueAlimentos: { decrement: quantidadeParaConverter },
      estoqueRacoes: { increment: quantidadeParaConverter },
    },
  });
}

module.exports = { VerificarSuprimentos, ConsultarRacoes, ConverterEmRacoes };