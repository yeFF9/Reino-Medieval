const casteloService = require('../services/castelo-service');

async function Criar(req, res, next) {
  try {
    const castelo = await casteloService.CriarCastelo(req.validated.body);
    return res.status(201).json({ data: castelo });
  } catch (error) {
    return next(error);
  }
}

async function ObterDetalhes(req, res, next) {
  try {
    const castelo = await casteloService.ObterDetalhesCastelo(req.validated.params.id);
    return res.status(200).json({ data: castelo });
  } catch (error) {
    return next(error);
  }
}

async function Melhorar(req, res, next) {
  try {
    const casteloMelhorado = await casteloService.MelhorarInfraestruturaCastelo(
      req.validated.params.id,
      req.validated.body
    );
    return res.status(200).json({ data: casteloMelhorado });
  } catch (error) {
    return next(error);
  }
}

async function Reparar(req, res, next) {
  try {
    const casteloReparado = await casteloService.RepararEstruturaCastelo(
      req.validated.params.id,
      req.validated.body
    );
    return res.status(200).json({ data: casteloReparado });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  Criar,
  ObterDetalhes,
  Melhorar,
  Reparar,
};