const { app } = require('./app');
require('dotenv').config();

const port = parseInt(process.env.PORT, 10) || 3000;
const ip = process.env.IP_ADDRESS || 'localhost';

app.listen(port, ip, () => {
    console.log('Servidor rodando em http://' + ip + ':' + port);
});
