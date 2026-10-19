const { z, pagination, uuid } = require('./common');

const patrolList = z.object({
  query: z.object({
    ...pagination,
    status: z.enum(['ATIVA', 'ENCERRADA']).optional(),
    cidadeId: uuid.optional(),
    contingenteMinimo: z.coerce.number().int().min(1).optional(),
  }),
});

const reinforcePatrol = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ contingente: z.number().int().positive() }),
});

const patrolIdParam = z.object({ params: z.object({ id: uuid }) });

module.exports = { patrolList, reinforcePatrol, patrolIdParam };
