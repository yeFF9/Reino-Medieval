const { Router } = require('express');
const controller = require('../controllers/cidade-controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { cityList, createCity } = require('../validators/resources');

const router = Router();
router.use(authenticate);
router.get('/', authorize('cidades:read'), validate(cityList), controller.list);
router.post('/', authorize('cidades:write'), validate(createCity), controller.create);

module.exports = router;
