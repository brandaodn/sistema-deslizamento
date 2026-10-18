const express = require('express');
const router = express.Router();
const insertionController = require('../controllers/insertion.controller');

// Middleware para verificar autenticação e permissões
const isModeratorOrAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.tipo === 'Curador' || req.session.user.tipo === 'administrador')) {
        return next();
    }
    else if(req.session.user){
        return res.redirect('/movmassa/menu');
    }
    return res.redirect('/movmassa/');
};

router.get('/insercao', isModeratorOrAdmin, insertionController.showInsertionPage);
router.post('/addPais', isModeratorOrAdmin, insertionController.addCountry);
router.post('/addUF', isModeratorOrAdmin, insertionController.addState);
router.post('/addMun', isModeratorOrAdmin, insertionController.addCity);
router.post('/addUser', isModeratorOrAdmin, insertionController.addUser);
router.post('/addEvento', isModeratorOrAdmin, insertionController.addEvent);
router.post('/addMidia', isModeratorOrAdmin, insertionController.addMedia);

module.exports = router;