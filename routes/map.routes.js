const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }
    
    return next();
};

router.get('/visualizar-eventos', isAuthenticated, mapController.showMapPage);
router.get('/mais-detalhes', isAuthenticated, mapController.showMapEventDetailsPage);
router.post('/ver-detalhes', isAuthenticated, mapController.setIdToViewDetails);
router.post('/gerarCSV', isAuthenticated, mapController.createCSV );
module.exports = router;