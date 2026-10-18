const service = require('../services/guerra-service');

async function declare(req, res) {
  return res.status(201).json({ data: await service.declare(req.validated.body) });
}

async function history(req, res) {
  return res.json(await service.history(req.validated.query));
}

async function finalize(req, res) {
  return res.json({
    data: await service.finalize({ guerraId: req.validated.params.id, vencedorId: req.validated.body.vencedorId }),
  });
}

module.exports = { declare, history, finalize };
