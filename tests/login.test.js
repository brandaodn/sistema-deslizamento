const request = require('supertest');
const { app } = require('../app');
const client = require('../db');
const bcrypt = require('bcrypt');

describe('Testes de autenticação (/login)', () => {
    it('Deve exibir a página de login ao acessar /', async () => {
        const res = await request(app).get('/movmassa/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/login/i);
    });

    it('Deve falhar ao logar com usuário inexistente', async () => {
        const res = await request(app)
            .post('/movmassa/login')
            .send({ email: 'inexistente@teste.com', senha: '123456' });

        expect(res.text).toMatch(/Usuário não encontrado/i);
    });

    describe('Login com usuário existente', () => {
        const mockUser = {
            email: 'usuario@teste.com',
            senha: 'senha123',
            tipo: 'comum'
        };

        beforeAll(async () => {
            const hashedPassword = await bcrypt.hash(mockUser.senha, 10);
            await client.query(
                'INSERT INTO users (email, senha, tipo) VALUES ($1, $2, $3)',
                [mockUser.email, hashedPassword, mockUser.tipo]
            );
        });

        afterAll(async () => {
            await client.query('DELETE FROM users WHERE email = $1', [mockUser.email]);
        });

        it('Deve autenticar com sucesso um usuário existente', async () => {
            const res = await request(app)
                .post('/movmassa/login')
                .send({ email: mockUser.email, senha: mockUser.senha });

                expect(res.statusCode).toBe(200);
                expect(res.text).toMatch(/Funcionalidades/i);
        });

        it('Deve falhar ao autenticar com senha incorreta', async () => {
            const res = await request(app)
                .post('/movmassa/login')
                .send({ email: mockUser.email, senha: 'senha_errada' });

            expect(res.text).toMatch(/Senha inválida/i);
        });
    });
});