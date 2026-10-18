const client = require('../db');
const transactionWrapper = require('../utils/dbTransactions');
const { pageCuration, pageSampleCurationAvailable } = require('../utils/menu.utils');

module.exports = {
    showCurationPage: async (req, res, mensagem) => {        
        const dataSelecionada = req.query.data || null;
        return await pageCuration(req, res, null, dataSelecionada);
    },
    showAvailableEventsCurationPage: async (req, res, mensagem) => {        
        return await pageSampleCurationAvailable(req, res, null);
    },
    doCuration: async (req, res, mensagem) => {
        const { idEvento, dataSelecionada, avaliacao, destinoMidia } = req.body;

        const idEventoNumero = Number.parseInt(idEvento, 10);
        const destinoMidiaNumero = Number.parseInt(destinoMidia, 10);

        if (!Number.isInteger(idEventoNumero) || idEventoNumero <= 0) {
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Evento inválido </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${encodeURIComponent(dataSelecionada || '')}`);
        }

        const eventos = await client.query('SELECT esta_validado FROM evento WHERE id_evento = $1', [idEventoNumero]);

        if (eventos.rows.length === 0) {
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Evento não encontrado </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${encodeURIComponent(dataSelecionada || '')}`);
        }

        if(eventos.rows[0].esta_validado === true) {
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Esse evento já passou por Curadoria </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${encodeURIComponent(dataSelecionada || '')}`);
        }

        let mensagemSucesso = "";

        try {
            await transactionWrapper(client, async () => {
                switch (avaliacao) {
                    case "invalido":
                        await client.query('DELETE FROM evento WHERE id_evento = $1', [idEventoNumero]);
                        mensagemSucesso = "Evento inválido deletado com sucesso";
                        break;
                    case "valido":
                        await client.query('UPDATE evento SET esta_validado = true WHERE id_evento = $1', [idEventoNumero]);
                        mensagemSucesso = "Evento validado com sucesso";
                        break;
                    case "repetido":
                        if (Number.isInteger(destinoMidiaNumero) && destinoMidiaNumero > 0) {
                            const destinoExiste = await client.query('SELECT 1 FROM evento WHERE id_evento = $1', [destinoMidiaNumero]);
                            if (destinoExiste.rows.length === 0) {
                                throw new Error("DESTINO_MIDIA_INVALIDO");
                            }
                            await client.query('UPDATE midia SET id_evento = $1 WHERE id_evento = $2', [destinoMidiaNumero, idEventoNumero]);
                        }
                        await client.query('DELETE FROM evento WHERE id_evento = $1', [idEventoNumero]);
                        mensagemSucesso = "Evento repetido deletado com sucesso";
                        break;
                    default:
                        throw new Error("COMANDO_NAO_IDENTIFICADO");
                }
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> ${mensagemSucesso} </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${encodeURIComponent(dataSelecionada || '')}`);
        } catch (error) {
            console.error(error);
            if (["COMANDO_NAO_IDENTIFICADO", "DESTINO_MIDIA_INVALIDO"].includes(error.message)) {
                return res.redirect(`/movmassa/Curadoria/eventos?data=${encodeURIComponent(dataSelecionada || '')}`);
            }

            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao realizar Curadoria de evento </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${encodeURIComponent(dataSelecionada || '')}`);
        }
    }
};