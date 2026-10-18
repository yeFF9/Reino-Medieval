const service = require('../services/diplomacia-service');

async function createPact(req, res) {
  return res.status(201).json({ data: await service.createPact(req.validated.body) });
}

async function listPacts(req, res) {
  return res.json(await service.listPacts(req.validated.params.reinoId, req.validated.query));
}

async function breakPact(req, res) {
  return res.json({ data: await service.breakPact(req.validated.params.id, req.validated.body) });
}

async function sendTribute(req, res) {
  return res.status(201).json({ data: await service.sendTribute(req.validated.body) });
}

module.exports = { createPact, listPacts, breakPact, sendTribute };
