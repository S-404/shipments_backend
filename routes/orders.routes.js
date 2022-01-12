const Router = require('express');
const router = new Router();
const OrdersController = require('../controllers/orders.controller');

router.post('/orders/order', OrdersController.createOrders);
router.get('/orders/order', OrdersController.getOneOrder);
router.get('/orders/list', OrdersController.getOrders);
router.delete('/orders/order', OrdersController.deleteOrderByOrderID);
router.delete('/orders/place', OrdersController.deleteOrderByPlaceID);

module.exports = router;
