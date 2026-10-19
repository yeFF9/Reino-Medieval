const { Router } = require('express');
const controller = require('../controllers/tributo-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { tributeList, tributeIdParam, tributeBalance } = require('../validators/tributos');

const router = Router();
router.use(authenticate);
router.get('/', authorize('tributos:read'), validate(tributeList), controller.list);
router.get('/balanco/:reinoId', authorize('tributos:read'), validate(tributeBalance), controller.balance);
router.get('/:id', authorize('tributos:read'), validate(tributeIdParam), controller.getById);
router.patch('/:id/estornar', authorize('tributos:write'), validate(tributeIdParam), controller.refund);

module.exports = router;
