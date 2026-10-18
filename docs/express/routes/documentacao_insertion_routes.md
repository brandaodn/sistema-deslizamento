
# Documentação do Arquivo `insertion.routes.js`

---

## Visão Geral

Este arquivo define as **rotas de inserção de dados** da aplicação, relacionadas a países, estados, municípios, usuários, eventos e mídias. Utiliza o framework **Express.js** e um **middleware de verificação de permissão** para restringir o acesso a usuários com perfil de **Curador** ou **administrador**.

A estrutura segue o padrão **MVC (Model-View-Controller)**:

- O **Router** define os caminhos acessíveis via HTTP.
- O **Controller (`insertion.controller`)** contém a lógica de manipulação dos dados.
- O **Middleware** garante que apenas usuários autorizados possam acessar as rotas de inserção.

---

## Estrutura do Código

```js
const express = require('express');
const router = express.Router();
const insertionController = require('../controllers/insertion.controller');
```

### Descrição

- **Importações:**
  - `express`: framework web.
  - `router`: instância do roteador para definição modular de rotas.
  - `insertionController`: responsável pela lógica das inserções de dados.

---

## Middleware de Autenticação e Permissão

```js
const isModeratorOrAdmin = (req, res, next) => {
    if (req.session.user && (req.session.user.tipo === 'Curador' || req.session.user.tipo === 'administrador')) {
        return next();
    }
    else if(req.session.user){
        return res.redirect('/movmassa/menu');
    }
    return res.redirect('/movmassa/');
};
```

### Descrição

- **Função:** Garante que apenas usuários autenticados e com permissões de Curador ou administrador acessem as rotas de inserção.
- **Regras de redirecionamento:**
  - Usuário comum autenticado: redirecionado para `/menu`.
  - Usuário não autenticado: redirecionado para `/`.
- **Boas práticas:** centralização da lógica de permissão para reutilização em várias rotas.

---

## Definição das Rotas

```js
router.get('/insercao', isModeratorOrAdmin, insertionController.showInsertionPage);
router.post('/addPais', isModeratorOrAdmin, insertionController.addCountry);
router.post('/addUF', isModeratorOrAdmin, insertionController.addState);
router.post('/addMun', isModeratorOrAdmin, insertionController.addCity);
router.post('/addUser', isModeratorOrAdmin, insertionController.addUser);
router.post('/addEvento', isModeratorOrAdmin, insertionController.addEvent);
router.post('/addMidia', isModeratorOrAdmin, insertionController.addMedia);
```

### Detalhamento das Rotas

| Método | Rota         | Middleware            | Método no Controller     | Descrição                                                    |
|--------|--------------|------------------------|---------------------------|--------------------------------------------------------------|
| GET    | `/insercao`  | `isModeratorOrAdmin`   | `showInsertionPage`       | Renderiza a interface de inserção de dados.                  |
| POST   | `/addPais`   | `isModeratorOrAdmin`   | `addCountry`              | Insere um novo país no banco de dados.                       |
| POST   | `/addUF`     | `isModeratorOrAdmin`   | `addState`                | Insere uma nova unidade federativa (estado).                 |
| POST   | `/addMun`    | `isModeratorOrAdmin`   | `addCity`                 | Insere um novo município.                                    |
| POST   | `/addUser`   | `isModeratorOrAdmin`   | `addUser`                 | Registra um novo usuário no sistema.                         |
| POST   | `/addEvento` | `isModeratorOrAdmin`   | `addEvent`                | Insere um novo evento relacionado a deslizamentos.           |
| POST   | `/addMidia`  | `isModeratorOrAdmin`   | `addMedia`                | Adiciona arquivos de mídia (imagens, vídeos, documentos).    |

- **Boas práticas:** as rotas POST são utilizadas corretamente para criação de recursos.
- **Controle de acesso:** todas as rotas são protegidas pelo middleware.

---

## Exportação do Roteador

```js
module.exports = router;
```

### Descrição

- Exporta o roteador com as rotas configuradas para ser utilizado no arquivo principal da aplicação (`app.js` ou `server.js`).

---

## Considerações Finais

- **Segurança:** uso de middleware para controle de acesso é essencial para proteger áreas sensíveis.
- **Organização:** separação clara entre middleware, roteamento e controller.
- **Manutenibilidade:** adicionar novas rotas com proteção é simples e consistente.
- **Escalabilidade:** estrutura preparada para crescer com novos tipos de inserção de dados.

---

## Dependências

- **Express.js:** framework utilizado para roteamento.
- **insertion.controller.js:** deve conter os métodos `showInsertionPage`, `addCountry`, `addState`, `addCity`, `addUser`, `addEvent`, `addMedia`.
