const { Router } = require('express');
const controller = require('../controllers/encomenda-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { orderList, orderIdParam } = require('../validators/encomendas');

const router = Router();
router.use(authenticate);
router.get('/', authorize('guildas:read'), validate(orderList), controller.list);
router.get('/:id', authorize('guildas:read'), validate(orderIdParam), controller.getById);
router.patch('/:id/concluir', authorize('guildas:write'), validate(orderIdParam), controller.complete);
router.patch('/:id/cancelar', authorize('guildas:write'), validate(orderIdParam), controller.cancel);

module.exports = router;
