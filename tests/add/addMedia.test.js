const request = require("supertest");
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe("Adicionar Mídia (/addMidia)", () => {
    let id_evento;

    const testId = Date.now();
    const nomePais = `MEDIA COUNTRY EXAMPLE ${testId}`;
    const nomeUF = `MEDIA UF EXAMPLE ${testId}`;
    const nomeMun = `MEDIA MUN EXAMPLE ${testId}`;
    const descricaoTipo = `MEDIA EXAMPLE ${testId}`;

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

        await agent
            .post('/movmassa/addMun')
            .send({ nomeMunicipio : nomeMun, idEstadoMunicipio : uf_rows[0].id_uf });
        const { rows: mun_rows } = await client.query(
            `SELECT id_municipio FROM municipio WHERE nome_municipio = '${nomeMun}'`
        );

        await agent
            .post('/movmassa/addEvento')
            .send({
                descricaoTipo: descricaoTipo,
                categoriaTipo: ["Natural", "Geológico"],
                materialDominanteTipo: "Material exemplo",
                velocidadeTipo: 2.1,
                dataEvento: "1990-10-10",
                longitudeEvento: "-99.03125",
                latitudeEvento: "111.015625",
                idMunicipioEvento: mun_rows[0].id_municipio
        });
        const { rows: event_rows } = await client.query(
            "SELECT id_evento FROM evento WHERE coordenadas_x = -99.03125 AND coordenadas_y = 111.015625 AND data_evento='1990-10-10'"
        );

        id_evento = event_rows[0].id_evento;
    });

    afterAll(async () => {
        try {
            await client.query('BEGIN');
    
            await client.query(`DELETE FROM tipo WHERE descricao = $1 AND material_dominante = $2`,
                [descricaoTipo, "Material exemplo"]
            );
            await client.query(
                `DELETE FROM pais WHERE nome_pais = '${nomePais}'`
            );     
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        }
    });

    it("Deve adicionar uma mídia completa com dados válidos", async () => {
        const res = await agent
        .post('/movmassa/addMidia')
        .send({
            tipoMidia : "Foto",
            fonteMidia : "Jornal", 
            dataColeta : "1989-03-02", 
            urlMidia : "www.jornalexemplo.com/acidente-exemplo.png", 
            idEventoMidia : id_evento
        })
        .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Mídia cadastrada com sucesso");
    });

    it('Deve impedir nova mídia com a mesma URL', async () => {
        const res = await agent
            .post('/movmassa/addMidia')
            .send({
                tipoMidia : "Foto",
                fonteMidia : "Jornal", 
                dataColeta : "1990-03-02", 
                urlMidia : "www.jornalexemplo.com/acidente-exemplo.png", 
                idEventoMidia : id_evento
            })
            .redirects(1);
        
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toMatch(/Mídia já cadastrada/i);
    });
});
