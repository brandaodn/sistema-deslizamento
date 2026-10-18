const { Client } = require("pg");
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});

client.connect()
    .then(() => console.log("Conectado ao banco de dados com sucesso!"))
    .catch(err => console.error("Erro ao conectar ao banco de dados: ", err));

module.exports = client;
