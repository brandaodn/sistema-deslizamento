const client = require('../db')

const pagMenu = (res, req, mensagem) => {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }
    
    return res.render('menu', {  
        mensagem: mensagem,
        email: req.session.user.email,
        tipo: req.session.user.tipo
    });
};

const pageInsertion = async (req, res, mensagem) => {
    try{
        if (!req.session.user || req.session.user.tipo === 'comum' ) {
            return res.redirect('/movmassa/');
        }
        const pais = await client.query('SELECT * FROM pais ORDER BY nome_pais ASC');
        const uf = await client.query('SELECT * FROM uf ORDER BY nome_uf ASC');
        const mun = await client.query('SELECT municipio.id_municipio, municipio.nome_municipio, uf.nome_uf FROM municipio INNER JOIN uf ON municipio.id_uf = uf.id_uf ORDER BY municipio.nome_municipio ASC');
        const evento = await client.query('SELECT * FROM evento ORDER BY data_evento ASC');

        const mensagemFinal = mensagem || req.session.mensagem;
        req.session.mensagem = null;

        return res.render('insercao', { 
            pais: pais.rows, 
            uf: uf.rows, 
            mun: mun.rows, 
            evento: evento.rows, 
            mensagem: mensagemFinal,
            tipo: req.session.user.tipo
        });
    }catch(error){
        console.error('Erro ao acessar o banco de dados', error);
    }
};

const pageEdit = async (req, res, mensagem) => {
    try{
        if (!req.session.user || req.session.user.tipo === 'comum' ) {
            return res.redirect('/movmassa/');
        }
        const pais = await client.query('SELECT * FROM pais ORDER BY nome_pais ASC');
        const uf = await client.query('SELECT * FROM uf ORDER BY nome_uf ASC');
        const mun = await client.query('SELECT municipio.id_municipio, municipio.nome_municipio, municipio.id_uf, uf.nome_uf FROM municipio INNER JOIN uf ON municipio.id_uf = uf.id_uf ORDER BY municipio.nome_municipio ASC');
        const evento = await client.query(`SELECT 
                                            e.id_evento,
                                            e.data_evento,
                                            e.coordenadas_x,
                                            e.coordenadas_y,
                                            e.id_municipio,
                                            
                                            m.nome_municipio,

                                            t.id_tipo,
                                            t.descricao,
                                            t.categoria,
                                            t.material_dominante,
                                            t.velocidade,
                                            
                                            isoc.tempo_recuperacao,
                                            isoc.servicos_essenciais_afetados,
                                            isoc.n_familias_afetadas,
                                            isoc.n_desalojados,
                                            isoc.n_desaparecidos,
                                            isoc.n_mortos,
                                            isoc.n_feridos,
                                            isoc.n_desabrigados,
                                            
                                            ie.seguro_cobertura,
                                            ie.custo_recuperacao,
                                            ie.dano_patrimonio_privado,
                                            ie.dano_patrimonio_publico,
                                            ie.valor_total_danos_economicos,
                                            ie.interrupcao_economica_duracao,
                                            ie.interrupcao_economica_setores_afetados,
                                            ie.danos_agricolas_valor_estimado,
                                            ie.danos_agricolas_area_atingida,
                                            ie.danos_agricolas_percentual_area_atingida,
                                            ie.danos_agricolas_cultura_atingida,
                                            
                                            ia.area_atingida,
                                            ia.custo_mitigacao,
                                            ia.recursos_naturais_afetados,
                                            ia.danos_biodiversidade,
                                            ia.tipo_impacto,
                                            ia.tempo_recuperacao,
                                            ia.status_recuperacao,
                                            
                                            fe.id_fe,
                                            
                                            c.id_clima,
                                            c.vento,
                                            c.precipitacao_evento,
                                            c.precipitacao_5d,
                                            c.precipitacao_10d,
                                            c.precipitacao_mensal,
                                            c.temperatura,
                                            c.etp,
                                            c.pressao_atm,
                                            
                                            fa.id_fatores_antropicos,
                                            fa.escavacao,
                                            fa.mineracao,
                                            fa.sobrecarga,
                                            fa.tipo_uso,
                                            
                                            fi.id_fi,
                                            
                                            g.id_geologia,
                                            g.tipo_rocha,
                                            g.composicao,
                                            g.estrutura,
                                            g.idade,
                                            g.tectonismo,
                                            
                                            gm.id_geomorfologia,
                                            gm.declividade,
                                            gm.altitude,
                                            gm.orientacao,
                                            gm.curvatura_horizontal,
                                            gm.curvatura_vertical,
                                            gm.forma_terreno,
                                            
                                            p.id_pedologia,
                                            p.pedologia_url,
                                            p.classe_solo,
                                            p.profundidade,
                                            p.textura,
                                            p.porosidade,
                                            p.uv_cc,
                                            p.uv_evento,
                                            p.cad,
                                            p.k
                                        
                                        FROM municipio m JOIN evento e ON m.id_municipio = e.id_municipio
                                            JOIN tipo t ON e.id_tipo = t.id_tipo
                                            LEFT JOIN impactos i ON e.id_evento = i.id_evento
                                            LEFT JOIN impactos_sociais isoc ON i.id_impacto = isoc.id_impacto
                                            LEFT JOIN impactos_economicos ie ON i.id_impacto = ie.id_impacto
                                            LEFT JOIN impactos_ambientais ia ON i.id_impacto = ia.id_impacto
                                            LEFT JOIN fatores_extrinsecos fe ON e.id_evento = fe.id_evento
                                            LEFT JOIN clima c ON fe.id_fe = c.id_fe
                                            LEFT JOIN fatores_antropicos fa ON fe.id_fe = fa.id_fe
                                            LEFT JOIN fatores_intrinsecos fi ON e.id_evento = fi.id_evento
                                            LEFT JOIN geologia g ON fi.id_fi = g.id_fi
                                            LEFT JOIN geomorfologia gm ON fi.id_fi = gm.id_fi
                                            LEFT JOIN pedologia p ON fi.id_fi = p.id_fi
                                        ORDER BY e.data_evento DESC;
                                        `);
        const midia = await client.query('SELECT * FROM midia ORDER BY url_midia ASC');

        const mensagemFinal = mensagem || req.session.mensagem;
        req.session.mensagem = null;

        return res.render('edicao', { 
            pais: pais.rows, 
            uf: uf.rows, 
            mun: mun.rows, 
            evento: evento.rows,
            mensagem: mensagemFinal,
            tipo: req.session.user.tipo,
            midia: midia.rows
        });
    }catch(error){
        console.error('Erro ao acessar o banco de dados', error);
    }
};

