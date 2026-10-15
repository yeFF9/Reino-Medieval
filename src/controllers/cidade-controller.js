const service = require('../services/cidade-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function create(req, res) {
  return res.status(201).json({ data: await service.create(req.validated.body) });
}

module.exports = { list, create };
