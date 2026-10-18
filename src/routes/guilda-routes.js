const { Router } = require('express');
const controller = require('../controllers/guilda-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { createGuild, guildIdParam, guildMembers, createGuildOrder } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.post('/', authorize('guildas:write'), validate(createGuild), controller.create);
router.get('/:id', authorize('guildas:read'), validate(guildIdParam), controller.getById);
router.get('/:id/membros', authorize('guildas:read'), validate(guildMembers), controller.listMembers);
router.post('/:id/encomendas', authorize('guildas:write'), validate(createGuildOrder), controller.createOrder);

module.exports = router;
