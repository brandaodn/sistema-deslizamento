const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');

router.get('/menu', isAuthenticated, menuController.showMenu);
router.post('/mudSenha', isAuthenticated, menuController.changePassword);

module.exports = router;
