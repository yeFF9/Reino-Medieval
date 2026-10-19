const { z, pagination, uuid } = require('./common');

const orderList = z.object({
  query: z.object({
    ...pagination,
    status: z.enum(['PENDENTE', 'CONCLUIDA', 'CANCELADA']).optional(),
    item: z.enum(['ARMAS', 'ARMADURAS', 'MATERIAIS_CONSTRUCAO']).optional(),
    guildaId: uuid.optional(),
    quantidadeMinima: z.coerce.number().int().min(1).optional(),
  }),
});

const orderIdParam = z.object({ params: z.object({ id: uuid }) });

module.exports = { orderList, orderIdParam };
