const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe('Página de adicionar usuários do administrador / Curador  (/addUser)', () => {
    const testUsers = [
        { email: 'newtestuser@example.com', senha: 'ValidPassword123!', tipo:'comum' },
        { email: 'anothertestuser@example.com', senha: 'OtherPassword123!', tipo:'Curador' }
    ];

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app); 
                
        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass }); 
    });

    afterAll(async () => {

        try {
            await client.query('BEGIN');
    
            await cleanTestUsers();    
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    const cleanTestUsers = async () => {
        try {
            const emails = testUsers.map(u => u.email);
            
            await client.query(
                'DELETE FROM users WHERE email = ANY($1) RETURNING *',
                [emails]
            );
            } catch (error) {
            console.error('Erro ao limpar usuários de teste:', error);
        }
    }; 

    it('Deve criar conta com senha válida', async () => {
        const res = await agent
            .post('/movmassa/addUser')
            .send({ email: testUsers[0].email, senha: testUsers[0].senha, tipo:testUsers[0].tipo })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Usuário cadastrado com sucesso/i);
    });

    it('Deve impedir registro com email duplicado', async () => {
        await agent
            .post('/movmassa/addUser')
            .send({ email: testUsers[1].email, senha: testUsers[1].senha, tipo : testUsers[1].tipo });
        
        const res = await agent
            .post('/movmassa/addUser')
            .send({ email: testUsers[1].email, senha: 'AnotherPass123!', tipo : testUsers[1].tipo })
            .redirects(1);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Usuário já cadastrado/i);
    });
    it('Deve proibir criação de senha com menos de 8 caracteres', async () => {
        const res = await agent
            .post('/movmassa/addUser')
            .send({ email: "email@email.com", senha: '1234567', tipo:'comum' })
            .redirects(1);
        
        expect(res.statusCode).toBe(200); 
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres/i);
    });
});
