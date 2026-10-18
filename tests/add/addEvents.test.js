const request = require("supertest");
const { app } = require('../../app');
const client = require('../../db');

require('dotenv').config();

describe("Adicionar evento (/addEvento)", () => {
    let id_mun;

    const testId = Date.now();
    const nomePais = `EVENTS COUNTRY EXAMPLE ${testId}`;
    const nomeUF = `EVENTS UF EXAMPLE ${testId}`;
    const nomeMun = `EVENTS MUN EXAMPLE ${testId}`;
    const descricaoTipo = `EVENTS EXAMPLE ${testId}`;

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

        id_mun = mun_rows[0].id_municipio;
    });

    afterAll(async () => {
        try {
            await client.query('BEGIN');
    
            await client.query(`DELETE FROM tipo WHERE descricao = $1 AND material_dominante = $2`,
                [descricaoTipo, "Rocha"]
            );
            await client.query(
                `DELETE FROM pais WHERE nome_pais = '${nomePais}'`
            );     
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
        } 
    });

    it("deve adicionar um evento completo com dados válidos", async () => {
        const res = await agent
        .post("/movmassa/addEvento")
        .send({
            descricaoTipo: descricaoTipo,
            categoriaTipo: ["Natural", "Geológico"],
            materialDominanteTipo: "Rocha",
            velocidadeTipo: 2.1,
            dataEvento: "2024-05-01",
            longitudeEvento: "-43.1729",
            latitudeEvento: "-22.9068",
            idMunicipioEvento: id_mun,
            tempoRecuperacaoSocial: 60,
            servicosEssenciaisAfetados: ["Energia", "Água"],
            nFamiliasAfetadas: 10,
            nDesalojados: 5,
            nDesaparecidos: 0,
            nMortos: 2,
            nFeridos: 3,
            nDesabrigados: 4,
            seguroCobertura: true,
            custoRecuperacao: 500000,
            danoPatrimonioPrivado: 200000,
            danoPatrimonioPublico: 300000,
            danoEconomicoTotal: 1000000,
            duracaoInterrupcaoEconomica: 7,
            setoresAfetados: ["Agricultura", "Comércio"],
            danosAgricolasValorEstimado: 150000,
            danosAgricolasAreaAtingida: 100,
            danosAgricolasPercentualAreaAtingida: 50,
            danosAgricolasCulturaAtingida: "Café",
            areaAtingida: 2.5,
            custoMitigacao: 75000,
            recursosAfetados: "Mata Atlântica",
            danosBiodiversidade: "Alta",
            tipoImpactoAmbiental: "Erosão",
            tempoRecuperacaoAmbiental: 120,
            statusRecuperacaoAmbiental: "Parcial",
            vento: 20,
            precipitacaoEvento: 150,
            precipitacao5d: 300,
            precipitacao10d: 450,
            precipitacaoMensal: 600,
            temperatura: 28,
            etp: 5.5,
            pressaoAtm: 1010,
            escavacao: true,
            mineracao: false,
            sobrecarga: false,
            tipoUso: "Urbano",
            tipoRocha: "Granito",
            composicao: "Quartzo",
            estrutura: "Fraturada",
            idade: 200,
            tectonismo: true,
            declividade: 30,
            altitude: 500,
            orientacao: "Norte",
            curvaturaHorizontal: "Côncava",
            curvaturaVertical: "Convexa",
            urlPedologia: "http://example.com/solo",
            classeSolo: "Latossolo",
            profundidade: 4,
            textura: "Argilosa",
            porosidade: 30,
            uvcc: 1.1,
            uvEvento: 1.3,
            cad: 0.7,
            k: 0.02
        })
        .redirects(1);

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Evento adicionado com sucesso");
    });
});
