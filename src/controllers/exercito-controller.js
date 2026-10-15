const service = require('../services/exercito-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function create(req, res) {
  return res.status(201).json({ data: await service.create(req.validated.body) });
}

async function mobilize(req, res) {
  return res.json({ data: await service.mobilize(req.validated.params.id) });
}

module.exports = { list, create, mobilize };
