const service = require('../services/reino-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function create(req, res) {
  return res.status(201).json({ data: await service.create(req.validated.body) });
}

async function getById(req, res) {
  return res.json({ data: await service.getById(req.validated.params.id) });
}

module.exports = { list, create, getById };
