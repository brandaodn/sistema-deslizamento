function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }

    return next();
}

function isCuratorOrAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }

    if (req.session.user.tipo === 'Curador' || req.session.user.tipo === 'administrador') {
        return next();
    }

    return res.redirect('/movmassa/menu');
}

function isAdmin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }

    if (req.session.user.tipo === 'administrador') {
        return next();
    }

    return res.redirect('/movmassa/menu');
}

module.exports = { isAuthenticated, isCuratorOrAdmin, isAdmin };
