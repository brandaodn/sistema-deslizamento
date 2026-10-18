async function transactionWrapper(client, callback) {
    if (typeof client.withTransaction === 'function') {
        return client.withTransaction(callback);
    }

    await client.query('BEGIN');
    try {
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

module.exports = transactionWrapper;
