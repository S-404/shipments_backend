const Router = require('express');
const router = new Router();
const PlacesController = require('../controllers/places.controller');

router.post('/place', PlacesController.createPlace);
router.get('/list', PlacesController.getPlaces);
router.put('/place', PlacesController.updatePlace);
router.put('/status', PlacesController.updatePlaceStatus);
router.put('/truck', PlacesController.updatePlaceTruck);
router.put('/loadingtime', PlacesController.updatePlaceLoadingTime);
router.delete('/place', PlacesController.deletePlace);

module.exports = router;
