const express = require('express');
const router = express.Router();
const curationController = require('../controllers/curation.controller');

const isModeratorOrAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.tipo === 'Curador' || req.session.user.tipo === 'administrador')) {
        return next();
    }
    else if(req.session.user){
        return res.redirect('/movmassa/menu');
    }
    return res.redirect('/movmassa/');
};

router.get('/Curadoria/eventos', isModeratorOrAdmin, curationController.showCurationPage);
router.get('/Curadoria/selecao', isModeratorOrAdmin, curationController.showAvailableEventsCurationPage);
router.post('/realizar-Curadoria', isModeratorOrAdmin, curationController.doCuration);
module.exports = router;