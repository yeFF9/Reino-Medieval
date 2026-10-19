const { z, pagination, uuid } = require('./common');

const tributeList = z.object({
  query: z.object({
    ...pagination,
    tipo: z.enum(['VASSALAGEM', 'OFERENDA_PAZ']).optional(),
    status: z.enum(['ENVIADO', 'ESTORNADO']).optional(),
    reinoOrigemId: uuid.optional(),
    reinoDestinoId: uuid.optional(),
  }),
});

const tributeIdParam = z.object({ params: z.object({ id: uuid }) });

const tributeBalance = z.object({ params: z.object({ reinoId: uuid }) });

module.exports = { tributeList, tributeIdParam, tributeBalance };
