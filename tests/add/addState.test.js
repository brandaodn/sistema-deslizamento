const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Adicionar UF (/addUF)', () => {
    let agent;
    let id_pais;

    const testId = Date.now();
    const nomePais = `STATE COUNTRY EXAMPLE ${testId}`;
    const nomeUF = `STATE UF EXAMPLE ${testId}`;

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

        const { rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = '${nomePais}'`
        );
        id_pais = rows[0].id_pais;
    });

    afterAll(async () => {

        try {
            await client.query('BEGIN');
    
            await client.query(
                `DELETE FROM pais WHERE nome_pais =  '${nomePais}'`
            );
      
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it('Deve criar UF corretamente', async () => {
        const res = await agent
            .post('/movmassa/addUF')
            .send({ nomeUF : nomeUF, idPaisUF: id_pais })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/ adicionado com sucesso/i);
    });

    it('Deve impedir UF de nome duplicado', async () => {
        const res = await agent
            .post('/movmassa/addUF')
            .send({ nomeUF: nomeUF, idPaisUF: id_pais })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Este UF já está Cadastrado/i);
    });
});
