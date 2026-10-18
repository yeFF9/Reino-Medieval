const { Router } = require('express');
const controller = require('../controllers/diplomacia-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createPact, listPacts, breakPact, sendTribute } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.post('/pactos', authorize('diplomacia:write'), validate(createPact), controller.createPact);
router.get('/pactos/:reinoId', authorize('diplomacia:read'), validate(listPacts), controller.listPacts);
router.delete('/pactos/:id/romper', authorize('diplomacia:write'), validate(breakPact), controller.breakPact);
router.post('/tributos/enviar', authorize('diplomacia:write'), validate(sendTribute), controller.sendTribute);

module.exports = router;
