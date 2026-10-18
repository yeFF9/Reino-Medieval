const { Router } = require('express');
const controller = require('../controllers/agricultura-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { IdCidadeParam, CriarColheita } = require('../validators/agriculturas');

const router = Router();
router.use(authenticate);

router.post('/agricultura/colheitas', authorize('cidades:write'), validate(CriarColheita), controller.Colheita);
router.get('/cidades/:id/agricultura', authorize('cidades:read'), validate(IdCidadeParam), controller.ObterAgricultura);

module.exports = router;