const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Adicionar país (/addPais)', () => {
    let agent;

    const testId = Date.now();
    const nomePais = `${testId} EXAMPLE COUNTRY`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app); 
                
        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass }); //Realizando login com usuário do tipo admin
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

    it('Deve renderizar a página de inserção', async () => {
        const res = await agent.get('/movmassa/insercao' );
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch("Inserção de Dados");
    });

    it('Deve criar pais corretamente', async () => {
        const res = await agent
            .post('/movmassa/addPais')
            .send({ nomePais: nomePais })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/ adicionado com sucesso/i);
    });

    it('Deve impedir país de nome duplicado', async () => {
        const res = await agent
            .post('/movmassa/addPais')
            .send({ nomePais: nomePais })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Este País já está Cadastrado/i);
    });
});
