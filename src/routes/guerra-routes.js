const { Router } = require('express');
const controller = require('../controllers/guerra-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { declareWar, warHistory, finalizeWar } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.post('/declarar', authorize('guerras:write'), validate(declareWar), controller.declare);
router.get('/historico', authorize('guerras:read'), validate(warHistory), controller.history);
router.patch('/:id/finalizar', authorize('guerras:write'), validate(finalizeWar), controller.finalize);

module.exports = router;
