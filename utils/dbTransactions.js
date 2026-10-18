async function transactionWrapper(client, callback) {
    try {
        await client.query('BEGIN');
        await callback();
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        //res.status(500).send('Erro no servidor.');
        throw error;
    }
}

module.exports = transactionWrapper;
