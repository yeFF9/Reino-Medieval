const service = require('../services/patrulha-service');

async function list(req, res) {
  return res.json(await service.list(req.validated.query));
}

async function reinforce(req, res) {
  return res.json({ data: await service.reinforce(req.validated.params.id, req.validated.body) });
}

async function close(req, res) {
  return res.json({ data: await service.close(req.validated.params.id) });
}

module.exports = { list, reinforce, close };
