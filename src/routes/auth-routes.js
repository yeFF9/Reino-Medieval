const { Router } = require('express');
const controller = require('../controllers/auth-controller');
const validate = require('../middlewares/validate');
const { loginSchema, registerSchema } = require('../validators/auth');

const router = Router();
router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);

module.exports = router;
