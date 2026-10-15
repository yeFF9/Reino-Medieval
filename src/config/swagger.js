const swaggerJsdoc = require('swagger-jsdoc');

const listParameters = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
];
const bearer = [{ bearerAuth: [] }];
const response = (description) => ({ description });
const listOperation = (tag, summary, filters) => ({
  tags: [tag],
  summary,
  security: bearer,
  parameters: [...listParameters, ...filters.map((filter) => ({ name: filter, in: 'query', schema: { type: 'string' } }))],
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
    '/guerras/declarar': { post: bodyOperation('Guerras e Diplomacia', 'Declarar guerra respeitando pactos de não agressão', 'GuerraInput') },
    '/guerras/historico': { get: listOperation('Guerras e Diplomacia', 'Consultar histórico de guerras', ['reinoId', 'status']) },
  },
};

module.exports = swaggerJsdoc({ definition, apis: [] });
