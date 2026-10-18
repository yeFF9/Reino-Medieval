const agriculturaService = require('../services/agricultura-service');

async function Colheita(req, res, next) {
  try {
    const resultado = await agriculturaService.RegistarColheita(req.validated.body);
    return res.status(201).json({ data: resultado });
  } catch (error) { return next(error); }
}

async function ObterAgricultura(req, res, next) {
  try {
    const dados = await agriculturaService.ObterAgricultura(req.validated.params.id);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

module.exports = { Colheita, ObterAgricultura };