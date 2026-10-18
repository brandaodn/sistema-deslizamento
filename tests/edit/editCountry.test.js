const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Editar país (/editPais)', () => {
    let agent;
    let paisId;
    const testId = Date.now();
    const nomePaisOriginal = `${testId} ORIGINAL COUNTRY`;
    const nomePaisEditado = `${testId} EDITED COUNTRY`;
    const nomePaisDuplicado = `${testId} DUPLICATED COUNTRY`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app);

        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass });

        const res = await client.query(
            `INSERT INTO pais (nome_pais) VALUES ($1) RETURNING id_pais`,
            [nomePaisOriginal]
        );
        paisId = res.rows[0].id_pais;

        await client.query(
            `INSERT INTO pais (nome_pais) VALUES ($1)`,
            [nomePaisDuplicado]
        );
    });

    afterAll(async () => {
        try {
            await client.query(
                `DELETE FROM pais WHERE nome_pais = ANY($1)`,
                [[nomePaisOriginal, nomePaisEditado, nomePaisDuplicado]]
            );
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it('Deve renderizar a página de edição', async () => {
        const res = await agent.get(`/movmassa/edicao`);
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Edição de Dados/);
    });

    it('Deve editar país corretamente', async () => {
        const res = await agent
            .post('/movmassa/editPais')
            .send({ idPais: paisId, nomePais: nomePaisEditado })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizado com sucesso/i);
    });

    it('Deve impedir atualização para nome duplicado', async () => {
        const res = await agent
            .post('/movmassa/editPais')
            .send({ idPais: paisId, nomePais: nomePaisDuplicado })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Este País já está Cadastrado/i);
    });
});
