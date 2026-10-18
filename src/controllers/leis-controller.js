const leiService = require('../services/lei-service');

async function ListarLeis(req, res, next) {
  try {
    const resultado = await leiService.ListarLeisDoReino(req.validated.query);
    return res.status(200).json(resultado);
  } catch (error) {
    return next(error);
  }
}

async function CriarLei(req, res, next) {
  try {
    const novaLei = await leiService.CriarDecretoOuLei(req.validated.body);
    return res.status(201).json({ data: novaLei });
  } catch (error) {
    return next(error);
  }
}

async function RevogarLei(req, res, next) {
  try {
    const leiRevogada = await leiService.RevogarLeiOuDecreto(req.validated.params.id);
    return res.status(200).json({ data: leiRevogada });
  } catch (error) {
    return next(error);
  }
}

async function AplicarImposto(req, res, next) {
  try {
    const impostoAplicado = await leiService.AplicarImpostoDoReino(req.validated.body);
    return res.status(201).json({ data: impostoAplicado });
  } catch (error) {
    return next(error);
  }
}

async function HistoricoImpostos(req, res, next) {
  try {
    const historico = await leiService.ConsultarHistoricoImpostos(req.validated.query);
    return res.status(200).json(historico);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ListarLeis,
  CriarLei,
  RevogarLei,
  AplicarImposto,
  HistoricoImpostos,
};