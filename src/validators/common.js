const { z } = require('zod');

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

const uuid = z.string().uuid('Informe um identificador UUID válido');
const listQuery = z.object(pagination).passthrough();
const paramsWithId = z.object({ id: uuid });

module.exports = { z, pagination, uuid, listQuery, paramsWithId };
