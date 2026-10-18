const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

async function ObterPopulacao(id) {
  const cidade = await prisma.cidade.findUnique({
    where: { id },
    include: { territorio: { select: { nome: true } } },
  });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  return {
    cidadeId: cidade.id,
    nome: cidade.nome,
    territorio: cidade.territorio.nome,
    populacao: cidade.populacao,
  };
}

async function ObterMapaFome(id) {
  const cidade = await prisma.cidade.findUnique({ where: { id } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  const necessidadeDiaria = cidade.populacao * 2; 
  const mediaRefeicoesPorDia = necessidadeDiaria > 0 ? (cidade.estoqueAlimentos / necessidadeDiaria) * 2 : 0;
  
  let statusAbastecimento = 'Fartura';
  if (mediaRefeicoesPorDia < 0.5) statusAbastecimento = 'Grave Ameaça de Fome';
  else if (mediaRefeicoesPorDia < 1.0) statusAbastecimento = 'Racionamento Severo';
  else if (mediaRefeicoesPorDia < 1.5) statusAbastecimento = 'Abastecimento Adequado';

  return {
    cidadeId: cidade.id,
    estoqueAlimentos: cidade.estoqueAlimentos,
    populacao: cidade.populacao,
    mediaRefeicoesPorDia: Number(mediaRefeicoesPorDia.toFixed(2)),
    atendeReservaMinima: cidade.estoqueAlimentos >= necessidadeDiaria,
    statusAbastecimento,
  };
}

async function ObterSatisfacao(id) {
  const cidade = await prisma.cidade.findUnique({ where: { id } });
  if (!cidade) throw new HttpError(404, 'Cidade não encontrada');

  const necessidadeDiaria = cidade.populacao * 2;
  const mediaRefeicoes = necessidadeDiaria > 0 ? (cidade.estoqueAlimentos / necessidadeDiaria) * 2 : 0;

  let pontuacao = 10;
  let chanceRevolta = 0;
  let statusMoral = 'Povo Leal & Próspero';

  if (mediaRefeicoes >= 1.5) {
    pontuacao = 10;
    chanceRevolta = 0;
  } else if (mediaRefeicoes >= 1.0) {
    pontuacao = 7;
    chanceRevolta = 5;
    statusMoral = 'Povo Satisfeito';
  } else if (mediaRefeicoes >= 0.5) {
    pontuacao = 3;
    chanceRevolta = 45;
    statusMoral = 'Tensão Social / Risco Alto';
  } else {
    pontuacao = 0;
    chanceRevolta = 90;
    statusMoral = 'Revolta Iminente';
  }

  return {
    cidadeId: cidade.id,
    indiceSatisfacao: `${pontuacao}/10`,
    chanceRevolta: `${chanceRevolta}%`,
    statusMoral,
  };
}

module.exports = { ObterPopulacao, ObterMapaFome, ObterSatisfacao };