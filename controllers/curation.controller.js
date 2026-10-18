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

        const eventos = await client.query(`SELECT esta_validado FROM evento WHERE id_evento = ${idEvento}`);

        if(eventos.rows[0].esta_validado === true) {
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Esse evento já passou por Curadoria </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${dataSelecionada}`);
        }

        var comandoSQL = "";
        var mensagemSucesso = "";
        
        switch (avaliacao) {
            case "invalido":
                comandoSQL = `DELETE FROM evento WHERE id_evento = ${idEvento}`;
                mensagemSucesso = "Evento inválido deletado com sucesso";
            break;
            case "valido":
                comandoSQL = `UPDATE evento SET esta_validado = true WHERE id_evento = ${idEvento}`;
                mensagemSucesso = "Evento validado com sucesso";
            break;
            case "repetido":
                if (destinoMidia != -1) {
                    comandoSQL += `UPDATE midia SET id_evento = ${destinoMidia} WHERE id_evento = ${idEvento};\n`;
                }
                comandoSQL += `DELETE FROM evento WHERE id_evento = ${idEvento};`;
                mensagemSucesso = "Evento repetido deletado com sucesso";
            break;
        }

        try {
            await transactionWrapper(client, async () => {
                if (comandoSQL === "") {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Avaliação não identificada </p></div>`;
                    throw new Error("COMANDO_NAO_IDENTIFICADO");
                }

                await client.query(comandoSQL);
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> ${mensagemSucesso} </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${dataSelecionada}`);
        } catch (error) {
            console.error(error);
            if (error.message === "COMANDO_NAO_IDENTIFICADO") {
                return res.redirect(`/movmassa/Curadoria/eventos?data=${dataSelecionada}`);
            }

            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao realizar Curadoria de evento </p></div>`;
            return res.redirect(`/movmassa/Curadoria/eventos?data=${dataSelecionada}`);
        }
    }
};