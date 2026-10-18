const { Router } = require('express');
const controller = require('../controllers/exercito-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { armyList, createArmy, mobilizeArmy, armyIdParam, assignCommander } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.get('/', authorize('exercitos:read'), validate(armyList), controller.list);
router.post('/', authorize('exercitos:write'), validate(createArmy), controller.create);
router.patch('/:id/mobilizar', authorize('exercitos:write'), validate(mobilizeArmy), controller.mobilize);
router.patch('/:id/desmobilizar', authorize('exercitos:write'), validate(armyIdParam), controller.desmobilizar);
router.patch('/:id/designar-comandante', authorize('exercitos:write'), validate(assignCommander), controller.designarComandante);

module.exports = router;
