const { z, uuid } = require('./common');

const IdCidadeParam = z.object({
  params: z.object({ id: uuid }),
});

const ConverterRacao = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    percentualRacao: z.number().min(0).max(100, 'O percentual deve estar entre 0 e 100'),
  }),
});

module.exports = {
  IdCidadeParam,
  ConverterRacao,
};