const client = require('../db');
const { pageMap, pageMapEventDetails } = require('../utils/menu.utils');

module.exports = {
    showMapEventDetailsPage: async (req, res, mensagem) => {        
        const idSelecionado = req.query.evento || null;
        return await pageMapEventDetails(req, res, null, idSelecionado);
    },
    showMapPage: async (req, res, mensagem) => {        
        return await pageMap(req, res, null);
    },
    setIdToViewDetails: async (req, res, mensagem) => {
        const { idEvento } = req.body;

        if (!idEvento) {
            req.session.mensagem = `<div class="alert alert-warning text-center" role="alert"><p> Selecione um evento para visualizar os detalhes </p></div>`;
            return res.redirect('/movmassa/visualizar-eventos?');
        }

        const idEventoNumero = Number.parseInt(idEvento, 10);
        if (!Number.isInteger(idEventoNumero) || idEventoNumero <= 0) {
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Evento inválido </p></div>`;
            return res.redirect('/movmassa/visualizar-eventos?');
        }

        const eventos = await client.query('SELECT 1 FROM evento WHERE id_evento = $1', [idEventoNumero]);

        if(eventos.rows.length === 0) {
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Esse evento foi alterado ou deletado do sistema </p></div>`;
            return res.redirect('/movmassa/visualizar-eventos?');
        }
        
        return res.redirect(`/movmassa/mais-detalhes?evento=${idEventoNumero}`);    
    },
    createCSV: async (req, res, mensagem) => {
        const campos = Object.assign({}, req.body);
        delete campos.idEvento;
        delete campos.idMunicipioEvento;

        const csv = gerarCSV(campos);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="evento.csv"');
        return res.send("\uFEFF" + csv);  
    }
};

function gerarCSV(obj) {
    const keys = Object.keys(obj);

    const row = keys.map(key => {
        const v = obj[key];

        const convertKeys = ["longitudeEvento", "latitudeEvento"];

        if (convertKeys.includes(key)) {
            return `="${v}"`;
        }

        return `"${v == null ? '' : v}"`;
    }).join(";");

    return `${keys.join(";")}\n${row}`;
}
