const client = require('../db');
const { validarCampos, processCheckboxes } = require('../utils/utils');
const { validarDataMenorQueHoje } = require('../utils/date.utils');
const transactionWrapper = require('../utils/dbTransactions');
const { pageInsertion } = require('../utils/menu.utils');
const bcrypt = require('bcrypt');
const { isStrongPassword, PASSWORD_REQUIREMENTS } = require('../utils/password.utils');


module.exports = {
    showInsertionPage: async (req, res, mensagem) => {
        return await pageInsertion(req, res, null);
    },

    addCountry: async (req, res) => {
        const { nomePais } = req.body;
        try {
            await transactionWrapper(client, async () => {
                const val = await client.query('SELECT * FROM pais WHERE LOWER(nome_pais) = LOWER($1)', [nomePais]);
                if (val.rows.length > 0) {                
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Este País já está cadastrado com esse nome </p></div>`;
                    throw new Error("PAIS_DUPLICADO");
                }
                await client.query("INSERT INTO pais (nome_pais) VALUES ($1)", [nomePais]);
            });
            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> '${nomePais}' adicionado com sucesso </p></div>`;
            return res.redirect('/movmassa/insercao');
        } catch (error) {
            if (error.message === "PAIS_DUPLICADO") {
                return res.redirect('/movmassa/insercao');
            }
            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao cadastrar país </p></div>`;
            return res.redirect('/movmassa/insercao');
        }
    },

    addState: async (req, res) => {
        const { nomeUF, idPaisUF } = req.body;
        try {
            await transactionWrapper(client, async () => {
                const val = await client.query(
                    'SELECT * FROM uf WHERE LOWER(nome_uf) = LOWER($1) AND id_pais = $2',
                    [nomeUF, idPaisUF]
                );

                if (val.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Este UF já está cadastrado </p></div>`;
                    throw new Error("UF_DUPLICADO");
                }

                await client.query(
                    "INSERT INTO uf (nome_uf, id_pais) VALUES ($1, $2)",
                    [nomeUF, idPaisUF]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> '${nomeUF}' adicionado com sucesso </p></div>`;
            return res.redirect('/movmassa/insercao');

        } catch (error) {
            if (error.message === "UF_DUPLICADO") {
                return res.redirect('/movmassa/insercao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao cadastrar UF </p></div>`;
            return res.redirect('/movmassa/insercao');
        }
    },

    addCity: async (req, res) => {
        const { nomeMunicipio, idEstadoMunicipio } = req.body;
        try {
            await transactionWrapper(client, async () => {
                const val = await client.query(
                    'SELECT * FROM municipio WHERE LOWER(nome_municipio) = LOWER($1) AND id_uf = $2',
                    [nomeMunicipio, idEstadoMunicipio]
                );

                if (val.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Este Município já foi cadastrado </p></div>`;
                    throw new Error("MUNICIPIO_DUPLICADO");
                }

                await client.query(
                    "INSERT INTO municipio (nome_municipio, id_uf) VALUES ($1, $2)",
                    [nomeMunicipio, idEstadoMunicipio]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> '${nomeMunicipio}' adicionado com sucesso </p></div>`;
            return res.redirect('/movmassa/insercao');

        } catch (error) {
            if (error.message === "MUNICIPIO_DUPLICADO") {
                return res.redirect('/movmassa/insercao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao cadastrar município </p></div>`;
            return res.redirect('/movmassa/insercao');
        }
    },

    addUser: async (req, res) => {
        const { tipo, email, senha } = req.body;

        try {
            await transactionWrapper(client, async () => {

                if (!isStrongPassword(senha)) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> ${PASSWORD_REQUIREMENTS} </p></div>`;
                    throw new Error("SENHA_FRACA");
                }

                const tiposPermitidos = ['comum', 'Curador', 'administrador'];
                if (!tiposPermitidos.includes(tipo)) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Tipo de usuário inválido </p></div>`;
                    throw new Error("TIPO_USUARIO_INVALIDO");
                }

                const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
                if (result.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Usuário já cadastrado </p></div>`;
                    throw new Error("USUARIO_DUPLICADO");
                }

                const hashedPassword = await bcrypt.hash(senha, 10);
                await client.query(
                    'INSERT INTO users (tipo, email, senha) VALUES ($1, $2, $3)',
                    [tipo, email, hashedPassword]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> Usuário cadastrado com sucesso </p></div>`;
            return res.redirect('/movmassa/insercao');

        } catch (err) {
            if (["SENHA_FRACA", "TIPO_USUARIO_INVALIDO", "USUARIO_DUPLICADO"].includes(err.message)) {
                return res.redirect('/movmassa/insercao');
            }

            console.error(err);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao cadastrar usuário </p></div>`;
            return res.redirect('/movmassa/insercao');
        }
    },

    addEvent: async (req, res) => {
        let { descricaoTipo, categoriaTipo, materialDominanteTipo, velocidadeTipo, dataEvento, longitudeEvento, latitudeEvento,
            idMunicipioEvento, tempoRecuperacaoSocial, servicosEssenciaisAfetados, nFamiliasAfetadas,
            nDesalojados, nDesaparecidos, nMortos, nFeridos, nDesabrigados, seguroCobertura, custoRecuperacao, danoPatrimonioPrivado,
            danoPatrimonioPublico, danoEconomicoTotal, duracaoInterrupcaoEconomica, setoresAfetados, danosAgricolasValorEstimado,
            danosAgricolasAreaAtingida, danosAgricolasPercentualAreaAtingida, danosAgricolasCulturaAtingida, areaAtingida, custoMitigacao,
            recursosAfetados, danosBiodiversidade, tipoImpactoAmbiental, tempoRecuperacaoAmbiental, statusRecuperacaoAmbiental, vento,
            precipitacaoEvento, precipitacao5d, precipitacao10d, precipitacaoMensal, temperatura, etp, pressaoAtm, escavacao, mineracao, sobrecarga,
            tipoUso, tipoRocha, composicao, estrutura, idade, tectonismo, declividade, altitude, orientacao, curvaturaHorizontal,
            curvaturaVertical, urlPedologia, classeSolo, profundidade, textura, porosidade, uvcc, uvEvento, cad, k } = req.body;

        const campos = {
            descricaoTipo, categoriaTipo, materialDominanteTipo, velocidadeTipo, dataEvento, longitudeEvento, latitudeEvento,
            idMunicipioEvento, tempoRecuperacaoSocial, servicosEssenciaisAfetados, nFamiliasAfetadas,
            nDesalojados, nDesaparecidos, nMortos, nFeridos, nDesabrigados, seguroCobertura, custoRecuperacao, danoPatrimonioPrivado,
            danoPatrimonioPublico, danoEconomicoTotal, duracaoInterrupcaoEconomica, setoresAfetados, danosAgricolasValorEstimado,
            danosAgricolasAreaAtingida, danosAgricolasPercentualAreaAtingida, danosAgricolasCulturaAtingida, areaAtingida, custoMitigacao,
            recursosAfetados, danosBiodiversidade, tipoImpactoAmbiental, tempoRecuperacaoAmbiental, statusRecuperacaoAmbiental, vento,
            precipitacaoEvento, precipitacao5d, precipitacao10d, precipitacaoMensal, temperatura, etp, pressaoAtm, escavacao, mineracao, sobrecarga,
            tipoUso, tipoRocha, composicao, estrutura, idade, tectonismo, declividade, altitude, orientacao, curvaturaHorizontal,
            curvaturaVertical, urlPedologia, classeSolo, profundidade, textura, porosidade, uvcc, uvEvento, cad, k
        };
        
        try {
            validarCampos(campos);
            campos.categoriaTipo = processCheckboxes(campos.categoriaTipo);
            campos.servicosEssenciaisAfetados = processCheckboxes(campos.servicosEssenciaisAfetados);
            campos.setoresAfetados = processCheckboxes(campos.setoresAfetados);

            let formaTerreno = (campos.curvaturaHorizontal && campos.curvaturaVertical)
                ? `${campos.curvaturaHorizontal} - ${campos.curvaturaVertical}`
                : null;

            await transactionWrapper(client, async () => {
                if (!validarDataMenorQueHoje(dataEvento)) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Um evento não pode ser registrado em um dia ou horário posterior a hoje </p></div>`;
                    throw new Error("EVENTO_DATA_INVALIDA");
                }

                const result1 = await client.query(
                    "INSERT INTO tipo (descricao, categoria, material_dominante, velocidade) VALUES ($1, $2, $3, $4) RETURNING id_tipo",
                    [campos.descricaoTipo, campos.categoriaTipo, campos.materialDominanteTipo, campos.velocidadeTipo]
                );
                const IdTipo = result1.rows[0].id_tipo;

                const result2 = await client.query(
                    "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [campos.dataEvento, campos.longitudeEvento, campos.latitudeEvento, campos.idMunicipioEvento, IdTipo, false]
                );
                const IdEvento = result2.rows[0].id_evento;

                const result3 = await client.query("INSERT INTO impactos (id_evento) VALUES ($1) RETURNING id_impacto", [IdEvento]);
                const IdImpacto = result3.rows[0].id_impacto;

                await client.query(
                    "INSERT INTO impactos_sociais (tempo_recuperacao, servicos_essenciais_afetados, n_familias_afetadas, n_desalojados, n_desaparecidos, n_mortos, n_feridos, n_desabrigados, id_impacto) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                    [campos.tempoRecuperacaoSocial, campos.servicosEssenciaisAfetados, campos.nFamiliasAfetadas, campos.nDesalojados,
                        campos.nDesaparecidos, campos.nMortos, campos.nFeridos, campos.nDesabrigados, IdImpacto]
                );

                await client.query(
                    "INSERT INTO impactos_economicos (seguro_cobertura, custo_recuperacao, dano_patrimonio_privado, dano_patrimonio_publico, valor_total_danos_economicos, interrupcao_economica_duracao, interrupcao_economica_setores_afetados, danos_agricolas_valor_estimado, danos_agricolas_area_atingida, danos_agricolas_percentual_area_atingida, danos_agricolas_cultura_atingida, id_impacto) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
                    [campos.seguroCobertura, campos.custoRecuperacao, campos.danoPatrimonioPrivado, campos.danoPatrimonioPublico,
                        campos.danoEconomicoTotal, campos.duracaoInterrupcaoEconomica, campos.setoresAfetados,
                        campos.danosAgricolasValorEstimado, campos.danosAgricolasAreaAtingida, campos.danosAgricolasPercentualAreaAtingida,
                        campos.danosAgricolasCulturaAtingida, IdImpacto]
                );

                await client.query(
                    "INSERT INTO impactos_ambientais (area_atingida, custo_mitigacao, recursos_naturais_afetados, danos_biodiversidade, tipo_impacto, tempo_recuperacao, status_recuperacao, id_impacto) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
                    [campos.areaAtingida, campos.custoMitigacao, campos.recursosAfetados, campos.danosBiodiversidade,
                        campos.tipoImpactoAmbiental, campos.tempoRecuperacaoAmbiental, campos.statusRecuperacaoAmbiental, IdImpacto]
                );

                const result7 = await client.query("INSERT INTO fatores_extrinsecos (id_evento) VALUES ($1) RETURNING id_fe", [IdEvento]);
                const IdAgentesExtrinsecos = result7.rows[0].id_fe;

                await client.query(
                    "INSERT INTO clima (vento, precipitacao_evento, precipitacao_5d, precipitacao_10d, precipitacao_mensal, temperatura, etp, pressao_atm, id_fe) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                    [campos.vento, campos.precipitacaoEvento, campos.precipitacao5d, campos.precipitacao10d,
                        campos.precipitacaoMensal, campos.temperatura, campos.etp, campos.pressaoAtm, IdAgentesExtrinsecos]
                );

                await client.query(
                    "INSERT INTO fatores_antropicos (escavacao, mineracao, sobrecarga, tipo_uso, id_fe) VALUES ($1,$2,$3,$4,$5)",
                    [campos.escavacao, campos.mineracao, campos.sobrecarga, campos.tipoUso, IdAgentesExtrinsecos]
                );

                const result10 = await client.query("INSERT INTO fatores_intrinsecos (id_evento) VALUES ($1) RETURNING id_fi", [IdEvento]);
                const IdAgentesIntrinsecos = result10.rows[0].id_fi;

                await client.query(
                    "INSERT INTO geologia (tipo_rocha, composicao, estrutura, idade, tectonismo, id_fi) VALUES ($1,$2,$3,$4,$5,$6)",
                    [campos.tipoRocha, campos.composicao, campos.estrutura, campos.idade, campos.tectonismo, IdAgentesIntrinsecos]
                );

                await client.query(
                    "INSERT INTO geomorfologia (declividade, altitude, orientacao, curvatura_horizontal, curvatura_vertical, forma_terreno, id_fi) VALUES ($1,$2,$3,$4,$5,$6,$7)",
                    [campos.declividade, campos.altitude, campos.orientacao, campos.curvaturaHorizontal, campos.curvaturaVertical,
                        formaTerreno, IdAgentesIntrinsecos]
                );

                await client.query(
                    "INSERT INTO pedologia (pedologia_url, classe_solo, profundidade, textura, porosidade, uv_cc, uv_evento, cad, k, id_fi) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
                    [campos.urlPedologia, campos.classeSolo, campos.profundidade, campos.textura, campos.porosidade,
                        campos.uvcc, campos.uvEvento, campos.cad, campos.k, IdAgentesIntrinsecos]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> Evento adicionado com sucesso </p></div>`;
            return res.redirect('/movmassa/insercao');

        } catch (error) {
            if (error.message === "EVENTO_DATA_INVALIDA") {
                return res.redirect('/movmassa/insercao');
            }
            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao cadastrar evento </p></div>`;
            return res.redirect('/movmassa/insercao');
        }
    },

    addMedia: async (req, res) => {
        const { tipoMidia, fonteMidia, dataColeta, urlMidia, idEventoMidia } = req.body;
        const campos = { tipoMidia, fonteMidia, dataColeta, urlMidia, idEventoMidia };

        try {
            validarCampos(campos);

            await transactionWrapper(client, async () => {
                const val = await client.query(
                    'SELECT * FROM midia WHERE url_midia = $1',
                    [campos.urlMidia]
                );

                if (val.rows.length > 0) {
                    req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Mídia já cadastrada </p></div>`;
                    throw new Error("MIDIA_DUPLICADA");
                }

                await client.query(
                    "INSERT INTO midia (tipo_midia, fonte_midia, data_coleta, url_midia, id_evento) VALUES ($1, $2, $3, $4, $5)",
                    [campos.tipoMidia, campos.fonteMidia, campos.dataColeta, campos.urlMidia, campos.idEventoMidia]
                );
            });

            req.session.mensagem = `<div class="alert alert-success text-center" role="alert"><p> Mídia cadastrada com sucesso </p></div>`;
            return res.redirect('/movmassa/insercao');

        } catch (error) {
            if (error.message === "MIDIA_DUPLICADA") {
                return res.redirect('/movmassa/insercao');
            }

            console.error(error);
            req.session.mensagem = `<div class="alert alert-danger text-center" role="alert"><p> Erro ao cadastrar mídia </p></div>`;
            return res.redirect('/movmassa/insercao');
        }
    }
};