const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();


describe('Editar Município (/editMun)', () => {
    let agent;
    let id_pais;
    let id_uf_original;
    let id_uf_novo;
    let id_municipio;

    const testId = Date.now();
    const nomePais = `MUN COUNTRY EDIT ${testId}`;
    const nomeUFOriginal = `MUN UF ORIGINAL ${testId}`;
    const nomeUFNovo = `MUN UF NOVO ${testId}`;
    const nomeMunicipioOriginal = `MUN ORIGINAL ${testId}`;
    const nomeMunicipioEditado = `MUN EDITED ${testId}`;
    const nomeMunicipioDuplicado = `MUN DUPLICATED ${testId}`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app);

        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass });

        await agent
            .post('/movmassa/addPais')
            .send({ nomePais });

        const { rows: pais_rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = '${nomePais}'`
        );
        id_pais = pais_rows[0].id_pais;

        await agent
            .post('/movmassa/addUF')
            .send({ nomeUF: nomeUFOriginal, idPaisUF: id_pais });

        const { rows: uf_rows_original } = await client.query(
            `SELECT id_uf FROM uf WHERE nome_uf = '${nomeUFOriginal}'`
        );
        id_uf_original = uf_rows_original[0].id_uf;

        await agent
            .post('/movmassa/addUF')
            .send({ nomeUF: nomeUFNovo, idPaisUF: id_pais });

        const { rows: uf_rows_novo } = await client.query(
            `SELECT id_uf FROM uf WHERE nome_uf = '${nomeUFNovo}'`
        );
        id_uf_novo = uf_rows_novo[0].id_uf;

        const { rows: mun_rows } = await client.query(
            `INSERT INTO municipio (nome_municipio, id_uf) VALUES ($1, $2) RETURNING id_municipio`,
            [nomeMunicipioOriginal, id_uf_original]
        );
        id_municipio = mun_rows[0].id_municipio;

        await client.query(
            `INSERT INTO municipio (nome_municipio, id_uf) VALUES ($1, $2)`,
            [nomeMunicipioDuplicado, id_uf_original]
        );
    });

    afterAll(async () => {
        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM pais WHERE nome_pais = ANY($1)`,
                [[nomePais]]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it('Deve editar Município corretamente (nome)', async () => {
        const res = await agent
            .post('/movmassa/editMun')
            .send({ idMunicipio: id_municipio, nomeMunicipio: nomeMunicipioEditado, idEstadoMunicipio: id_uf_original })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizado com sucesso/i);
    });

    it('Deve impedir atualização para nome duplicado', async () => {
        const res = await agent
            .post('/movmassa/editMun')
            .send({ idMunicipio: id_municipio, nomeMunicipio: nomeMunicipioDuplicado, idEstadoMunicipio: id_uf_original })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Este município já está Cadastrado nessa UF/i);
    });

    it('Deve permitir atualizar o UF de um Município', async () => {
        const res = await agent
            .post('/movmassa/editMun')
            .send({ idMunicipio: id_municipio, nomeMunicipio: nomeMunicipioEditado, idEstadoMunicipio: id_uf_novo })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizado com sucesso/i);

        const { rows } = await client.query(
            `SELECT id_uf FROM municipio WHERE id_municipio = $1`,
            [id_municipio]
        );
        expect(rows[0].id_uf).toBe(id_uf_novo);
    });
});
