const { Router } = require('express');
const controller = require('../controllers/territorio-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { listTerritoriesSchema, createTerritorySchema, updateTerritorySchema } = require('../validators/territorios');

const router = Router();
router.use(authenticate);
router.get('/', authorize('territorios:read'), validate(listTerritoriesSchema), controller.list);
router.post('/', authorize('territorios:write'), validate(createTerritorySchema), controller.create);
router.put('/:id', authorize('territorios:write'), validate(updateTerritorySchema), controller.update);

module.exports = router;