const pageCuration = async (req, res, mensagem, dataSelecionada) => {
    try{
        if (!req.session.user || req.session.user.tipo === 'comum' ) {
            return res.redirect('/movmassa/');
        }
        const intervaloHoras = 12;
        
        if (!dataSelecionada || Number.isNaN(Date.parse(dataSelecionada))) {
            req.session.mensagem = '<div class="alert alert-danger text-center" role="alert"><p> Data de curadoria inválida </p></div>';
            return res.redirect('/movmassa/Curadoria/selecao');
        }

        const evento = await client.query(`WITH eventos_filtrados AS (
                                            SELECT * FROM evento
                                            WHERE data_evento BETWEEN $1::timestamp - ($2 * INTERVAL '1 hour')
                                                AND $1::timestamp + ($3 * INTERVAL '1 hour')
                                        )
                                        SELECT 
                                            e.id_evento, 
                                            e.data_evento, 
                                            e.coordenadas_x, 
                                            e.coordenadas_y, 
                                            e.id_municipio,
                                            e.esta_validado,
                                            t.descricao, 
                                            t.categoria, 
                                            isoc.n_mortos,
                                            m.nome_municipio,
                                            p.nome_pais,
                                            u.nome_uf
                                        
                                        FROM pais p JOIN uf u ON p.id_pais = u.id_pais 
										    JOIN municipio m ON u.id_uf = m.id_uf 
                                            JOIN eventos_filtrados e ON m.id_municipio = e.id_municipio
                                            JOIN tipo t ON e.id_tipo = t.id_tipo
                                            LEFT JOIN impactos i ON e.id_evento = i.id_evento
                                            LEFT JOIN impactos_sociais isoc ON i.id_impacto = isoc.id_impacto
                                            
                                        ORDER BY e.data_evento DESC;
                                        `, [dataSelecionada, intervaloHoras, intervaloHoras + 24]);

        const midia = await client.query(`SELECT m.id_midia, 
                                                m.tipo_midia, 
                                                m.fonte_midia, 
                                                m.data_coleta, 
                                                m.url_midia, 
                                                m.id_evento
                                            FROM midia m JOIN evento e 
                                                ON m.id_evento = e.id_evento
                                            WHERE e.data_evento BETWEEN $1::timestamp - ($2 * INTERVAL '1 hour')
                                                AND $1::timestamp + ($3 * INTERVAL '1 hour')
                                        `, [dataSelecionada, intervaloHoras, intervaloHoras + 24]);

        const mensagemFinal = mensagem || req.session.mensagem;
        req.session.mensagem = null;

        return res.render('curadoria', {
            evento: evento.rows,
            mensagem: mensagemFinal,
            midia: midia.rows,
            dataSelecionada
        });
    }catch(error){
        console.error('Erro ao acessar o banco de dados', error);
    }
};

