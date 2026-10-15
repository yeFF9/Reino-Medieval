const { Router } = require('express');
const controller = require('../controllers/reino-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { reinoList, createReino, idParam } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.get('/', authorize('reinos:read'), validate(reinoList), controller.list);
router.post('/', authorize('reinos:write'), validate(createReino), controller.create);
router.get('/:id', authorize('reinos:read'), validate(idParam), controller.getById);

module.exports = router;
