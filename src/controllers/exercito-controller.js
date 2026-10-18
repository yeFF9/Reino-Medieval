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

async function desmobilizar(req, res) {
  return res.json({ data: await service.desmobilizar(req.validated.params.id) });
}

async function designarComandante(req, res) {
  return res.json({ data: await service.designarComandante(req.validated.params.id, req.validated.body) });
}

module.exports = { list, create, mobilize, desmobilizar, designarComandante };
