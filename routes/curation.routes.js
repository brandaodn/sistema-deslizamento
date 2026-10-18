const express = require('express');
const router = express.Router();
const curationController = require('../controllers/curation.controller');
const { isCuratorOrAdmin } = require('../middlewares/auth.middleware');

router.get('/Curadoria/eventos', isCuratorOrAdmin, curationController.showCurationPage);
router.get('/Curadoria/selecao', isCuratorOrAdmin, curationController.showAvailableEventsCurationPage);
router.post('/realizar-Curadoria', isCuratorOrAdmin, curationController.doCuration);

module.exports = router;
