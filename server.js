const { app } = require('./app');
const port = 3000;

require('dotenv').config();

const ip = process.env.IP_ADDRESS || 'localhost'

app.listen(port, ip, () => {
    console.log(`Servidor rodando em http://${ip}:${port}`);
});