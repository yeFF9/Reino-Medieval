const { Router } = require('express');
const controller = require('../controllers/exercito-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { armyList, createArmy, mobilizeArmy } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.get('/', authorize('exercitos:read'), validate(armyList), controller.list);
router.post('/', authorize('exercitos:write'), validate(createArmy), controller.create);
router.patch('/:id/mobilizar', authorize('exercitos:write'), validate(mobilizeArmy), controller.mobilize);

module.exports = router;
