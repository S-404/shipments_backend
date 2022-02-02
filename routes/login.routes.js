const Router = require('express');
const router = new Router();
const LoginController = require('../controllers/login.controller');

router.post('/user', LoginController.createUser);
router.get('/user/checkpassword', LoginController.checkPassword);
router.get('/users', LoginController.getUserList);
router.put('/user/access', LoginController.updateUserAccess);
router.put('/user/password', LoginController.updateUserPassword);
router.delete('/user', LoginController.deleteUser);

module.exports = router;
