const Router = require('express');
const router = new Router();
const OrdersController = require('../controllers/orders.controller');

router.post('/order', OrdersController.createOrders);
router.get('/log', OrdersController.getOrdersLog);
router.get('/order', OrdersController.getOneOrder);
router.get('/list', OrdersController.getOrders);
router.put('/order/loading-status', OrdersController.updateOrderLoadingStatus);
router.delete('/order', OrdersController.deleteOrderByOrderID);
router.delete('/place', OrdersController.deleteOrderByPlaceID);

module.exports = router;
