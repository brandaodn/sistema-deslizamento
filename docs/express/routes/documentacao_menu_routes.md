
# Documentação do Arquivo `menu.routes.js`

---

## Visão Geral

Este arquivo define as **rotas relacionadas ao menu principal do sistema** e à **alteração de senha do usuário**. Utiliza o framework **Express.js** e um middleware de autenticação para garantir que apenas usuários logados possam acessar essas funcionalidades.

Segue o padrão **MVC (Model-View-Controller)**:

- O **Router** define as rotas HTTP disponíveis.
- O **Controller (`menu.controller`)** implementa a lógica para exibição do menu e alteração de senha.
- O **Middleware** assegura que as rotas sejam acessíveis apenas por usuários autenticados.

---

## Estrutura do Código

```js
const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
```

### Descrição

- **Importações:**
  - `express`: framework para manipulação de rotas.
  - `router`: instância do roteador Express.
  - `menuController`: controlador com os métodos de manipulação do menu e senha.

---

## Middleware de Autenticação

```js
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/movmassa/');
    }
    
    return next();
};
```

### Descrição

- **Função:** Verifica se o usuário está autenticado (existência de `req.session.user`). 
- **Comportamento:**
  - Se não houver sessão ativa, redireciona para a tela de login (`/`).
  - Se autenticado, segue para a próxima função (`next()`).
- **Boas práticas:** implementação centralizada de autenticação, reutilizável em múltiplas rotas.

---

## Definição das Rotas

```js
router.get('/menu', isAuthenticated, menuController.showMenu);
router.post('/mudSenha', isAuthenticated, menuController.changePassword);
```

### Detalhamento das Rotas

| Método | Rota        | Middleware       | Método no Controller    | Descrição                                  |
|--------|-------------|------------------|--------------------------|----------------------------------------------|
| GET    | `/menu`     | `isAuthenticated`| `showMenu`               | Renderiza a página de menu principal.       |
| POST   | `/mudSenha` | `isAuthenticated`| `changePassword`         | Permite que o usuário altere sua senha.     |

- **Proteção:** todas as rotas são protegidas por autenticação.
- **Segurança:** a alteração de senha exige que o usuário esteja logado.

---

## Exportação do Roteador

```js
module.exports = router;
```

### Descrição

- Torna o roteador acessível para ser usado no arquivo principal da aplicação.

---

## Considerações Finais

- **Segurança:** assegura que apenas usuários autenticados tenham acesso ao menu e funcionalidade de troca de senha.
- **Manutenibilidade:** middleware simples e reutilizável.
- **Organização:** separação clara entre lógica de autenticação, rotas e controller.

---

## Dependências

- **Express.js:** framework de servidor web.
- **menu.controller.js:** deve implementar os métodos `showMenu` e `changePassword`.
