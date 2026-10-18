const { Router } = require('express');
const controller = require('../controllers/populacao-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { IdCidadeParam } = require('../validators/populacoes');

const router = Router();
router.use(authenticate);

router.get('/cidades/:id/populacao', authorize('cidades:read'), validate(IdCidadeParam), controller.ObterPopulacao);
router.get('/cidades/:id/populacao/mapa-fome', authorize('cidades:read'), validate(IdCidadeParam), controller.MapaFome);
router.get('/cidades/:id/populacao/satisfacao', authorize('cidades:read'), validate(IdCidadeParam), controller.Satisfacao);

module.exports = router;