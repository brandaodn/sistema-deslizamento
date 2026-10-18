const request = require("supertest");
const { app } = require("../../app");
const client = require("../../db");

require('dotenv').config();

describe("Editar evento (/editEvento)", () => {
    let agent;
    let id_evento;
    let id_pais_original;
    let id_pais_novo;
    let id_uf_original;
    let id_uf_novo;
    let id_mun_original;
    let id_mun_novo;

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

    it("Deve editar evento corretamente e mudar de município", async () => {
        let novaLongitude = 50.5;

        const res = await agent
            .post("/movmassa/editEvento")
            .send({
                idEvento: id_evento,
                idMunicipioEvento: id_mun_novo,
                descricaoTipo: descricaoTipo,
                categoriaTipo: ["Natural"],
                materialDominanteTipo: "Rocha",
                velocidadeTipo: 1.5,
                dataEvento: "2024-06-01",
                longitudeEvento: novaLongitude,
                latitudeEvento: -22.9,
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
        })
        .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Evento atualizado com sucesso/i);

        const { rows } = await client.query(
            `SELECT e.id_evento, e.id_municipio, e.coordenadas_x, m.id_uf, u.id_pais
             FROM evento e
             JOIN municipio m ON e.id_municipio = m.id_municipio
             JOIN uf u ON m.id_uf = u.id_uf
             WHERE e.id_evento = $1`,
            [id_evento]
        );
        expect(rows[0].id_municipio).toBe(id_mun_novo);
        expect(rows[0].id_pais).toBe(id_pais_novo);
        expect(Number(rows[0].coordenadas_x)).toBe(novaLongitude);
    });
});
