const { z, uuid } = require('./common');

const IdCidadeParam = z.object({
  params: z.object({ id: uuid }),
});

const CriarColheita = z.object({
  body: z.object({
    cidadeId: uuid,
    quantidadeBruta: z.number().min(1, 'A quantidade bruta deve ser no mínimo 1'),
  }),
});

module.exports = {
  IdCidadeParam,
  CriarColheita,
};