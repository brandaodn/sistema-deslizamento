
# Documentação do Arquivo app.js

## Visão Geral

Este arquivo é o ponto de entrada principal da aplicação Express.js. Ele define a configuração básica do servidor, middlewares utilizados, sessões de usuário e rotas da aplicação. A estrutura e configuração do projeto indicam uma aplicação web com foco em autenticação, navegação por menus e inserção de dados (provavelmente de deslizamentos de terra).

---

## Estrutura Geral do Arquivo

```js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
```

- Importa bibliotecas essenciais:
  - **express**: framework para criação do servidor web.
  - **path**: módulo nativo do Node.js para lidar com caminhos de arquivos.
  - **body-parser**: middleware para interpretar o corpo das requisições HTTP.
  - **express-session**: para controle de sessões do usuário.
- Cria uma instância do aplicativo Express.

---

## Middlewares Globais

```js
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
```

- Permite que o servidor interprete:
  - **URL-encoded data** (tipicamente usado em formulários).
  - **JSON**, para endpoints que esperam dados estruturados no corpo da requisição.

```js
app.use(express.static(path.join(__dirname, 'public')));
```

- Torna arquivos estáticos acessíveis via navegador (como CSS, JS e imagens). A pasta `public` funciona como raiz de arquivos públicos da aplicação.

---

## Configuração da View Engine

```js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

- Define o **EJS (Embedded JavaScript)** como mecanismo de visualização.
- Define o diretório **views/** como local padrão onde estão os arquivos `.ejs`.

- **Boas práticas:** separação da camada de visualização da lógica de negócios, utilizando `EJS` para renderizar conteúdo dinâmico.

---

## Gerenciamento de Sessão

```js
app.use(session({
    secret: 'sua_chave_secreta_segura',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
```

- Middleware `express-session` é utilizado para controlar sessões de usuários.

### Detalhes da configuração

- **secret:** chave usada para assinar o ID da sessão.
- **resave: false**: não salva a sessão novamente no store se ela não for modificada.
- **saveUninitialized: true**: salva novas sessões mesmo que não estejam modificadas.
- **cookie.secure: false**: permite uso de cookie em conexões não-HTTPS (útil em ambientes de desenvolvimento).

- **Boas práticas:** uso de sessões garante que o estado do usuário seja mantido entre as requisições (ex: login persistente).

---

## Rotas da Aplicação

```js
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const insertionRoutes = require('./routes/insertion.routes');

app.use('/', authRoutes);
app.use('/', menuRoutes);
app.use('/', insertionRoutes);
```

- Importa arquivos de rotas específicas:
  - **auth.routes.js**: gerencia autenticação (login, logout, registro).
  - **menu.routes.js**: lida com o menu principal da aplicação.
  - **insertion.routes.js**: responsável pelas rotas de inserção de dados de deslizamentos.
- Usa `app.use('/', ...)` para registrar os módulos de rota. Isso indica que as rotas definidas nesses arquivos serão acessíveis diretamente a partir da raiz `/`.

- **Boas práticas:** separação de responsabilidades, organizando as rotas por contexto funcional.

---

## Exportação da Aplicação

```js
module.exports = { app };
```

- Exporta a instância do Express (`app`) para que possa ser utilizada por outros arquivos do projeto (ex: um servidor HTTP separado ou testes automatizados).

---

## Considerações Finais

- O `app.js` segue o padrão típico de projetos Express:
  - Carrega middlewares essenciais.
  - Define uma engine de visualização.
  - Separa funcionalidades em rotas modulares.
  - Utiliza sessões para autenticação persistente.

### Boas práticas destacadas

- Organização modular por rotas.
- Uso de EJS para views dinâmicas.
- Implementação de middleware para tratamento do corpo das requisições.
- Uso de `express-session` para controle de usuários logados.
- Estrutura clara e extensível para novas funcionalidades.
