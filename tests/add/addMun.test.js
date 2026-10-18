const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Adicionar Municipio (/addMun)', () => {
    let agent;
    let id_uf;

    const testId = Date.now();
    const nomePais = `MUN COUNTRY EXAMPLE ${testId}`;
    const nomeUF = `MUN UF EXAMPLE ${testId}`;
    const nomeMunicipio = `MUN EXAMPLE ${testId}`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app); 

        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass }); 

        await agent
            .post('/movmassa/addPais')
            .send({ nomePais: nomePais });

        const { rows: pais_rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = '${nomePais}'`
        );

        await agent
            .post('/movmassa/addUF')
            .send({ nomeUF: nomeUF, idPaisUF: pais_rows[0].id_pais });

        const { rows: uf_rows } = await client.query(
            `SELECT id_uf FROM UF WHERE nome_uf = '${nomeUF}'`
        );

        id_uf = uf_rows[0].id_uf;
    });

    afterAll(async () => {

        try {
            await client.query('BEGIN');
    
            await client.query(
                `DELETE FROM pais WHERE nome_pais = '${nomePais}'`
            );     
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it('Deve criar Município corretamente', async () => {
        const res = await agent
            .post('/movmassa/addMun')
            .send({ nomeMunicipio : nomeMunicipio, idEstadoMunicipio : id_uf })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/ adicionado com sucesso/i);
    });

    it('Deve impedir UF de nome duplicado', async () => {
        const res = await agent
            .post('/movmassa/addMun')
            .send({ nomeMunicipio : nomeMunicipio, idEstadoMunicipio : id_uf })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Este Município já foi cadastrado/i);
    });
});
