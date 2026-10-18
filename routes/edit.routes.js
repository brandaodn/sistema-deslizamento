const express = require('express');
const router = express.Router();
const editController = require('../controllers/edit.controller');
const { isCuratorOrAdmin } = require('../middlewares/auth.middleware');

router.get('/edicao', isCuratorOrAdmin, editController.showEditPage);
router.post('/editPais', isCuratorOrAdmin, editController.editCountry);
router.post('/editUF', isCuratorOrAdmin, editController.editState);
router.post('/editMun', isCuratorOrAdmin, editController.editCity);
router.post('/editEvento', isCuratorOrAdmin, editController.editEvent);
router.post('/editMidia', isCuratorOrAdmin, editController.editMedia);

module.exports = router;
