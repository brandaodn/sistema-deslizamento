const express = require('express');
const router = express.Router();
const editController = require('../controllers/edit.controller');

const isModeratorOrAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.tipo === 'Curador' || req.session.user.tipo === 'administrador')) {
        return next();
    }
    else if(req.session.user){
        return res.redirect('/movmassa/menu');
    }
    return res.redirect('/movmassa/');
};

router.get('/edicao', isModeratorOrAdmin, editController.showEditPage);
router.post('/editPais', isModeratorOrAdmin, editController.editCountry);
router.post('/editUF', isModeratorOrAdmin, editController.editState);
router.post('/editMun', isModeratorOrAdmin, editController.editCity);
router.post('/editEvento', isModeratorOrAdmin, editController.editEvent);
router.post('/editMidia', isModeratorOrAdmin, editController.editMedia);

module.exports = router;