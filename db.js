const { Pool } = require('pg');
const { AsyncLocalStorage } = require('async_hooks');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 5000,
});

const transactionStorage = new AsyncLocalStorage();

pool.on('error', (err) => {
    console.error('Erro inesperado no pool PostgreSQL:', err);
});

pool.query('SELECT 1')
    .then(() => console.log('Conectado ao banco de dados com sucesso!'))
    .catch(err => console.error('Erro ao conectar ao banco de dados:', err));

const db = {
    query(text, params) {
        const transactionClient = transactionStorage.getStore();
        return transactionClient
            ? transactionClient.query(text, params)
            : pool.query(text, params);
    },

    async withTransaction(callback) {
        const transactionClient = await pool.connect();

        try {
            await transactionClient.query('BEGIN');
            const result = await transactionStorage.run(
                transactionClient,
                () => callback(transactionClient)
            );
            await transactionClient.query('COMMIT');
            return result;
        } catch (error) {
            await transactionClient.query('ROLLBACK');
            throw error;
        } finally {
            transactionClient.release();
        }
    },

    pool
};

module.exports = db;
