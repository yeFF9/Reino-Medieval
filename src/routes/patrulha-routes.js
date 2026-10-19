const { Router } = require('express');
const controller = require('../controllers/patrulha-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { patrolList, reinforcePatrol, patrolIdParam } = require('../validators/patrulhas');

const router = Router();
router.use(authenticate);
router.get('/', authorize('guardas:read'), validate(patrolList), controller.list);
router.patch('/:id/reforcar', authorize('guardas:write'), validate(reinforcePatrol), controller.reinforce);
router.patch('/:id/encerrar', authorize('guardas:write'), validate(patrolIdParam), controller.close);

module.exports = router;
