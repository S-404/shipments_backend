const Router = require('express');
const router = new Router();
const OrdersController = require('../controllers/orders.controller');

router.post('/order', OrdersController.createOrders);
router.post('/defer',OrdersController.deferOrder);
router.get('/defer',OrdersController.getDeferredOrders);
router.get('/log', OrdersController.getOrdersLog);
router.get('/location/:criteria', OrdersController.getOrderLocation);
router.get('/list', OrdersController.getOrders);
router.put('/order/loading-status', OrdersController.updateOrderLoadingStatus);
router.put('/order/picked-status', OrdersController.updateOrderPickedStatus);
router.put('/order/position', OrdersController.updateOrderPosition);
router.delete('/order', OrdersController.deleteOrderByOrderID);
router.delete('/place', OrdersController.deleteOrderByPlaceID);

module.exports = router;
