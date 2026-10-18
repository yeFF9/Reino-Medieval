const { z, uuid } = require('./common');

const IdCidadeParam = z.object({
  params: z.object({ id: uuid }),
});

module.exports = {
  IdCidadeParam,
};