const service = require('../services/guilda-service');

async function create(req, res) {
  return res.status(201).json({ data: await service.create(req.validated.body) });
}

async function getById(req, res) {
  return res.json({ data: await service.getById(req.validated.params.id) });
}

async function listMembers(req, res) {
  return res.json(await service.listMembers(req.validated.params.id, req.validated.query));
}

async function createOrder(req, res) {
  return res.status(201).json({ data: await service.createOrder(req.validated.params.id, req.validated.body) });
}

module.exports = { create, getById, listMembers, createOrder };
