const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rotas de autenticação
router.get('/', authController.showLogin);
router.get('/register', authController.showRegister);
router.post('/login', authController.login);
router.post('/cadUser', authController.register);
router.post('/logout', authController.logout);

module.exports = router;