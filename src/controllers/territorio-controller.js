const service = require('../services/territorio-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function create(req, res) {
  return res.status(201).json({ data: await service.create(req.validated.body) });
}

async function update(req, res) {
  return res.json({ data: await service.update(req.validated.params.id, req.validated.body) });
}

module.exports = { list, create, update };
