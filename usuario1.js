//CADASTRA O PRIMEIRO USUARIO

const { Client } = require("pg");
const bcrypt = require('bcryptjs'); 

// Configurações de conexão com o banco
require('dotenv').config();

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});

// Função assíncrona para executar a inserção no banco
async function insertUser() {
  try {
    // Conecta ao banco de dados
    await client.connect();
    console.log("Conectado ao banco de dados com sucesso!");

    // Dados do novo usuário
    let email = process.env.USER_EMAIL;
    let senha = process.env.USER_PASSWORD;
    let hashedPassword = await bcrypt.hash(senha, 10); // Criptografa a senha
    let tipo = 'administrador';

    // Executa a consulta de inserção
    await client.query('INSERT INTO users (tipo, email, senha) VALUES ($1, $2, $3)', [tipo, email, hashedPassword]);

    console.log("Usuário inserido com sucesso!");
  } catch (err) {
    console.error("Erro ao inserir usuário: ", err);
  } finally {
    // Fecha a conexão com o banco
    await client.end();
  }
}

// Chama a função para inserir o usuário
insertUser();
