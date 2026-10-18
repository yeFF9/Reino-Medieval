const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

async function RegistarColheita({ cidadeId, quantidadeBruta }) {
  const cidade = await prisma.cidade.findUnique({ where: { id: cidadeId } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  return prisma.cidade.update({
    where: { id: cidadeId },
    data: {
      producaoAgricola: quantidadeBruta,
      estoqueAlimentos: { increment: quantidadeBruta },
    },
  });
}

async function ObterAgricultura(id) {
  const cidade = await prisma.cidade.findUnique({ where: { id } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  return {
    cidadeId: cidade.id,
    nome: cidade.nome,
    producaoAgricolaAtual: cidade.producaoAgricola,
    estoqueAlimentosAtual: cidade.estoqueAlimentos,
  };
}

module.exports = { RegistarColheita, ObterAgricultura };