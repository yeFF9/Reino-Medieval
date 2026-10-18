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
const finalizeWar = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ vencedorId: uuid }),
});

const commanderList = z.object({
  query: z.object({
    ...pagination,
    nome: z.string().trim().max(100).optional(),
    patente: z.string().trim().max(80).optional(),
    nivelPatenteMinimo: z.coerce.number().int().min(0).optional(),
  }),
});
const createCommander = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    patente: z.string().trim().min(2).max(80),
    nivelPatente: z.number().int().min(1).max(10),
  }),
});
const promoteCommander = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    nivelPatente: z.number().int().min(1).max(10),
    patente: z.string().trim().min(2).max(80).optional(),
  }),
});
const assignCommander = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ comandanteId: uuid }),
});
const armyIdParam = z.object({ params: z.object({ id: uuid }) });

const createPatrol = z.object({
  body: z.object({
    cidadeId: uuid,
    contingente: z.number().int().positive(),
  }),
});

const createPact = z.object({
  body: z.object({
    reinoAId: uuid,
    reinoBId: uuid,
    tipo: z.enum(['ALIANCA', 'PACTO_NAO_AGRESSAO', 'ACORDO_COMERCIAL']),
  }).refine((body) => body.reinoAId !== body.reinoBId, {
    message: 'Um reino não pode firmar acordo consigo mesmo',
    path: ['reinoBId'],
  }),
});
const listPacts = z.object({
  params: z.object({ reinoId: uuid }),
  query: z.object({
    ...pagination,
    status: z.enum(['ATIVA', 'ENCERRADA']).optional(),
    tipo: z.string().trim().max(40).optional(),
  }),
});
const breakPact = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ reinoId: uuid.optional() }).optional(),
});
const sendTribute = z.object({
  body: z.object({
    reinoOrigemId: uuid,
    reinoDestinoId: uuid,
    tipo: z.enum(['VASSALAGEM', 'OFERENDA_PAZ']).default('OFERENDA_PAZ'),
    ouro: z.number().nonnegative().default(0),
    alimentos: z.number().nonnegative().default(0),
    ferro: z.number().nonnegative().default(0),
  }).refine((body) => body.reinoOrigemId !== body.reinoDestinoId, {
    message: 'O reino de origem e o destino devem ser diferentes',
    path: ['reinoDestinoId'],
  }).refine((body) => body.ouro + body.alimentos + body.ferro > 0, {
    message: 'Informe ao menos um recurso a enviar',
    path: ['ouro'],
  }),
});

const createGuild = z.object({
  body: z.object({
    nome: z.string().trim().min(2).max(100),
    oficio: z.string().trim().min(2).max(80),
    reinoId: uuid,
    membros: z.array(z.object({
      nome: z.string().trim().min(2).max(100),
      especialidade: z.string().trim().min(2).max(80),
    })).max(50).optional(),
  }),
});
const guildIdParam = z.object({ params: z.object({ id: uuid }) });
const guildMembers = z.object({
  params: z.object({ id: uuid }),
  query: z.object({ ...pagination }),
});
const createGuildOrder = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    item: z.enum(['ARMAS', 'ARMADURAS', 'MATERIAIS_CONSTRUCAO']),
    quantidade: z.number().int().positive(),
  }),
});

const updateEconomy = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    modo: z.enum(['CREDITAR', 'DEFINIR']).default('CREDITAR'),
    ouro: z.number().nonnegative().optional(),
    alimentos: z.number().nonnegative().optional(),
    ferro: z.number().nonnegative().optional(),
  }).refine((body) => [body.ouro, body.alimentos, body.ferro].some((value) => value !== undefined), {
    message: 'Informe ao menos um recurso',
    path: ['ouro'],
  }),
});

module.exports = {
  reinoList, createReino, idParam, cityList, createCity, armyList, createArmy, mobilizeArmy, declareWar, warHistory,
  finalizeWar, commanderList, createCommander, promoteCommander, assignCommander, armyIdParam, createPatrol,
  createPact, listPacts, breakPact, sendTribute, createGuild, guildIdParam, guildMembers, createGuildOrder, updateEconomy,
};
