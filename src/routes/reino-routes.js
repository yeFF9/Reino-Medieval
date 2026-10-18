const { Router } = require('express');
const controller = require('../controllers/reino-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { reinoList, createReino, idParam, updateEconomy } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.get('/', authorize('reinos:read'), validate(reinoList), controller.list);
router.post('/', authorize('reinos:write'), validate(createReino), controller.create);
router.get('/:id/economia', authorize('economia:read'), validate(idParam), controller.getEconomy);
router.patch('/:id/economia', authorize('economia:write'), validate(updateEconomy), controller.updateEconomy);
router.get('/:id', authorize('reinos:read'), validate(idParam), controller.getById);

module.exports = router;
