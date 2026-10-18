const { Router } = require('express');
const controller = require('../controllers/comandante-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { commanderList, createCommander, promoteCommander, idParam } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.get('/', authorize('comandantes:read'), validate(commanderList), controller.list);
router.post('/', authorize('comandantes:write'), validate(createCommander), controller.create);
router.get('/:id', authorize('comandantes:read'), validate(idParam), controller.getById);
router.patch('/:id/promover', authorize('comandantes:write'), validate(promoteCommander), controller.promote);

module.exports = router;
