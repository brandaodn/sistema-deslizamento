const client = require('../db');
const { validarCampos, processCheckboxes } = require('../utils/utils');
const transactionWrapper = require('../utils/dbTransactions');
const { pageEdit } = require('../utils/menu.utils');
const { validarDataMenorQueHoje } = require('../utils/date.utils');

module.exports = {
    showEditPage: async (req, res, mensagem) => {
        return await pageEdit(req, res, null);
    },

    editCountry: async (req, res) => {
        const { idPais, nomePais } = req.body;

        try {
            await transactionWrapper(client, async () => {
                const current = await client.query(
                    "SELECT * FROM pais WHERE id_pais = $1",
                    [idPais]
                );

                if (current.rows.length === 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> País não encontrado </p></div>`;
                    throw new Error("PAIS_NAO_ENCONTRADO");
                }

                const duplicate = await client.query(
                    "SELECT * FROM pais WHERE LOWER(nome_pais) = LOWER($1) AND id_pais <> $2",
                    [nomePais, idPais]
                );

                if (duplicate.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Este País já está cadastrado com esse nome </p></div>`;
                    throw new Error("PAIS_DUPLICADO");
                }

                await client.query(
                    "UPDATE pais SET nome_pais = $1 WHERE id_pais = $2",
                    [nomePais, idPais]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> País atualizado com sucesso para '${nomePais}' </p></div>`;
            return res.redirect('/movmassa/edicao');

        } catch (error) {
            if (error.message === "PAIS_NAO_ENCONTRADO" || error.message === "PAIS_DUPLICADO") {
                return res.redirect('/movmassa/edicao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao editar país </p></div>`;
            return res.redirect('/movmassa/edicao');
        }
    },

    editState: async (req, res) => {
        const { idUF, nomeUF, idPaisUF } = req.body;

        try {
            await transactionWrapper(client, async () => {
                const current = await client.query(
                    'SELECT * FROM uf WHERE id_uf = $1',
                    [idUF]
                );

                if (current.rows.length === 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> UF não encontrada </p></div>`;
                    throw new Error("UF_NAO_ENCONTRADA");
                }

                const duplicate = await client.query(
                    'SELECT * FROM uf WHERE nome_uf = $1 AND id_pais = $2 AND id_uf <> $3',
                    [nomeUF, idPaisUF, idUF]
                );

                if (duplicate.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Esta UF já está cadastrada nesse país </p></div>`;
                    throw new Error("UF_DUPLICADA");
                }

                await client.query(
                    "UPDATE uf SET nome_uf = LOWER($1), id_pais = $2 WHERE id_uf = $3",
                    [nomeUF, idPaisUF, idUF]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> UF '${nomeUF}' atualizada com sucesso </p></div>`;
            return res.redirect('/movmassa/edicao');

        } catch (error) {
            if (error.message === "UF_NAO_ENCONTRADA" || error.message === "UF_DUPLICADA") {
                return res.redirect('/movmassa/edicao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao editar UF </p></div>`;
            return res.redirect('/movmassa/edicao');
        }
    },

    editCity: async (req, res) => {
        const { idMunicipio, nomeMunicipio, idEstadoMunicipio } = req.body;

        try {
            await transactionWrapper(client, async () => {
                const current = await client.query(
                    "SELECT * FROM municipio WHERE id_municipio = $1",
                    [idMunicipio]
                );

                if (current.rows.length === 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Município não encontrado </p></div>`;
                    throw new Error("MUNICIPIO_NAO_ENCONTRADO");
                }

                const duplicate = await client.query(
                    "SELECT * FROM municipio WHERE LOWER(nome_municipio) = LOWER($1) AND id_uf = $2 AND id_municipio <> $3",
                    [nomeMunicipio, idEstadoMunicipio, idMunicipio]
                );

                if (duplicate.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Este município já está cadastrado nessa UF </p></div>`;
                    throw new Error("MUNICIPIO_DUPLICADO");
                }

                await client.query(
                    "UPDATE municipio SET nome_municipio = $1, id_uf = $2 WHERE id_municipio = $3",
                    [nomeMunicipio, idEstadoMunicipio, idMunicipio]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> Município atualizado com sucesso para '${nomeMunicipio}' </p></div>`;
            return res.redirect('/movmassa/edicao');

        } catch (error) {
            if (error.message === "MUNICIPIO_NAO_ENCONTRADO" || error.message === "MUNICIPIO_DUPLICADO") {
                return res.redirect('/movmassa/edicao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao editar município </p></div>`;
            return res.redirect('/movmassa/edicao');
        }
    },

    editEvent: async (req, res) => {
        let { idEvento, descricaoTipo, categoriaTipo, materialDominanteTipo, velocidadeTipo, dataEvento, longitudeEvento, latitudeEvento, 
            idMunicipioEvento, tempoRecuperacaoSocial, servicosEssenciaisAfetados, nFamiliasAfetadas,
            nDesalojados, nDesaparecidos, nMortos, nFeridos, nDesabrigados, seguroCobertura, custoRecuperacao, danoPatrimonioPrivado, 
            danoPatrimonioPublico, danoEconomicoTotal, duracaoInterrupcaoEconomica, setoresAfetados, danosAgricolasValorEstimado, 
            danosAgricolasAreaAtingida, danosAgricolasPercentualAreaAtingida, danosAgricolasCulturaAtingida, areaAtingida, custoMitigacao,
            recursosAfetados, danosBiodiversidade, tipoImpactoAmbiental, tempoRecuperacaoAmbiental, statusRecuperacaoAmbiental, vento,
            precipitacaoEvento, precipitacao5d, precipitacao10d, precipitacaoMensal, temperatura, etp, pressaoAtm, escavacao, mineracao, sobrecarga, 
            tipoUso, tipoRocha, composicao, estrutura, idade, tectonismo, declividade, altitude, orientacao, curvaturaHorizontal, 
            curvaturaVertical, urlPedologia, classeSolo, profundidade, textura, porosidade, uvcc, uvEvento, cad, k  
        } = req.body;

        const campos = { descricaoTipo, categoriaTipo, materialDominanteTipo, velocidadeTipo, dataEvento, longitudeEvento, latitudeEvento, 
            idMunicipioEvento, tempoRecuperacaoSocial, servicosEssenciaisAfetados, nFamiliasAfetadas,
            nDesalojados, nDesaparecidos, nMortos, nFeridos, nDesabrigados, seguroCobertura, custoRecuperacao, danoPatrimonioPrivado, 
            danoPatrimonioPublico, danoEconomicoTotal, duracaoInterrupcaoEconomica, setoresAfetados, danosAgricolasValorEstimado, 
            danosAgricolasAreaAtingida, danosAgricolasPercentualAreaAtingida, danosAgricolasCulturaAtingida, areaAtingida, custoMitigacao,
            recursosAfetados, danosBiodiversidade, tipoImpactoAmbiental, tempoRecuperacaoAmbiental, statusRecuperacaoAmbiental, vento,
            precipitacaoEvento, precipitacao5d, precipitacao10d, precipitacaoMensal, temperatura, etp, pressaoAtm, escavacao, mineracao, sobrecarga, 
            tipoUso, tipoRocha, composicao, estrutura, idade, tectonismo, declividade, altitude, orientacao, curvaturaHorizontal, 
            curvaturaVertical, urlPedologia, classeSolo, profundidade, textura, porosidade, uvcc, uvEvento, cad, k
        };

        validarCampos(campos);

        campos.categoriaTipo = processCheckboxes(campos.categoriaTipo);
        campos.servicosEssenciaisAfetados = processCheckboxes(campos.servicosEssenciaisAfetados);
        campos.setoresAfetados = processCheckboxes(campos.setoresAfetados);

        let formaTerreno = (campos.curvaturaHorizontal && campos.curvaturaVertical) 
            ? campos.curvaturaHorizontal + " - " + campos.curvaturaVertical 
            : null;

        try {
            await transactionWrapper(client, async () => {
                const eventoRow = await client.query("SELECT id_tipo FROM evento WHERE id_evento = $1", [idEvento]);
                
                if (eventoRow.rows.length === 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Evento não encontrado </p></div>`;
                    throw new Error("EVENTO_NAO_ENCONTRADO");
                }

                if (dataEvento && !validarDataMenorQueHoje(dataEvento)) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Um evento não pode ser registrado em um dia ou horário posterior a hoje </p></div>`;
                    throw new Error("EVENTO_DATA_INVALIDA");
                }

                const IdTipo = eventoRow.rows[0].id_tipo;

                const impactoRow = await client.query("SELECT id_impacto FROM impactos WHERE id_evento = $1", [idEvento]);
                const IdImpacto = impactoRow.rows[0].id_impacto;

                const agentExtrRow = await client.query("SELECT id_fe FROM fatores_extrinsecos WHERE id_evento = $1", [idEvento]);
                const IdAgentesExtrinsecos = agentExtrRow.rows[0].id_fe;

                const agentIntrRow = await client.query("SELECT id_fi FROM fatores_intrinsecos WHERE id_evento = $1", [idEvento]);
                const IdAgentesIntrinsecos = agentIntrRow.rows[0].id_fi;

                await client.query("UPDATE tipo SET descricao=$1, categoria=$2, material_dominante=$3, velocidade=$4 WHERE id_tipo=$5", 
                    [campos.descricaoTipo, campos.categoriaTipo, campos.materialDominanteTipo, campos.velocidadeTipo, IdTipo]);

                await client.query("UPDATE evento SET data_evento=$1, coordenadas_x=$2, coordenadas_y=$3, id_municipio=$4 WHERE id_evento=$5", 
                    [campos.dataEvento, campos.longitudeEvento, campos.latitudeEvento, campos.idMunicipioEvento, idEvento]);

                await client.query("UPDATE impactos_sociais SET tempo_recuperacao=$1, servicos_essenciais_afetados=$2, n_familias_afetadas=$3, n_desalojados=$4, n_desaparecidos=$5, n_mortos=$6, n_feridos=$7, n_desabrigados=$8 WHERE id_impacto=$9", 
                    [campos.tempoRecuperacaoSocial, campos.servicosEssenciaisAfetados, campos.nFamiliasAfetadas, campos.nDesalojados, campos.nDesaparecidos, campos.nMortos, campos.nFeridos, campos.nDesabrigados, IdImpacto]);

                await client.query("UPDATE impactos_economicos SET seguro_cobertura=$1, custo_recuperacao=$2, dano_patrimonio_privado=$3, dano_patrimonio_publico=$4, valor_total_danos_economicos=$5, interrupcao_economica_duracao=$6, interrupcao_economica_setores_afetados=$7, danos_agricolas_valor_estimado=$8, danos_agricolas_area_atingida=$9, danos_agricolas_percentual_area_atingida=$10, danos_agricolas_cultura_atingida=$11 WHERE id_impacto=$12", 
                    [campos.seguroCobertura, campos.custoRecuperacao, campos.danoPatrimonioPrivado, campos.danoPatrimonioPublico, campos.danoEconomicoTotal, campos.duracaoInterrupcaoEconomica, campos.setoresAfetados, campos.danosAgricolasValorEstimado, campos.danosAgricolasAreaAtingida, campos.danosAgricolasPercentualAreaAtingida, campos.danosAgricolasCulturaAtingida, IdImpacto]);

                await client.query("UPDATE impactos_ambientais SET area_atingida=$1, custo_mitigacao=$2, recursos_naturais_afetados=$3, danos_biodiversidade=$4, tipo_impacto=$5, tempo_recuperacao=$6, status_recuperacao=$7 WHERE id_impacto=$8", 
                    [campos.areaAtingida, campos.custoMitigacao, campos.recursosAfetados, campos.danosBiodiversidade, campos.tipoImpactoAmbiental, campos.tempoRecuperacaoAmbiental, campos.statusRecuperacaoAmbiental, IdImpacto]);

                await client.query("UPDATE clima SET vento=$1, precipitacao_evento=$2, precipitacao_5d=$3, precipitacao_10d=$4, precipitacao_mensal=$5, temperatura=$6, etp=$7, pressao_atm=$8 WHERE id_fe=$9", 
                    [campos.vento, campos.precipitacaoEvento, campos.precipitacao5d, campos.precipitacao10d, campos.precipitacaoMensal, campos.temperatura, campos.etp, campos.pressaoAtm, IdAgentesExtrinsecos]);

                await client.query("UPDATE fatores_antropicos SET escavacao=$1, mineracao=$2, sobrecarga=$3, tipo_uso=$4 WHERE id_fe=$5", 
                    [campos.escavacao, campos.mineracao, campos.sobrecarga, campos.tipoUso, IdAgentesExtrinsecos]);

                await client.query("UPDATE geologia SET tipo_rocha=$1, composicao=$2, estrutura=$3, idade=$4, tectonismo=$5 WHERE id_fi=$6", 
                    [campos.tipoRocha, campos.composicao, campos.estrutura, campos.idade, campos.tectonismo, IdAgentesIntrinsecos]);

                await client.query("UPDATE geomorfologia SET declividade=$1, altitude=$2, orientacao=$3, curvatura_horizontal=$4, curvatura_vertical=$5, forma_terreno=$6 WHERE id_fi=$7", 
                    [campos.declividade, campos.altitude, campos.orientacao, campos.curvaturaHorizontal, campos.curvaturaVertical, formaTerreno, IdAgentesIntrinsecos]);

                await client.query("UPDATE pedologia SET pedologia_url=$1, classe_solo=$2, profundidade=$3, textura=$4, porosidade=$5, uv_cc=$6, uv_evento=$7, cad=$8, k=$9 WHERE id_fi=$10", 
                    [campos.urlPedologia, campos.classeSolo, campos.profundidade, campos.textura, campos.porosidade, campos.uvcc, campos.uvEvento, campos.cad, campos.k, IdAgentesIntrinsecos]);
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> Evento atualizado com sucesso </p></div>`;
            return res.redirect('/movmassa/edicao');

        } catch (error) {
            console.error(error);
            if (error.message === "EVENTO_NAO_ENCONTRADO" || error.message === "EVENTO_DATA_INVALIDA") {
                return res.redirect('/movmassa/edicao');
            }

            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao atualizar evento </p></div>`;
            return res.redirect('/movmassa/edicao');
        }
    },

    editMedia: async (req, res) => {
        const { idMidia, tipoMidia, fonteMidia, dataColeta, urlMidia, idEventoMidia } = req.body;
        const campos = { idMidia, tipoMidia, fonteMidia, dataColeta, urlMidia, idEventoMidia };

        validarCampos(campos);

        try {
            await transactionWrapper(client, async () => {
                const midiaExistente = await client.query(
                    "SELECT * FROM midia WHERE id_midia = $1",
                    [campos.idMidia]
                );

                if (midiaExistente.rows.length === 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Mídia não encontrada </p></div>`;
                    throw new Error("MIDIA_NAO_ENCONTRADA");
                }

                if (campos.urlMidia !== midiaExistente.rows[0].url_midia) {
                    const duplicada = await client.query(
                        "SELECT * FROM midia WHERE url_midia = $1",
                        [campos.urlMidia]
                    );

                    if (duplicada.rows.length > 0) {
                        req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Já existe uma mídia com a nova URL informada </p></div>`;
                        throw new Error("URL_DUPLICADA");
                    }
                }

                await client.query(
                    `UPDATE midia
                    SET tipo_midia = $1,
                        fonte_midia = $2,
                        data_coleta = $3,
                        url_midia = $4,
                        id_evento = $5
                    WHERE id_midia = $6`,
                    [campos.tipoMidia, campos.fonteMidia, campos.dataColeta, campos.urlMidia, campos.idEventoMidia, campos.idMidia]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> Mídia atualizada com sucesso </p></div>`;
            return res.redirect('/movmassa/edicao');

        } catch (error) {
            if (error.message === "MIDIA_NAO_ENCONTRADA" || error.message === "URL_DUPLICADA") {
                return res.redirect('/movmassa/edicao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao atualizar mídia </p></div>`;
            return res.redirect('/movmassa/edicao');
        }
    }
};