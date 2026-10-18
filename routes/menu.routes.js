const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }
    
    return next();
};

router.get('/menu', isAuthenticated, menuController.showMenu);
router.post('/mudSenha', isAuthenticated, menuController.changePassword);

module.exports = router;