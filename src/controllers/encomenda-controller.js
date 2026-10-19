const service = require('../services/encomenda-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function getById(req, res) {
  return res.json({ data: await service.getById(req.validated.params.id) });
}

async function complete(req, res) {
  return res.json({ data: await service.complete(req.validated.params.id) });
}

async function cancel(req, res) {
  return res.json({ data: await service.cancel(req.validated.params.id) });
}

module.exports = { list, getById, complete, cancel };
