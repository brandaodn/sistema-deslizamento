# Como executar o projeto

## Pré-requisitos

Para a correta execução do projeto, é necessário que o ambiente possua os seguintes softwares instalados:

- Node.js : Versão > 14.15.0
- PostgreSQL : Versão > 10.0

## Baixando dependências do Node.js

1. Abra o terminal na pasta raiz *tcc-sistema-deslizamento*
2. Inicialmente, verifique se o node está corretamente instalado com

```cmd
node -v
```
- Caso seja retornado um erro do tipo CommandNotFoundException ou similar, significa que ainda não realizou a instalação do Node.js corretamente. Finalize essa instalação antes de continuar.

3. Execute o seguinte comando para instalar todas as dependências do projeto:

```cmd
npm i
```

## Configurando a conexão com o banco

1. Inicialmente, abra o gerenciador de banco de dados PostgreSQL de sua preferência, como PGAdmin ou DBeaver.

2. Em seguida, crie uma nova base de dados no seu gerenciador

- Defina o nome de preferência para a sua base de dados e, de preferência, mantenha o host como localhost e a porta como 5432

3. Popule essa nova base com as tabelas no projeto

- Você encontrará a definição das tabelas no arquivo scriptBD.sql
- Abra a Query Tool no gerenciador de banco de dados
- Copie todas as tabelas presentes no arquivo SQL, e cole na Query Tool. Não há problemas em criar todas as tabelas na mesma consulta
- Execute essa consulta, e verifique se todas as tabelas foram devidamente criadas

    - Como melhoria futura, uma abordagem de containerização para o banco de dados tornaria a conexão com o banco de dados algo mais prático 

4. No projeto, os arquivos db.js e usuario1.js possuem trechos de código que dependem de variáveis de ambiente, conforme ilustrado a seguir:

```js
const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 5432,
});

```
```js
let email = process.env.USER_EMAIL;
let senha = process.env.USER_PASSWORD;
let hashedPassword = await bcrypt.hash(senha, 10); 
let tipo = 'administrador';

await client.query('INSERT INTO users (tipo, email, senha) VALUES ($1, $2, $3)', [tipo, email, hashedPassword]);
```
- As definições da variável client e do primeiro usuário são dependentes de variáveis de ambiente. Assim, crie, na raíz do projeto, um arquivo .env, e preencha ele do seguinte modo:

```env
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=nome_da_base_de_dados_criada_no_passo_2
DB_PORT=5432
SESSION_SECRET=senha_secreta_segura
USER_EMAIL=usuarioadm@email.com
USER_PASSWORD=senhaDoAdmin1!
```
- Altere conforme as informações de seu banco de dados, do email e da senha que gostaria que seu administrador possua e do *secret* da sua sessão.
 
### Importante: Sobre o *secret* de sua sessão

A variável ```SESSION_SECRET``` é uma chave de segurança que protege os dados de sessão dos usuários (como login e permissões). Suas principais funções são:

1. Criptografar as sessões, impedindo a leitura de dados sensíveis por terceiros;
2. Evitar falsificação de identidade, protegendo contra ataques em que um usuário tenta se passar por outro;
3. Garantir segurança em ambiente de produção, sendo uma configuração obrigatória para uso real da aplicação.

Para gerar uma chave secreta segura, recomenda-se a utilização do seguinte comando no terminal:

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado (uma longa string de letras e números) e use como seu SESSION_SECRET.

**Importante**: Nunca compartilhe ou comite no Git o arquivo .env ou suas chaves reais.

## Executando testes automatizados

- Após a configuração do ambiente, os testes automatizados podem ser executados por meio do comando:

```cmd
npm test
```

## Executando o projeto
Após todas as configurações listadas acima, abra 2 terminais e execute, em cada um deles, os seguintes comandos:

```cmd
node app.js
node server.js
```

### Criando um usuário admin

Na primeira execução do sistema, o usuário disponível possui apenas funcionalidades básicas, como criação de conta, alteração de senha e visualização em mapa interativo, uma vez que usuários do tipo comum possuem permissões restritas.

Para a criação de um usuário do tipo 'administrador', execute o seguinte comando:

```cmd
node usuario1.js
```

Assim, você terá um usuário com todas as funcionalidades disponíveis, incluindo a criação de usuários dos 3 tipos: 'comum', 'curador' e 'administrador'