const pageSampleCurationAvailable = async (req, res, mensagem) => {
    try{
        if (!req.session.user || req.session.user.tipo === 'comum' ) {
            return res.redirect('/movmassa/');
        }
        
        const evento = await client.query(`SELECT DISTINCT DATE(data_evento) AS data_sem_hora
                                            FROM evento
                                            WHERE esta_validado = false;
                                        `);

        const mensagemFinal = mensagem || req.session.mensagem;
        req.session.mensagem = null;

        return res.render('selecao-curadoria', {
            evento: evento.rows,
            mensagem: mensagemFinal
        });
    }catch(error){
        console.error('Erro ao acessar o banco de dados', error);
    }
};

const pageMap = async (req, res, mensagem) => {
    try{
        if (!req.session.user) {
            return res.redirect('/movmassa/');
        }
        
        // const pais = await client.query('SELECT * FROM pais ORDER BY nome_pais ASC');
        // const uf = await client.query('SELECT * FROM uf ORDER BY nome_uf ASC');
        // const mun = await client.query('SELECT * FROM municipio ORDER BY municipio.nome_municipio ASC');
        
        const evento = await client.query(`WITH eventos_filtrados AS (
                                            SELECT * FROM evento
                                            WHERE esta_validado = TRUE
                                        )
                                        SELECT 
                                            e.id_evento, 
                                            e.data_evento, 
                                            e.coordenadas_x, 
                                            e.coordenadas_y, 
                                            e.id_municipio,
                                            e.esta_validado,
                                            t.descricao, 
                                            t.categoria, 
                                            isoc.n_mortos,
                                            m.nome_municipio,
                                            p.nome_pais,
                                            u.nome_uf
                                        
                                        FROM pais p JOIN uf u ON p.id_pais = u.id_pais 
										    JOIN municipio m ON u.id_uf = m.id_uf
                                            JOIN eventos_filtrados e ON m.id_municipio = e.id_municipio
                                            JOIN tipo t ON e.id_tipo = t.id_tipo
                                            LEFT JOIN impactos i ON e.id_evento = i.id_evento
                                            LEFT JOIN impactos_sociais isoc ON i.id_impacto = isoc.id_impacto
                                            
                                        ORDER BY e.data_evento DESC;
                                        `);

        const midia = await client.query(`SELECT m.id_midia, 
                                                m.tipo_midia, 
                                                m.fonte_midia, 
                                                m.data_coleta, 
                                                m.url_midia, 
                                                m.id_evento
                                            FROM midia m JOIN evento e 
                                                ON m.id_evento = e.id_evento
                                            WHERE e.esta_validado = TRUE
                                        `);

        const mensagemFinal = mensagem || req.session.mensagem;
        req.session.mensagem = null;

        return res.render('mapa-eventos', {
            // pais: pais.rows, 
            // uf: uf.rows, 
            // mun: mun.rows,
            evento: evento.rows,
            mensagem: mensagemFinal,
            midia: midia.rows
        });
    }catch(error){
        console.error('Erro ao acessar o banco de dados', error);
    }
};

