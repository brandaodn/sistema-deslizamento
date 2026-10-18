const express = require('express');
const router = express.Router();
const insertionController = require('../controllers/insertion.controller');
const { isCuratorOrAdmin } = require('../middlewares/auth.middleware');

router.get('/insercao', isCuratorOrAdmin, insertionController.showInsertionPage);
router.post('/addPais', isCuratorOrAdmin, insertionController.addCountry);
router.post('/addUF', isCuratorOrAdmin, insertionController.addState);
router.post('/addMun', isCuratorOrAdmin, insertionController.addCity);
router.post('/addUser', isCuratorOrAdmin, insertionController.addUser);
router.post('/addEvento', isCuratorOrAdmin, insertionController.addEvent);
router.post('/addMidia', isCuratorOrAdmin, insertionController.addMedia);

module.exports = router;
