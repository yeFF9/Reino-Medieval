const service = require('../services/tributo-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function getById(req, res) {
  return res.json({ data: await service.getById(req.validated.params.id) });
}

async function balance(req, res) {
  return res.json({ data: await service.balance(req.validated.params.reinoId) });
}

async function refund(req, res) {
  return res.json({ data: await service.refund(req.validated.params.id) });
}

module.exports = { list, getById, balance, refund };
