const service = require('../services/guarda-service');

async function deployPatrol(req, res) {
  return res.status(201).json({ data: await service.deployPatrol(req.validated.body) });
}

module.exports = { deployPatrol };