const pageMapEventDetails = async (req, res, mensagem, idEvento) => {
    try{
        if (!req.session.user) {
            return res.redirect('/movmassa/');
        }
        
        const mun = await client.query('SELECT * FROM municipio ORDER BY municipio.nome_municipio ASC');

        const idEventoNumero = Number.parseInt(idEvento, 10);
        if (!Number.isInteger(idEventoNumero) || idEventoNumero <= 0) {
            req.session.mensagem = '<div class="alert alert-danger text-center" role="alert"><p> Evento inválido </p></div>';
            return res.redirect('/movmassa/visualizar-eventos');
        }

        const evento = await client.query(`WITH evento_selecionado AS (
                                            SELECT * FROM evento
                                            WHERE id_evento = $1
                                        )
                                        SELECT 
                                            e.id_evento,
                                            e.data_evento,
                                            e.coordenadas_x,
                                            e.coordenadas_y,
                                            e.id_municipio,
                                            m.nome_municipio,

                                            t.id_tipo,
                                            t.descricao,
                                            t.categoria,
                                            t.material_dominante,
                                            t.velocidade,
                                            
                                            isoc.tempo_recuperacao,
                                            isoc.servicos_essenciais_afetados,
                                            isoc.n_familias_afetadas,
                                            isoc.n_desalojados,
                                            isoc.n_desaparecidos,
                                            isoc.n_mortos,
                                            isoc.n_feridos,
                                            isoc.n_desabrigados,
                                            
                                            ie.seguro_cobertura,
                                            ie.custo_recuperacao,
                                            ie.dano_patrimonio_privado,
                                            ie.dano_patrimonio_publico,
                                            ie.valor_total_danos_economicos,
                                            ie.interrupcao_economica_duracao,
                                            ie.interrupcao_economica_setores_afetados,
                                            ie.danos_agricolas_valor_estimado,
                                            ie.danos_agricolas_area_atingida,
                                            ie.danos_agricolas_percentual_area_atingida,
                                            ie.danos_agricolas_cultura_atingida,
                                            
                                            ia.area_atingida,
                                            ia.custo_mitigacao,
                                            ia.recursos_naturais_afetados,
                                            ia.danos_biodiversidade,
                                            ia.tipo_impacto,
                                            ia.tempo_recuperacao,
                                            ia.status_recuperacao,
                                            
                                            fe.id_fe,
                                            
                                            c.id_clima,
                                            c.vento,
                                            c.precipitacao_evento,
                                            c.precipitacao_5d,
                                            c.precipitacao_10d,
                                            c.precipitacao_mensal,
                                            c.temperatura,
                                            c.etp,
                                            c.pressao_atm,
                                            
                                            fa.id_fatores_antropicos,
                                            fa.escavacao,
                                            fa.mineracao,
                                            fa.sobrecarga,
                                            fa.tipo_uso,
                                            
                                            fi.id_fi,
                                            
                                            g.id_geologia,
                                            g.tipo_rocha,
                                            g.composicao,
                                            g.estrutura,
                                            g.idade,
                                            g.tectonismo,
                                            
                                            gm.id_geomorfologia,
                                            gm.declividade,
                                            gm.altitude,
                                            gm.orientacao,
                                            gm.curvatura_horizontal,
                                            gm.curvatura_vertical,
                                            gm.forma_terreno,
                                            
                                            p.id_pedologia,
                                            p.pedologia_url,
                                            p.classe_solo,
                                            p.profundidade,
                                            p.textura,
                                            p.porosidade,
                                            p.uv_cc,
                                            p.uv_evento,
                                            p.cad,
                                            p.k
                                        
                                        FROM municipio m JOIN evento_selecionado e ON m.id_municipio = e.id_municipio
                                            JOIN tipo t ON e.id_tipo = t.id_tipo
                                            LEFT JOIN impactos i ON e.id_evento = i.id_evento
                                            LEFT JOIN impactos_sociais isoc ON i.id_impacto = isoc.id_impacto
                                            LEFT JOIN impactos_economicos ie ON i.id_impacto = ie.id_impacto
                                            LEFT JOIN impactos_ambientais ia ON i.id_impacto = ia.id_impacto
                                            LEFT JOIN fatores_extrinsecos fe ON e.id_evento = fe.id_evento
                                            LEFT JOIN clima c ON fe.id_fe = c.id_fe
                                            LEFT JOIN fatores_antropicos fa ON fe.id_fe = fa.id_fe
                                            LEFT JOIN fatores_intrinsecos fi ON e.id_evento = fi.id_evento
                                            LEFT JOIN geologia g ON fi.id_fi = g.id_fi
                                            LEFT JOIN geomorfologia gm ON fi.id_fi = gm.id_fi
                                            LEFT JOIN pedologia p ON fi.id_fi = p.id_fi
                                        ORDER BY e.data_evento DESC;
                                        `, [idEventoNumero]);

        const midia = await client.query(`SELECT m.id_midia, 
                                                m.tipo_midia, 
                                                m.fonte_midia, 
                                                m.data_coleta, 
                                                m.url_midia, 
                                                m.id_evento
                                            FROM midia m JOIN evento e 
                                                ON m.id_evento = e.id_evento
                                            WHERE e.id_evento = $1
                                        `, [idEventoNumero]);

        const mensagemFinal = mensagem || req.session.mensagem;
        req.session.mensagem = null;

        return res.render('mais-detalhes', {
            evento: evento.rows,
            mun: mun.rows,
            mensagem: mensagemFinal,
            midia: midia.rows,
            idEvento: idEventoNumero
        });
    }catch(error){
        console.error('Erro ao acessar o banco de dados', error);
    }
};

module.exports = { pagMenu, pageInsertion, pageEdit, pageCuration, pageSampleCurationAvailable, pageMap, pageMapEventDetails };