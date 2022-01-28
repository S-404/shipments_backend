const Router = require('express');
const router = new Router();
const GatesController = require('../controllers/gates.controller');

router.post('/gate', GatesController.createGate);
router.get('/list', GatesController.getGates);
router.put('/gate', GatesController.updateGate);
router.delete('/gate', GatesController.deleteGate);

module.exports = router;
