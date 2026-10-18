const prisma = require('../config/prisma');
const HttpError = require('../utils/http-error');

async function deployPatrol({ cidadeId, contingente }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const city = await tx.cidade.findUnique({ where: { id: cidadeId } });
      if (!city) throw new HttpError(404, 'Cidade não encontrada');
      const castle = await tx.castelo.findUnique({ where: { territorioId: city.territorioId } });
      if (!castle) throw new HttpError(422, 'A cidade não possui castelo para guarnecer patrulhas');
      if (contingente > castle.guardasAtuais) {
        throw new HttpError(422, 'Contingente superior aos guardas disponíveis no castelo');
      }
      const updated = await tx.castelo.updateMany({
        where: { id: castle.id, guardasAtuais: { gte: contingente } },
        data: { guardasAtuais: { decrement: contingente } },
      });
      if (updated.count !== 1) throw new HttpError(409, 'Os guardas do castelo foram alterados; tente novamente');
      return tx.patrulha.create({
        data: { cidadeId, contingente },
        include: { cidade: { select: { id: true, nome: true } } },
      });
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error.code === 'P2034') throw new HttpError(409, 'Conflito ao alocar a patrulha; tente novamente');
    throw error;
  }
}

module.exports = { deployPatrol };
