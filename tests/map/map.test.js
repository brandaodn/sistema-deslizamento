const request = require('supertest');
const { app } = require('../../app');
const client = require('../../db');

describe('Visualizar eventos validados (/visualizar-eventos)', () => {

    let agent;
    let id_evento;
    let id_pais_original;
    let id_pais_novo;
    let id_uf_original;
    let id_uf_novo;
    let id_mun_original;

    const testId = Date.now();
    const nomePaisOriginal = `EVENT COUNTRY ORIGINAL ${testId}`;
    const nomePaisNovo = `EVENT COUNTRY NEW ${testId}`;
    const nomeUFOriginal = `EVENT UF ORIGINAL ${testId}`;
    const nomeUFNovo = `EVENT UF NEW ${testId}`;
    const nomeMunOriginal = `EVENT MUN ORIGINAL ${testId}`;
    const nomeMunNovo = `EVENT MUN NEW ${testId}`;
    const descricaoTipo = `EVENT EDIT ${testId}`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app);

        await agent
            .post("/movmassa/login")
            .send({ email: email, senha: pass });

        await agent.post("/movmassa/addPais").send({ nomePais: nomePaisOriginal });
        const { rows: pais_rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = $1`,
            [nomePaisOriginal]
        );
        id_pais_original = pais_rows[0].id_pais;

        await agent.post("/movmassa/addUF").send({ nomeUF: nomeUFOriginal, idPaisUF: id_pais_original });
        const { rows: uf_rows } = await client.query(
            `SELECT id_uf FROM uf WHERE nome_uf = $1`,
            [nomeUFOriginal]
        );
        id_uf_original = uf_rows[0].id_uf;

        await agent.post("/movmassa/addMun").send({ nomeMunicipio: nomeMunOriginal, idEstadoMunicipio: id_uf_original });
        const { rows: mun_rows } = await client.query(
            `SELECT id_municipio FROM municipio WHERE nome_municipio = $1`,
            [nomeMunOriginal]
        );
        id_mun_original = mun_rows[0].id_municipio;

        await agent.post("/movmassa/addPais").send({ nomePais: nomePaisNovo });
        const { rows: pais_rows2 } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = $1`,
            [nomePaisNovo]
        );
        id_pais_novo = pais_rows2[0].id_pais;

        await agent.post("/movmassa/addUF").send({ nomeUF: nomeUFNovo, idPaisUF: id_pais_novo });
        const { rows: uf_rows2 } = await client.query(
            `SELECT id_uf FROM uf WHERE nome_uf = $1`,
            [nomeUFNovo]
        );
        id_uf_novo = uf_rows2[0].id_uf;

        await agent.post("/movmassa/addMun").send({ nomeMunicipio: nomeMunNovo, idEstadoMunicipio: id_uf_novo });
        const { rows: mun_rows2 } = await client.query(
            `SELECT id_municipio FROM municipio WHERE nome_municipio = $1`,
            [nomeMunNovo]
        );
        id_mun_novo = mun_rows2[0].id_municipio;

        await agent.post("/movmassa/addEvento").send({
            descricaoTipo: descricaoTipo,
            categoriaTipo: ["Natural"],
            materialDominanteTipo: "Rocha",
            velocidadeTipo: 1.5,
            dataEvento: "2024-06-01",
            longitudeEvento: "-43.2",
            latitudeEvento: "-22.9",
            idMunicipioEvento: id_mun_original,
            tempoRecuperacaoSocial: 30,
            servicosEssenciaisAfetados: ["Energia"],
            nFamiliasAfetadas: 5,
            nDesalojados: 2,
            nDesaparecidos: 0,
            nMortos: 0,
            nFeridos: 1,
            nDesabrigados: 1,
            seguroCobertura: false,
            custoRecuperacao: 100000,
            danoPatrimonioPrivado: 50000,
            danoPatrimonioPublico: 50000,
            danoEconomicoTotal: 200000,
            duracaoInterrupcaoEconomica: 3,
            setoresAfetados: ["Comércio"],
            areaAtingida: 1.0
        });

        const { rows: evento_rows } = await client.query(
            `SELECT id_evento FROM evento e 
             JOIN tipo t ON e.id_tipo = t.id_tipo
             WHERE t.descricao = $1`,
            [descricaoTipo]
        );
        id_evento = evento_rows[0].id_evento;
    });

    afterAll(async () => {
         try {
            await client.query("BEGIN");

            await client.query(
                `DELETE FROM pais WHERE id_pais = ANY($1)`,
                [[id_pais_original, id_pais_novo]]
            );
            await client.query(`DELETE FROM tipo WHERE descricao = $1`, [descricaoTipo]);
            await client.query("COMMIT");
        } catch (err) {
            await client.query("ROLLBACK");
        }
    });

    describe('Controle de autenticação', () => {
        it('Deve redirecionar usuário não autenticado ao acessar visualizar-eventos', async () => {
            const res = await request(app).get('/movmassa/visualizar-eventos');
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe('/movmassa/');
        });

        it('Deve redirecionar usuário não autenticado ao acessar mais-detalhes', async () => {
            const res = await request(app).get('/movmassa/mais-detalhes');
            expect(res.statusCode).toBe(302);
        });
    });

    describe('Acesso autenticado às páginas', () => {
        it('Deve exibir a página do mapa para usuário autenticado', async () => {
            const res = await agent.get('/movmassa/visualizar-eventos');

            expect(res.statusCode).toBe(200);
            expect(res.text).toMatch(/mapa|eventos/i);
        });

        it('Deve exibir a página de detalhes do evento', async () => {
            const res = await agent.get(`/movmassa/mais-detalhes?evento=${id_evento}`);

            expect(res.statusCode).toBe(200);
        });
    });

    describe('Acesso de usuário comum', () => {
        const commonUser = {
            email: `comum-visualizar-${testId}@teste.com`,
            senha: 'Senha@12345'
        };

        beforeAll(async () => {
            const hashedPassword = require('bcrypt').hashSync(commonUser.senha, 10);
            await client.query(
                'INSERT INTO users (email, senha, tipo) VALUES ($1, $2, $3)',
                [commonUser.email, hashedPassword, 'comum']
            );
        });

        afterAll(async () => {
            await client.query('DELETE FROM users WHERE email = $1', [commonUser.email]);
        });

        it('Deve exibir a página do mapa para usuário comum autenticado', async () => {
            const commonAgent = request.agent(app);

            await commonAgent
                .post('/movmassa/login')
                .send({ email: commonUser.email, senha: commonUser.senha });

            const res = await commonAgent.get('/movmassa/visualizar-eventos');

            expect(res.statusCode).toBe(200);
            expect(res.text).toMatch(/mapa|eventos/i);
        });

        it('Deve exibir a página de detalhes do evento para usuário comum autenticado', async () => {
            const commonAgent = request.agent(app);

            await commonAgent
                .post('/movmassa/login')
                .send({ email: commonUser.email, senha: commonUser.senha });

            const res = await commonAgent.get(`/movmassa/mais-detalhes?evento=${id_evento}`);

            expect(res.statusCode).toBe(200);
        });
    });

    describe('Definição de evento para visualização', () => {

        it('Deve redirecionar para mais-detalhes quando evento existir', async () => {

            const res = await agent
                .post('/movmassa/ver-detalhes')
                .send({ idEvento: id_evento });

            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe(`/movmassa/mais-detalhes?evento=${id_evento}`);
        });

        it('Deve redirecionar para visualizar-eventos quando evento não existir', async () => {

            const res = await agent
                .post('/movmassa/ver-detalhes')
                .send({ idEvento: -1 });

            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toMatch(/visualizar-eventos/);
        });

        it('Deve redirecionar para visualizar-eventos quando nenhum evento for selecionado', async () => {

            const res = await agent
                .post('/movmassa/ver-detalhes')
                .send({ idEvento: '' });

            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toMatch(/visualizar-eventos/);
        });
    });

    describe('Geração de CSV', () => {
        it('Deve gerar e retornar um CSV válido', async () => {
            const res = await agent
                .post('/movmassa/gerarCSV')
                .send({
                    nomeEvento: 'Evento Teste',
                    latitudeEvento: '-23.5',
                    longitudeEvento: '-46.6'
                });

            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toMatch(/text\/csv/);
            expect(res.text).toMatch(/nomeEvento;latitudeEvento;longitudeEvento/);
            expect(res.text).toMatch(/="\-23.5"/);
        });
    });
});
