const { Router } = require('express');
const controller = require('../controllers/lei-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  ListarLeis,
  CriarDecretoOuLei,
  IdLeiParam,
  AplicarImposto,
  HistoricoImpostos,
} = require('../validators/leis');

const router = Router();

router.use(authenticate);

router.get('/', authorize('leis:read'), validate(ListarLeis), controller.ListarLeis);
router.post('/', authorize('leis:write'), validate(CriarDecretoOuLei), controller.CriarLei);
router.put('/:id/revogar', authorize('leis:write'), validate(IdLeiParam), controller.RevogarLei);

router.post('/impostos/aplicar', authorize('impostos:write'), validate(AplicarImposto), controller.AplicarImposto);
router.get('/impostos/historico', authorize('impostos:read'), validate(HistoricoImpostos), controller.HistoricoImpostos);

module.exports = router;