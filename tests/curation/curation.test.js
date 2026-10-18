const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Curadoria de Eventos (/Curadoria)', () => {
    let agent;

    let testEventoId;
    let eventoRepetidoId;
    let eventoDestinoId;
    let id_pais_original;
    let id_mun_original;
    let tipoEventoId;

    const testId = Date.now();
    const nomePais = `${testId} TEST COUNTRY`
    const nomeUF = `${testId} TEST UF`
    const nomeMun = `${testId} TEST CITY`

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    const dataEvento = '2025-11-01'

    beforeAll(async () => {
        agent = request.agent(app);
        await client.query('BEGIN');

        await agent
            .post("/movmassa/login")
            .send({ email: email, senha: pass });

        await agent.post("/movmassa/addPais").send({ nomePais: nomePais });
        const { rows: pais_rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = $1`,
            [nomePais]
        );
        id_pais_original = pais_rows[0].id_pais;

        await agent.post("/movmassa/addUF").send({ nomeUF: nomeUF, idPaisUF: id_pais_original });
        const { rows: uf_rows } = await client.query(
            `SELECT id_uf FROM uf WHERE nome_uf = $1`,
            [nomeUF]
        );
        const id_uf_original = uf_rows[0].id_uf;

        await agent.post("/movmassa/addMun").send({ nomeMunicipio: nomeMun, idEstadoMunicipio: id_uf_original });
        const { rows: mun_rows } = await client.query(
            `SELECT id_municipio FROM municipio WHERE nome_municipio = $1`,
            [nomeMun]
        );
        id_mun_original = mun_rows[0].id_municipio;

        const tipoEvento = await client.query(
            `INSERT INTO tipo (descricao) VALUES ('${ testId } DESCRIÇÃO TESTE') RETURNING id_tipo`
        );
        tipoEventoId = tipoEvento.rows[0].id_tipo;

        const eventoBase = await client.query(
            "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [dataEvento, 2.25, 1.125, id_mun_original, tipoEventoId, false]
        );
        testEventoId = eventoBase.rows[0].id_evento;

        const eventoDestino = await client.query(
            "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [dataEvento, 1.025, 1.125, id_mun_original, tipoEventoId, true]
        );
        eventoDestinoId = eventoDestino.rows[0].id_evento;

        const eventoRepetido = await client.query(
            "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [dataEvento, 3.25, 6.125, id_mun_original, tipoEventoId, false]
        );
        eventoRepetidoId = eventoRepetido.rows[0].id_evento;

        await client.query(
            "INSERT INTO midia (tipo_midia, fonte_midia, data_coleta, url_midia, id_evento) VALUES ($1, $2, $3, $4, $5)",
                    ['Foto', 'Pessoal', '2009-12-11', `test.net/${testId}.png`, eventoRepetidoId]
        );

        await client.query('COMMIT');
    });

    afterAll(async () => {
        try {
            await client.query('BEGIN');
            await client.query(`DELETE FROM pais WHERE id_pais = $1`, [id_pais_original]);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it('Deve renderizar a página de Curadoria', async () => {
        const res = await agent.get(`/movmassa/Curadoria/eventos?data=${dataEvento}`);
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/2025-11-01/i);
    });

    it('Deve renderizar a página de eventos disponíveis para Curadoria', async () => {
        const res = await agent.get('/movmassa/Curadoria/selecao');
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Curadoria de Eventos/i);
    });

    it('Deve validar um evento corretamente (avaliacao = valido)', async () => {
        const res = await agent
            .post('/movmassa/realizar-Curadoria')
            .send({
                idEvento: testEventoId,
                dataSelecionada: '2025-11-01',
                avaliacao: 'valido',
                destinoMidia: 0
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Evento validado com sucesso/i);

        const check = await client.query('SELECT esta_validado FROM evento WHERE id_evento = $1', [testEventoId]);
        expect(check.rows[0].esta_validado).toBe(true);
    });

    it('Deve deletar um evento inválido (avaliacao = invalido)', async () => {
        const eventoInvalidoTemp = await client.query(
            "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [dataEvento, 3.25, 6.125, id_mun_original, tipoEventoId, false]
        );

        const res = await agent
            .post('/movmassa/realizar-Curadoria')
            .send({
                idEvento: eventoInvalidoTemp.rows[0].id_evento,
                dataSelecionada: '2025-11-01',
                avaliacao: 'invalido',
                destinoMidia: 0
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Evento inválido deletado com sucesso/i);

        const check = await client.query('SELECT * FROM evento WHERE id_evento = $1', [eventoInvalidoTemp.rows[0].id_evento]);
        expect(check.rows.length).toBe(0);
    });

    it('Deve deletar evento repetido e mover mídias (avaliacao = repetido com destinoMidia válido)', async () => {
        const res = await agent
            .post('/movmassa/realizar-Curadoria')
            .send({
                idEvento: eventoRepetidoId,
                dataSelecionada: '2025-11-01',
                avaliacao: 'repetido',
                destinoMidia: eventoDestinoId
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Evento repetido deletado com sucesso/i);

        const eventoCheck = await client.query('SELECT * FROM evento WHERE id_evento = $1', [eventoRepetidoId]);
        expect(eventoCheck.rows.length).toBe(0);

        const midiaCheck = await client.query('SELECT id_evento FROM midia WHERE id_evento = $1', [eventoDestinoId]);
        expect(midiaCheck.rows.length).toBeGreaterThan(0);
    });

    it('Deve deletar evento repetido sem destino de mídia (avaliacao = repetido com destinoMidia = -1)', async () => {
        const eventoRepetidoTemp = await client.query(
            "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [dataEvento, 3.25, 6.125, id_mun_original, tipoEventoId, false]
        );

        const res = await agent
            .post('/movmassa/realizar-Curadoria')
            .send({
                idEvento: eventoRepetidoTemp.rows[0].id_evento,
                dataSelecionada: '2025-11-01',
                avaliacao: 'repetido',
                destinoMidia: -1
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Evento repetido deletado com sucesso/i);

        const check = await client.query('SELECT * FROM evento WHERE id_evento = $1', [eventoRepetidoTemp.rows[0].id_evento]);
        expect(check.rows.length).toBe(0);
    });

     it('Deve emitir erro ao passar uma avaliação inválida', async () => {
        const eventoRepetidoTemp = await client.query(
            "INSERT INTO evento (data_evento, coordenadas_x, coordenadas_y, id_municipio, id_tipo, esta_validado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_evento",
                    [dataEvento, 3.25, 6.125, id_mun_original, tipoEventoId, false]
        );

        const res = await agent
            .post('/movmassa/realizar-Curadoria')
            .send({
                idEvento: eventoRepetidoTemp.rows[0].id_evento,
                dataSelecionada: '2025-11-01',
                avaliacao: 'inexistente',
                destinoMidia: -1
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Avaliação não identificada/i);
    });

    it('Deve informar quando for chamado para um evento já validado', async () => {
        const res = await agent
            .post('/movmassa/realizar-Curadoria')
            .send({
                idEvento: testEventoId,
                dataSelecionada: '2025-11-01',
                avaliacao: 'invalido',
                destinoMidia: 0
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Esse evento já passou por Curadoria/i);
    });
});
