const service = require('../services/guerra-service');

async function declare(req, res) {
  return res.status(201).json({ data: await service.declare(req.validated.body) });
}

async function history(req, res) {
  return res.json(await service.history(req.validated.query));
}

module.exports = { declare, history };
