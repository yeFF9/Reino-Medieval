const { Router } = require('express');
const controller = require('../controllers/membro-guilda-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { memberList, createMember, transferMember, memberIdParam } = require('../validators/membros-guilda');

const router = Router();
router.use(authenticate);
router.get('/', authorize('guildas:read'), validate(memberList), controller.list);
router.post('/', authorize('guildas:write'), validate(createMember), controller.create);
router.patch('/:id/transferir', authorize('guildas:write'), validate(transferMember), controller.transfer);
router.delete('/:id', authorize('guildas:write'), validate(memberIdParam), controller.remove);

module.exports = router;
