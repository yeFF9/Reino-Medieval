const swaggerJsdoc = require('swagger-jsdoc');

const listParameters = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
];
const bearer = [{ bearerAuth: [] }];
const response = (description) => ({ description });
const listOperation = (tag, summary, filters, pathParams = []) => ({
  tags: [tag],
  summary,
  security: bearer,
  parameters: [
    ...pathParams,
    ...listParameters,
    ...filters.map((filter) => ({ name: filter, in: 'query', schema: { type: 'string' } })),
  ],
  responses: { 200: response('Lista paginada'), 401: response('Não autenticado'), 403: response('Sem permissão') },
});
const secured = (tag, summary, code = '200') => ({
  tags: [tag],
  summary,
  security: bearer,
  responses: { [code]: response('Operação realizada'), 401: response('Não autenticado'), 403: response('Sem permissão') },
});
const bodyOperation = (tag, summary, schemaName, code = '201') => ({
  ...secured(tag, summary, code),
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: `#/components/schemas/${schemaName}` } } },
  },
});
const idParameter = { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };
const reinoPathParameter = { name: 'reinoId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Administração do Reino Medieval API',
    version: '1.0.0',
    description: 'API REST para monarquia, territórios, cidades, exércitos e diplomacia.',
  },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      LoginRequest: {
        type: 'object', required: ['email', 'senha'],
        properties: { email: { type: 'string', format: 'email' }, senha: { type: 'string', minLength: 8 } },
      },
      RegisterRequest: {
        type: 'object', required: ['nome', 'email', 'senha'],
        properties: {
          nome: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          senha: { type: 'string', minLength: 8 },
        },
      },
      ReinoInput: {
        type: 'object', required: ['nome'],
        properties: { nome: { type: 'string' }, descricao: { type: 'string' }, formaGoverno: { type: 'string' } },
      },
      TerritorioInput: {
        type: 'object', required: ['nome'],
        properties: {
          nome: { type: 'string' }, descricao: { type: 'string' }, status: { type: 'string' },
          reinoId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
      TerritorioUpdate: {
        type: 'object', minProperties: 1,
        properties: {
          nome: { type: 'string' }, descricao: { type: 'string', nullable: true }, status: { type: 'string' },
          reinoId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
      CidadeInput: {
        type: 'object', required: ['nome', 'territorioId', 'populacao', 'estoqueAlimentos'],
        properties: {
          nome: { type: 'string' }, territorioId: { type: 'string', format: 'uuid' },
          populacao: { type: 'integer', minimum: 1 }, estoqueAlimentos: { type: 'number', minimum: 0 },
        },
      },
      ExercitoInput: {
        type: 'object', required: ['nome', 'reinoId', 'territorioId', 'comandanteId', 'efetivo'],
        properties: {
          nome: { type: 'string' }, reinoId: { type: 'string', format: 'uuid' },
          territorioId: { type: 'string', format: 'uuid' }, comandanteId: { type: 'string', format: 'uuid' },
          efetivo: { type: 'integer', minimum: 1 },
        },
      },
      GuerraInput: {
        type: 'object', required: ['reinoAtacanteId', 'reinoDefensorId', 'territorioId'],
        properties: {
          reinoAtacanteId: { type: 'string', format: 'uuid' },
          reinoDefensorId: { type: 'string', format: 'uuid' },
          territorioId: { type: 'string', format: 'uuid' },
        },
      },
      GuerraFinalizeInput: {
        type: 'object', required: ['vencedorId'],
        properties: { vencedorId: { type: 'string', format: 'uuid' } },
      },
      ComandanteInput: {
        type: 'object', required: ['nome', 'patente', 'nivelPatente'],
        properties: {
          nome: { type: 'string' }, patente: { type: 'string' },
          nivelPatente: { type: 'integer', minimum: 1, maximum: 10 },
        },
      },
      ComandantePromocao: {
        type: 'object', required: ['nivelPatente'],
        properties: {
          nivelPatente: { type: 'integer', minimum: 1, maximum: 10 },
          patente: { type: 'string' },
        },
      },
      DesignarComandanteInput: {
        type: 'object', required: ['comandanteId'],
        properties: { comandanteId: { type: 'string', format: 'uuid' } },
      },
      PatrulhaInput: {
        type: 'object', required: ['cidadeId', 'contingente'],
        properties: {
          cidadeId: { type: 'string', format: 'uuid' },
          contingente: { type: 'integer', minimum: 1 },
        },
      },
      PactoInput: {
        type: 'object', required: ['reinoAId', 'reinoBId', 'tipo'],
        properties: {
          reinoAId: { type: 'string', format: 'uuid' },
          reinoBId: { type: 'string', format: 'uuid' },
          tipo: { type: 'string', enum: ['ALIANCA', 'PACTO_NAO_AGRESSAO', 'ACORDO_COMERCIAL'] },
        },
      },
      TributoInput: {
        type: 'object', required: ['reinoOrigemId', 'reinoDestinoId'],
        properties: {
          reinoOrigemId: { type: 'string', format: 'uuid' },
          reinoDestinoId: { type: 'string', format: 'uuid' },
          tipo: { type: 'string', enum: ['VASSALAGEM', 'OFERENDA_PAZ'] },
          ouro: { type: 'number', minimum: 0 },
          alimentos: { type: 'number', minimum: 0 },
          ferro: { type: 'number', minimum: 0 },
        },
      },
      GuildaInput: {
        type: 'object', required: ['nome', 'oficio', 'reinoId'],
        properties: {
          nome: { type: 'string' }, oficio: { type: 'string' }, reinoId: { type: 'string', format: 'uuid' },
          membros: {
            type: 'array',
            items: {
              type: 'object', required: ['nome', 'especialidade'],
              properties: { nome: { type: 'string' }, especialidade: { type: 'string' } },
            },
          },
        },
      },
      GuildaEncomendaInput: {
        type: 'object', required: ['item', 'quantidade'],
        properties: {
          item: { type: 'string', enum: ['ARMAS', 'ARMADURAS', 'MATERIAIS_CONSTRUCAO'] },
          quantidade: { type: 'integer', minimum: 1 },
        },
      },
      EconomiaUpdate: {
        type: 'object', minProperties: 1,
        properties: {
          modo: { type: 'string', enum: ['CREDITAR', 'DEFINIR'] },
          ouro: { type: 'number', minimum: 0 },
          alimentos: { type: 'number', minimum: 0 },
          ferro: { type: 'number', minimum: 0 },
        },
      },
      LeiInput: {
        type: 'object',
        required: ['titulo', 'reinoId'],
        properties: {
          titulo: { type: 'string', minLength: 2 },
          descricao: { type: 'string' },
          reinoId: { type: 'string', format: 'uuid' },
        },
      },
      ImpostoInput: {
        type: 'object',
        required: ['reinoId', 'periodoFiscal', 'valor'],
        properties: {
          reinoId: { type: 'string', format: 'uuid' },
          periodoFiscal: { type: 'string' },
          valor: { type: 'number', minimum: 0 },
          descricao: { type: 'string' },
        },
      },
      CasteloInput: {
        type: 'object',
        required: ['territorioId', 'capacidadeGuardas'],
        properties: {
          territorioId: { type: 'string', format: 'uuid' },
          capacidadeGuardas: { type: 'integer', minimum: 1 },
        },
      },
      RecursoReinoInput: {
        type: 'object',
        required: ['reinoId'],
        properties: {
          reinoId: { type: 'string', format: 'uuid' },
        },
      },
      ColheitaInput: {
        type: 'object',
        required: ['cidadeId', 'quantidadeBruta'],
        properties: {
          cidadeId: { type: 'string', format: 'uuid' },
          quantidadeBruta: { type: 'number', minimum: 1 },
        },
      },
      ConversaoRacaoInput: {
        type: 'object',
        required: ['percentualRacao'],
        properties: {
          percentualRacao: { type: 'number', minimum: 0, maximum: 100, description: 'Percentual da colheita convertido em ração (ex: 50 para 50%)' },
        },
      },
    },
  },
  
  paths: {
    '/auth/login': { post: bodyOperation('Autenticação', 'Autenticar e obter JWT', 'LoginRequest', '200') },
    '/auth/register': { post: bodyOperation('Autenticação', 'Registrar conta de leitor', 'RegisterRequest') },
    '/reinos': {
      get: listOperation('Reinos', 'Listar reinos', ['nome', 'formaGoverno']),
      post: bodyOperation('Reinos', 'Criar reino e economia inicial', 'ReinoInput'),
    },
    '/reinos/{id}': {
      get: {
        ...secured('Reinos', 'Consultar reino'),
        parameters: [idParameter],
        responses: { 200: response('Reino'), 401: response('Não autenticado'), 403: response('Sem permissão'), 404: response('Não encontrado') },
      },
    },
    '/reinos/{id}/economia': {
      get: { ...secured('Reinos', 'Consultar a economia do reino'), parameters: [idParameter] },
      patch: { ...bodyOperation('Reinos', 'Ajustar recursos do reino', 'EconomiaUpdate', '200'), parameters: [idParameter] },
    },
    '/territorios': {
      get: listOperation('Territórios', 'Listar territórios', ['nome', 'status', 'reinoId']),
      post: bodyOperation('Territórios', 'Criar território', 'TerritorioInput'),
    },
    '/territorios/{id}': {
      put: { ...bodyOperation('Territórios', 'Atualizar território', 'TerritorioUpdate', '200'), parameters: [idParameter] },
    },
    '/cidades': {
      get: listOperation('Cidades', 'Listar cidades', ['nome', 'reinoId', 'populacaoMinima']),
      post: bodyOperation('Cidades', 'Criar cidade com verificação de suprimentos', 'CidadeInput'),
    },
    '/exercitos': {
      get: listOperation('Exércitos', 'Listar exércitos', ['nome', 'reinoId', 'status']),
      post: bodyOperation('Exércitos', 'Criar exército', 'ExercitoInput'),
    },
    '/exercitos/{id}/mobilizar': {
      patch: { ...secured('Exércitos', 'Mobilizar exército com débito de recursos'), parameters: [idParameter] },
    },
    '/exercitos/{id}/desmobilizar': {
      patch: { ...secured('Exército, Guardas e Patentes', 'Desmobilizar exército e zerar a manutenção'), parameters: [idParameter] },
    },
    '/exercitos/{id}/designar-comandante': {
      patch: { ...bodyOperation('Exército, Guardas e Patentes', 'Designar comandante para um exército', 'DesignarComandanteInput', '200'), parameters: [idParameter] },
    },
    '/guerras/declarar': { post: bodyOperation('Guerras e Diplomacia', 'Declarar guerra respeitando pactos de não agressão', 'GuerraInput') },
    '/guerras/historico': { get: listOperation('Guerras e Diplomacia', 'Consultar histórico de guerras', ['reinoId', 'status']) },
    '/guerras/{id}/finalizar': {
      patch: { ...bodyOperation('Guerras e Diplomacia', 'Finalizar guerra e transferir o território ao vencedor', 'GuerraFinalizeInput', '200'), parameters: [idParameter] },
    },
    '/comandantes': {
      get: listOperation('Exército, Guardas e Patentes', 'Listar comandantes', ['nome', 'patente', 'nivelPatenteMinimo']),
      post: bodyOperation('Exército, Guardas e Patentes', 'Registrar ou nomear comandante', 'ComandanteInput'),
    },
    '/comandantes/{id}': {
      get: {
        ...secured('Exército, Guardas e Patentes', 'Consultar comandante'),
        parameters: [idParameter],
        responses: { 200: response('Comandante'), 401: response('Não autenticado'), 403: response('Sem permissão'), 404: response('Não encontrado') },
      },
    },
    '/comandantes/{id}/promover': {
      patch: { ...bodyOperation('Exército, Guardas e Patentes', 'Promover a patente de um comandante', 'ComandantePromocao', '200'), parameters: [idParameter] },
    },
    '/guardas/patrulhas': {
      post: bodyOperation('Exército, Guardas e Patentes', 'Alocar contingente de guardas em patrulha', 'PatrulhaInput'),
    },
    '/diplomacia/pactos': {
      post: bodyOperation('Diplomacia e Acordos', 'Selar pacto de aliança, não agressão ou acordo comercial', 'PactoInput'),
    },
    '/diplomacia/pactos/{reinoId}': {
      get: listOperation('Diplomacia e Acordos', 'Listar acordos vigentes de um reino', ['status', 'tipo'], [reinoPathParameter]),
    },
    '/diplomacia/pactos/{id}/romper': {
      delete: { ...secured('Diplomacia e Acordos', 'Romper pacto com penalização opcional', '200'), parameters: [idParameter] },
    },
    '/diplomacia/tributos/enviar': {
      post: bodyOperation('Diplomacia e Acordos', 'Enviar tributo de vassalagem ou oferenda de paz', 'TributoInput'),
    },
    '/guildas': {
      post: bodyOperation('Guildas e Ofícios', 'Fundar guilda oficial no reino', 'GuildaInput'),
    },
    '/guildas/{id}': {
      get: {
        ...secured('Guildas e Ofícios', 'Consultar guilda'),
        parameters: [idParameter],
        responses: { 200: response('Guilda'), 401: response('Não autenticado'), 403: response('Sem permissão'), 404: response('Não encontrado') },
      },
    },
    '/guildas/{id}/membros': {
      get: listOperation('Guildas e Ofícios', 'Listar membros de uma guilda', [], [idParameter]),
    },
    '/guildas/{id}/encomendas': {
      post: { ...bodyOperation('Guildas e Ofícios', 'Encomendar produção em massa com débito de recursos', 'GuildaEncomendaInput'), parameters: [idParameter] },
    },
    '/leis': {
      get: listOperation('Monarquia e Leis', 'Listar leis do reino', ['titulo', 'reinoId', 'status']),
      post: bodyOperation('Monarquia e Leis', 'Decreta uma nova lei ou decreto', 'LeiInput'),
    },
    '/leis/{id}/revogar': {
      put: {
        ...secured('Monarquia e Leis', 'Revoga ou altera o estado de uma lei ativa', '200'),
        parameters: [idParameter],
      },
    },
    '/impostos/aplicar': {
      post: bodyOperation('Monarquia e Leis', 'Aplica a recolha de impostos respeitando período fiscal', 'ImpostoInput'),
    },
    '/impostos/historico': {
      get: listOperation('Monarquia e Leis', 'Consulta o histórico financeiro de arrecadação de tributos', ['reinoId', 'periodoFiscal']),
    },
    '/castelos': {
      post: bodyOperation('Castelos', 'Registra a construção de um novo castelo', 'CasteloInput'),
    },
    '/castelos/{id}': {
      get: {
        ...secured('Castelos', 'Detalhes de integridade, nível de muralha e guarnição'),
        parameters: [idParameter],
      },
    },
    '/castelos/{id}/melhorar': {
      patch: {
        ...bodyOperation('Castelos', 'Realiza upgrade na infraestrutura consumindo recursos', 'RecursoReinoInput', '200'),
        parameters: [idParameter],
      },
    },
    '/castelos/{id}/reparar': {
      post: {
        ...bodyOperation('Castelos', 'Aplica reparos à estrutura do castelo', 'RecursoReinoInput', '200'),
        parameters: [idParameter],
      },
    },
    '/cidades/{id}/populacao': {
      get: {
        ...secured('População', 'Consulta censo demográfico da cidade'),
        parameters: [idParameter],
      },
    },
    '/cidades/{id}/populacao/mapa-fome': {
      get: {
        ...secured('População', 'Avalia o nível de segurança alimentar e a média de refeições diárias'),
        parameters: [idParameter],
      },
    },
    '/cidades/{id}/populacao/satisfacao': {
      get: {
        ...secured('População', 'Calcula o índice de satisfação popular (0-10) e a chance de revolta'),
        parameters: [idParameter],
      },
    },
    '/agricultura/colheitas': {
      post: bodyOperation('Agricultura', 'Regista a entrada de grãos brutos colhidos', 'ColheitaInput'),
    },
    '/cidades/{id}/agricultura': {
      get: {
        ...secured('Agricultura', 'Consulta produção atual e estoque agrícola da cidade'),
        parameters: [idParameter],
      },
    },
    '/cidades/{id}/suprimentos': {
      get: {
        ...secured('Suprimentos', 'Verifica inventário de alimentos e alerta de reserva mínima'),
        parameters: [idParameter],
      },
    },
    '/cidades/{id}/racoes': {
      get: {
        ...secured('Suprimentos', 'Consulta o estoque exclusivo de rações militares'),
        parameters: [idParameter],
      },
    },
    '/cidades/{id}/suprimentos/converter': {
      put: {
        ...bodyOperation('Suprimentos', 'Converte percentual da colheita em rações militares', 'ConversaoRacaoInput', '200'),
        parameters: [idParameter],
      },
    },
  },
};

module.exports = swaggerJsdoc({ definition, apis: [] });