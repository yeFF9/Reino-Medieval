const { Router } = require('express');
const controller = require('../controllers/castelo-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
  IdCasteloParam,
  CriarCastelo,
  MelhorarCastelo,
  RepararCastelo,
} = require('../validators/castelos');

const router = Router();

router.use(authenticate);

router.post('/', authorize('castelos:write'), validate(CriarCastelo), controller.Criar);
router.get('/:id', authorize('castelos:read'), validate(IdCasteloParam), controller.ObterDetalhes);
router.patch('/:id/melhorar', authorize('castelos:write'), validate(MelhorarCastelo), controller.Melhorar);
router.post('/:id/reparar', authorize('castelos:write'), validate(RepararCastelo), controller.Reparar);

module.exports = router;