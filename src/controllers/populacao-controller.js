const populacaoService = require('../services/populacao-service');

async function ObterPopulacao(req, res, next) {
  try {
    const dados = await populacaoService.ObterPopulacao(req.validated.params.id);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

async function MapaFome(req, res, next) {
  try {
    const dados = await populacaoService.ObterMapaFome(req.validated.params.id);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

async function Satisfacao(req, res, next) {
  try {
    const dados = await populacaoService.ObterSatisfacao(req.validated.params.id);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

module.exports = { ObterPopulacao, MapaFome, Satisfacao };