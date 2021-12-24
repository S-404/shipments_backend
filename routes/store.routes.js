const Router = require('express');
const router = new Router();
const StoreController = require('../controllers/store.controller');

router.post('/orders', StoreController.addOrders);
router.get('/orders/list', StoreController.getOrders);
router.get('/gates', StoreController.getGates);
router.get('/orders/gates', StoreController.getGatesOverview);
router.put('/gates/gate/status', StoreController.updateGateStatus);
router.delete('/orders/order', StoreController.deleteOrder);
router.delete('/orders/gate', StoreController.deleteGateOrders);

module.exports = router;
