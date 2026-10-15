const { z, pagination, uuid } = require('./common');

const listTerritoriesSchema = z.object({
  query: z.object({
    ...pagination,
    nome: z.string().trim().max(100).optional(),
    status: z.string().trim().max(40).optional(),
    reinoId: uuid.optional(),
  }),
});

const createTerritorySchema = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    descricao: z.string().trim().max(500).optional(),
    status: z.string().trim().min(2).max(40).optional(),
    reinoId: uuid.nullable().optional(),
  }),
});

const updateTerritorySchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    nome: z.string().trim().min(2).max(100).optional(),
    descricao: z.string().trim().max(500).nullable().optional(),
    status: z.string().trim().min(2).max(40).optional(),
    reinoId: uuid.nullable().optional(),
  }).refine((body) => Object.keys(body).length > 0, 'Informe ao menos um campo para alteração'),
});

module.exports = { listTerritoriesSchema, createTerritorySchema, updateTerritorySchema };
