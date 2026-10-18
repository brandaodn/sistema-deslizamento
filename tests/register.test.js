const request = require('supertest');
const { app } = require('../app');
const client = require('../db');

describe('Página de registro (/register)', () => {
    const testUsers = [
        { email: 'testuser@example.com', senha: 'validPASS123!' },
        { email: 'usertest@example.com', senha: 'otherPASS123?' },
        { email: 'strong@example.com', senha: 'Strong123!'}
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

    it('Deve renderizar a página de registro', async () => {
        const res = await request(app).get('/movmassa/register');
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch("Crie sua conta");
    });

    it('Deve criar conta com senha válida', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: testUsers[0].email, senha: testUsers[0].senha });
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Usuário cadastrado com sucesso/i);
    });

    it('Deve impedir registro com email duplicado', async () => {
        await request(app)
            .post('/movmassa/cadUser')
            .send({ email: testUsers[1].email, senha: testUsers[1].senha });
        
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: testUsers[1].email, senha: 'testPASS1!' });
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Usuário já cadastrado/i);
    });

    it('Deve proibir criação de senha com menos de 8 caracteres', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: "email@email.com", senha: '1234567' });
        
        expect(res.statusCode).toBe(200); 
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial/i);
    });

    it('Deve rejeitar senha sem letras maiúsculas', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: 'weak1@example.com', senha: 'senha123!' });

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial/i);
    });

    it('Deve rejeitar senha sem letras minúsculas', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: 'weak2@example.com', senha: 'SENHA123!' });

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial/i);
    });

    it('Deve rejeitar senha sem números', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: 'weak3@example.com', senha: 'SenhaFort!' });

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial/i);
    });

    it('Deve rejeitar senha sem caracteres especiais', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: 'weak4@example.com', senha: 'Senha1234' });

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caracter especial/i);
    });

    it('Deve aceitar senha forte com todos os critérios', async () => {
        const res = await request(app)
            .post('/movmassa/cadUser')
            .send({ email: testUsers[2].email, senha: testUsers[2].senha });

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Usuário cadastrado com sucesso/i);
    });

});
