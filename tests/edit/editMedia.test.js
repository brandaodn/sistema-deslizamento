const request = require("supertest");
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe("Editar Mídia (/editMidia)", () => {
    let agent;
    let id_evento_original;
    let id_evento_novo;
    let id_midia;

    const testId = Date.now();
    const nomePais = `MEDIA COUNTRY EDIT ${testId}`;
    const nomeUF = `MEDIA UF EDIT ${testId}`;
    const nomeMun = `MEDIA MUN EDIT ${testId}`;
    const descricaoTipo = `MEDIA EDIT ${testId}`;
    const descricaoTipoNovo = `MEDIA EDIT NOVO ${testId}`;
    const urlMidiaOriginal = `www.exemplo.com/midia${testId}.png`;
    const urlMidiaDuplicada = `www.exemplo.com/midiaDuplicada${testId}.png`;

    const email = process.env.USER_EMAIL;
    const pass = process.env.USER_PASSWORD;

    beforeAll(async () => {
        agent = request.agent(app);
        await agent
            .post('/movmassa/login')
            .send({ email: email, senha: pass });

        await agent.post('/movmassa/addPais').send({ nomePais });
        const { rows: pais_rows } = await client.query(
            `SELECT id_pais FROM pais WHERE nome_pais = '${nomePais}'`
        );

        await agent.post('/movmassa/addUF').send({ nomeUF, idPaisUF: pais_rows[0].id_pais });
        const { rows: uf_rows } = await client.query(
            `SELECT id_uf FROM uf WHERE nome_uf = '${nomeUF}'`
        );

        await agent.post('/movmassa/addMun').send({ nomeMunicipio: nomeMun, idEstadoMunicipio: uf_rows[0].id_uf });
        const { rows: mun_rows } = await client.query(
            `SELECT id_municipio FROM municipio WHERE nome_municipio = '${nomeMun}'`
        );

        await agent.post("/movmassa/addEvento").send({
            descricaoTipo,
            categoriaTipo: ["Natural", "Geológico"],
            materialDominanteTipo: "Material exemplo",
            velocidadeTipo: 1.5,
            dataEvento: "2000-01-01",
            longitudeEvento: "-90.123",
            latitudeEvento: "100.456",
            idMunicipioEvento: mun_rows[0].id_municipio
        });
        const { rows: event_rows } = await client.query(
            "SELECT id_evento FROM evento WHERE coordenadas_x = -90.123 AND coordenadas_y = 100.456 AND data_evento='2000-01-01'"
        );
        id_evento_original = event_rows[0].id_evento;

        await agent.post("/movmassa/addEvento").send({
            descricaoTipo: descricaoTipoNovo,
            categoriaTipo: ["Natural"],
            materialDominanteTipo: "Outro material",
            velocidadeTipo: 3.5,
            dataEvento: "2005-05-05",
            longitudeEvento: "-80.321",
            latitudeEvento: "120.654",
            idMunicipioEvento: mun_rows[0].id_municipio
        });
        const { rows: event_rows_novo } = await client.query(
            "SELECT id_evento FROM evento WHERE coordenadas_x = -80.321 AND coordenadas_y = 120.654 AND data_evento='2005-05-05'"
        );
        id_evento_novo = event_rows_novo[0].id_evento;

        const { rows: midia_rows } = await client.query(
            `INSERT INTO midia (tipo_midia, fonte_midia, data_coleta, url_midia, id_evento) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id_midia`,
            ["Foto", "Revista", "1999-12-31", urlMidiaOriginal, id_evento_original]
        );
        id_midia = midia_rows[0].id_midia;

        await client.query(
            `INSERT INTO midia (tipo_midia, fonte_midia, data_coleta, url_midia, id_evento) 
             VALUES ($1, $2, $3, $4, $5)`,
            ["Vídeo", "TV", "2001-02-02", urlMidiaDuplicada, id_evento_original]
        );
    });

    afterAll(async () => {
        try {
            await client.query('BEGIN');
        
            await client.query(
                `DELETE FROM tipo WHERE descricao LIKE '%${testId}'`
            );

            await client.query(
                `DELETE FROM pais WHERE nome_pais LIKE '%${testId}'`
            );  

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it("Deve editar os atributos da mídia corretamente", async () => {
        const res = await agent
            .post("/movmassa/editMidia")
            .send({
                idMidia: id_midia,
                tipoMidia: "Vídeo",
                fonteMidia: "Internet",
                dataColeta: "2010-10-10",
                urlMidia: urlMidiaOriginal,
                idEventoMidia: id_evento_original
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizada com sucesso/i);
    });

    it("Deve impedir atualização para URL duplicada", async () => {
        const res = await agent
            .post("/movmassa/editMidia")
            .send({
                idMidia: id_midia,
                tipoMidia: "Vídeo",
                fonteMidia: "Internet",
                dataColeta: "2011-11-11",
                urlMidia: urlMidiaDuplicada,
                idEventoMidia: id_evento_original
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/ Já existe uma mídia com a nova URL informada /i);
    });

    it("Deve permitir atualizar o evento associado à mídia", async () => {
        const res = await agent
            .post("/movmassa/editMidia")
            .send({
                idMidia: id_midia,
                tipoMidia: "Foto",
                fonteMidia: "Arquivo Histórico",
                dataColeta: "2015-05-15",
                urlMidia: urlMidiaOriginal,
                idEventoMidia: id_evento_novo 
            })
            .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/atualizada com sucesso/i);

        const { rows } = await client.query(
            `SELECT id_evento FROM midia WHERE id_midia = $1`,
            [id_midia]
        );
        expect(rows[0].id_evento).toBe(id_evento_novo);
    });
});
