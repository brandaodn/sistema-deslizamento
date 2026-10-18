const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Editar UF (/editUF)', () => {
    let agent;
    let id_pais_original;
    let id_pais_novo;
    let id_uf;

    const testId = Date.now();
    const nomePaisOriginal = `STATE COUNTRY ORIGINAL ${testId}`;
    const nomePaisNovo = `STATE COUNTRY NOVO ${testId}`;
    const nomeUFOriginal = `STATE UF ORIGINAL ${testId}`;
    const nomeUFEditado = `STATE UF EDITED ${testId}`;
    const nomeUFDuplicado = `STATE UF DUPLICATED ${testId}`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app); 
                
        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass }); 

        await agent
            .post('/movmassa/addPais')
            .send({ nomePais: nomePaisOriginal });

        const { rows: pais_rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = '${nomePaisOriginal}'`
        );
        id_pais_original = pais_rows[0].id_pais;

        await agent
            .post('/movmassa/addPais')
            .send({ nomePais: nomePaisNovo });

        const { rows: pais_rows_novo } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = '${nomePaisNovo}'`
        );
        id_pais_novo = pais_rows_novo[0].id_pais;

        const resUF = await client.query(
            `INSERT INTO uf (nome_uf, id_pais) VALUES ($1, $2) RETURNING id_uf`,
            [nomeUFOriginal, id_pais_original]
        );
        id_uf = resUF.rows[0].id_uf;

        await client.query(
            `INSERT INTO uf (nome_uf, id_pais) VALUES ($1, $2)`,
            [nomeUFDuplicado, id_pais_original]
        );
    });

    afterAll(async () => {
        try {
            await client.query('BEGIN');

            await client.query(
                `DELETE FROM pais WHERE nome_pais = ANY($1)`,
                [[nomePaisOriginal, nomePaisNovo]]
            );
           
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it('Deve editar UF corretamente (nome)', async () => {
        const res = await agent
            .post('/movmassa/editUF')
            .send({ idUF: id_uf, nomeUF: nomeUFEditado, idPaisUF: id_pais_original })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizada com sucesso/i);
    });

    it('Deve impedir atualização para nome duplicado', async () => {
        const res = await agent
            .post('/movmassa/editUF')
            .send({ idUF: id_uf, nomeUF: nomeUFDuplicado, idPaisUF: id_pais_original })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/ Esta UF já está Cadastrada nesse país /i);
    });

    it('Deve permitir atualizar o País de uma UF', async () => {
        const res = await agent
            .post('/movmassa/editUF')
            .send({ idUF: id_uf, nomeUF: nomeUFEditado, idPaisUF: id_pais_novo })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizada com sucesso/i);

        const { rows } = await client.query(
            `SELECT id_pais FROM uf WHERE id_uf = $1`,
            [id_uf]
        );
        expect(rows[0].id_pais).toBe(id_pais_novo);
    });
});
