const { Router } = require('express');
const controller = require('../controllers/suprimento-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { IdCidadeParam, ConverterRacao } = require('../validators/suprimentos');

const router = Router();
router.use(authenticate);

router.get('/cidades/:id/suprimentos', authorize('cidades:read'), validate(IdCidadeParam), controller.Suprimentos);
router.get('/cidades/:id/racoes', authorize('cidades:read'), validate(IdCidadeParam), controller.Racoes);
router.put('/cidades/:id/suprimentos/converter', authorize('cidades:write'), validate(ConverterRacao), controller.ConverterRacoes);

module.exports = router;