const service = require('../services/membro-guilda-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function create(req, res) {
  return res.status(201).json({ data: await service.create(req.validated.body) });
}

async function transfer(req, res) {
  return res.json({ data: await service.transfer(req.validated.params.id, req.validated.body) });
}

async function remove(req, res) {
  return res.json({ data: await service.remove(req.validated.params.id) });
}

module.exports = { list, create, transfer, remove };
