
# Documentação do Arquivo `auth.routes.js`

---

## Visão Geral

Este arquivo define as **rotas de autenticação** da aplicação usando o framework **Express.js**. Ele mapeia as requisições HTTP relacionadas a login e cadastro de usuários para seus respectivos métodos no **controller de autenticação**.

A estrutura segue o padrão **MVC (Model-View-Controller)**, em que:

- O **Router** encaminha as requisições.
- O **Controller (`auth.controller`)** contém a lógica executada.
- As **Views** são renderizadas conforme necessário a partir do controller.

---

## Estrutura do Código

```js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
```

### Descrição

- **Importações:**
  - `express`: framework web utilizado para definir rotas.
  - `router`: instância do roteador do Express para modularizar as rotas.
  - `authController`: módulo que contém os métodos responsáveis pelo controle das operações de autenticação.

- **Boas práticas:** separação da lógica de roteamento e lógica de controle, favorecendo organização e manutenibilidade.

---

## Definição das Rotas

```js
// Rotas de autenticação
router.get('/', authController.showLogin);
router.get('/register', authController.showRegister);
router.post('/login', authController.login);
router.post('/cadUser', authController.register);
```

### Detalhamento das Rotas

| Método | Rota        | Método no Controller | Descrição                                                        |
|--------|-------------|----------------------|------------------------------------------------------------------|
| GET    | `/`         | `showLogin`          | Renderiza a página de login.                                     |
| GET    | `/register` | `showRegister`       | Renderiza a página de registro de usuário.                       |
| POST   | `/login`    | `login`              | Processa os dados do formulário de login (autenticação).         |
| POST   | `/cadUser`  | `register`           | Processa os dados do formulário de cadastro de novo usuário.     |

- **GET /:** usado para apresentar ao usuário o formulário de login.
- **GET /register:** exibe o formulário de cadastro.
- **POST /login:** recebe email e senha e executa a autenticação.
- **POST /cadUser:** processa o cadastro de novos usuários com base nos dados enviados via formulário.

- **Boas práticas:** os endpoints são intuitivos e seguem convenções REST (uso de POST para criação/envio de dados).

---

## Exportação do Roteador

```js
module.exports = router;
```

### Descrição

- Exporta o roteador configurado, permitindo que ele seja importado e utilizado no arquivo principal da aplicação (`app.js` ou `server.js`).
- Isso permite organizar o código em módulos menores, mais fáceis de manter e testar.

---

## Considerações Finais

- **Modularidade:** separação entre rotas e lógica de controle por meio do uso de `authController`.
- **Escalabilidade:** este padrão facilita a adição de novas rotas ou lógica sem afetar outras partes da aplicação.
- **Legibilidade:** uso claro e direto das rotas com nomes autoexplicativos.
- **Manutenibilidade:** organização baseada em responsabilidade única facilita futuras alterações ou correções.

---

## Dependências

- **Express.js:** necessário para criar o servidor e definir rotas.
- **auth.controller.js:** deve conter as funções `showLogin`, `showRegister`, `login` e `register` com a lógica de autenticação e manipulação de views.
