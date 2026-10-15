const { z, pagination, uuid } = require('./common');

const reinoList = z.object({
  query: z.object({
    ...pagination,
    nome: z.string().trim().max(100).optional(),
    formaGoverno: z.string().trim().max(80).optional(),
  }),
});
const createReino = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    descricao: z.string().trim().max(500).optional(),
    formaGoverno: z.string().trim().max(80).optional(),
  }),
});
const idParam = z.object({ params: z.object({ id: uuid }) });

const cityList = z.object({
  query: z.object({
    ...pagination,
    nome: z.string().trim().max(100).optional(),
    reinoId: uuid.optional(),
    populacaoMinima: z.coerce.number().int().min(0).optional(),
  }),
});
const createCity = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    territorioId: uuid,
    populacao: z.number().int().positive(),
    estoqueAlimentos: z.number().nonnegative(),
  }),
});

const armyList = z.object({
  query: z.object({
    ...pagination,
    nome: z.string().trim().max(100).optional(),
    reinoId: uuid.optional(),
    status: z.enum(['DISPONIVEL', 'MOBILIZADO']).optional(),
  }),
});
const createArmy = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    reinoId: uuid,
    territorioId: uuid,
    comandanteId: uuid,
    efetivo: z.number().int().positive(),
  }),
});
const mobilizeArmy = z.object({ params: z.object({ id: uuid }) });

const declareWar = z.object({
  body: z.object({
    reinoAtacanteId: uuid,
    reinoDefensorId: uuid,
    territorioId: uuid,
  }).refine((body) => body.reinoAtacanteId !== body.reinoDefensorId, {
    message: 'Um reino não pode declarar guerra contra si mesmo',
    path: ['reinoDefensorId'],
  }),
});
const warHistory = z.object({
  query: z.object({
    ...pagination,
    reinoId: uuid.optional(),
    status: z.enum(['EM_ANDAMENTO', 'FINALIZADA']).optional(),
  }),
});

module.exports = {
  reinoList, createReino, idParam, cityList, createCity, armyList, createArmy, mobilizeArmy, declareWar, warHistory,
};
