const suprimentoService = require('../services/suprimento-service');

async function Suprimentos(req, res, next) {
  try {
    const dados = await suprimentoService.VerificarSuprimentos(req.validated.params.id);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

async function Racoes(req, res, next) {
  try {
    const dados = await suprimentoService.ConsultarRacoes(req.validated.params.id);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

async function ConverterRacoes(req, res, next) {
  try {
    const dados = await suprimentoService.ConverterEmRacoes(req.validated.params.id, req.validated.body);
    return res.status(200).json({ data: dados });
  } catch (error) { return next(error); }
}

module.exports = { Suprimentos, Racoes, ConverterRacoes };