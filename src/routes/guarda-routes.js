const { Router } = require('express');
const controller = require('../controllers/guarda-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createPatrol } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.post('/patrulhas', authorize('guardas:write'), validate(createPatrol), controller.deployPatrol);

module.exports = router;
