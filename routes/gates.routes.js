const Router = require('express');
const router = new Router();
const GatesController = require('../controllers/gates.controller');

router.post('/gates/gate', GatesController.createGate);
router.get('/gates/list', GatesController.getGates);
router.put('/gates/gate', GatesController.updateGate);
router.delete('/gates/gate', GatesController.deleteGate);

module.exports = router;
