const request = require('supertest');
const { app } = require('../app');
const client = require('../db');

describe('Alterar senha (/mudSenha)', () => {
    const testId = Date.now();

    const testUsers = [
        { email: `usertest1${testId}@test.com`, senha: 'P@ssw0rd!' },
        { email: `usertest2${testId}@test.com`, senha: 'P@ssw0rd!' },
        { email: `usertest3${testId}@test.com`, senha: 'P@ssw0rd!' },
        { email: `usertest4${testId}@test.com`, senha: 'P@ssw0rd!' }
    ];

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


    it('Deve atualizar a senha com os dados corretos', async () => {
        const agent = request.agent(app); 
        
        await agent
            .post('/movmassa/cadUser')
            .send({ email: testUsers[0].email, senha: testUsers[0].senha });
        
        const res = await agent
            .post('/movmassa/mudSenha')
            .send({
                senhaV: testUsers[0].senha,
                senhaN: 'N3wP4ssword?'
            });
    
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Senha alterada com sucesso/i);
    });
    
    it('Não deve atualizar a senha quando a senha antiga está incorreta', async () => {
        const agent = request.agent(app); 
        
        await agent
            .post('/movmassa/cadUser')
            .send({ email: testUsers[1].email, senha: testUsers[1].senha });
        

        const res = await agent
            .post('/movmassa/mudSenha')
            .send({
                senhaV: testUsers[1].senha + "Wrong",
                senhaN: 'NewP@ssword2'
            });
    
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Senha incorreta/i);
    });

    it('Não deve atualizar a senha quando a senha nova não tem 8 caracteres', async () => {
        const agent = request.agent(app); 
        
        await agent
            .post('/movmassa/cadUser')
            .send({ email: testUsers[2].email, senha: testUsers[2].senha });
        
        const res = await agent
            .post('/movmassa/mudSenha')
            .send({
                senhaV: testUsers[2].senha,
                senhaN: '1234567'
            });
    
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial/i);
    });

    it('Não deve atualizar a senha quando o usuário não é encontrado', async () => {
        const agent = request.agent(app); 
        
        await agent
            .post('/movmassa/cadUser')
            .send({ email: testUsers[3].email, senha: testUsers[3].senha });
        
        await client.query(
            'DELETE FROM users WHERE email = $1',
            [testUsers[3].email]
        );
        const res = await agent
            .post('/movmassa/mudSenha')
            .send({
                senhaV: testUsers[3].senha,
                senhaN: 'NewP@ssword2'
            });
    
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Usuário não encontrado/i);
    });
});