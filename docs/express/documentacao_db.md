# Documentação do Arquivo db.js

## Visão Geral

O arquivo `db.js` é responsável pela configuração e inicialização da conexão com o banco de dados PostgreSQL. Utiliza o pacote `pg` (node-postgres) para estabelecer essa conexão e exporta o cliente configurado para ser utilizado em outras partes da aplicação.

---

## Importação do Cliente PostgreSQL

```js
const { Client } = require("pg");
```

- Importa a classe `Client` do pacote `pg`, responsável por gerenciar a conexão com o banco de dados PostgreSQL.

---

## Configuração da Conexão

```js
const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});
```

- Cria uma nova instância de `Client` com os parâmetros necessários para conectar ao banco de dados.
- **host:** endereço onde o banco de dados está hospedado.
- **user:** nome do usuário do banco.
- **password:** senha de acesso.
- **database:** nome do banco de dados a ser utilizado.
- **port:** porta do PostgreSQL.

- Será necessário criar variáveis de ambiente de mesmo nome para a conexão com o banco. Mais detalhes sobre esse processo na documentação *como_executar_projeto.md*

---

## Estabelecendo a Conexão

```js
client.connect()
    .then(() => console.log("Conectado ao banco de dados com sucesso!"))
    .catch(err => console.error("Erro ao conectar ao banco de dados: ", err));
```

- Tenta conectar ao banco de dados utilizando `connect()`.
- Caso a conexão seja bem-sucedida, exibe uma mensagem de sucesso no console.
- Caso ocorra erro, exibe uma mensagem de erro detalhada no console.

### Boas práticas

- Utilização de `.then()` e `.catch()` garante o tratamento adequado de promessas e erros.
- Ideal para ambientes de desenvolvimento; em produção, recomenda-se tratamento adicional para reconexão e logs persistentes.

---

## Exportação do Cliente

```js
module.exports = client;
```

- Exporta a instância `client` para que outras partes da aplicação possam reutilizá-la para executar queries no banco de dados.

---

## Considerações Finais

- O `db.js` centraliza a configuração de conexão com o banco PostgreSQL, promovendo reutilização e manutenção simplificada.
- A separação da lógica de conexão do restante da aplicação segue boas práticas de design modular.
- Pode ser facilmente adaptado para uso com pools de conexões (`Pool`) se necessário, dependendo da escala do sistema.
