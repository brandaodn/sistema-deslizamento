# Documentação do Arquivo `auth.controller.js`

## Visão Geral

Este módulo define um **controller de autenticação** para a aplicação Node.js utilizando EJS, PostgreSQL e `bcrypt`. Ele provê rotas e funcionalidades para:

- Exibir telas de **login** e **cadastro**.
- Realizar **validação de login** com verificação de senha criptografada.
- **Registrar novos usuários**, com verificações de integridade e uso de transações para garantir consistência.
- Utiliza **sessão** (`req.session.user`) para armazenar o estado do usuário autenticado.

---

## Estrutura Geral

```javascript
const bcrypt = require('bcrypt');
const client = require('../db');
const { pagMenu } = require('../utils/menu.utils');
const transactionWrapper = require('../utils/dbTransactions');
```

- **bcrypt:** Utilizado para comparar e gerar senhas criptografadas com segurança.
- **client:** Conexão com o banco de dados PostgreSQL.
- **pagMenu:** Função utilitária responsável por redirecionar usuários após login/cadastro.
- **transactionWrapper:** Utilitário para controle de transações no banco (garante atomicidade nas operações de escrita).

---

## Função `showLogin`

```javascript
showLogin: async (req, res) => {
    res.render('login', { erro: null, email: '' });
},
```

- **Responsabilidade:** Renderiza a view de login.
- **Parâmetros renderizados:**
  - `erro`: nulo inicialmente.
  - `email`: string vazia (campo preservado para reutilização no template EJS).

---

## Função `showRegister`

```javascript
showRegister: async (req, res) => {
    res.render('register', { erro: null, email: '' });
},
```

- Similar à `showLogin`, mas renderiza a tela de **cadastro**.

---

## Função `login`

```javascript
login: async (req, res) => {
    const { email, senha } = req.body;
    ...
},
```

### Descrição

- **Objetivo:** Autenticar usuários a partir do email e senha fornecidos.
- **Etapas:**
  1. Recupera o usuário do banco com base no `email`.
  2. Verifica se o usuário existe.
     - Se não, retorna mensagem de "Usuário não encontrado".
  3. Compara a senha fornecida com o hash salvo no banco usando `bcrypt.compare`.
     - Se inválida, retorna mensagem de "Senha inválida".
  4. Se válida, cria sessão com `req.session.user` contendo `email` e `tipo`.
  5. Redireciona o usuário usando `pagMenu`.

---

## Função `register`

```javascript
register: async (req, res) => {
    const { email, senha } = req.body;
    ...
},
```

### Descrição

- **Objetivo:** Registrar um novo usuário com e-mail e senha.
- **Etapas dentro da transação:**
  1. Verifica se a senha tem pelo menos 8 caracteres.
  2. Verifica se o e-mail já está cadastrado.
  3. Cria uma nova sessão para o usuário.
  4. Insere o novo usuário no banco com senha **criptografada** (`bcrypt.hash`).

---

## Sessão (`req.session.user`)

- Armazena:
  - `email`: do usuário logado.
  - `tipo`: define o nível ou categoria do usuário.

---

## Função Utilitária: `pagMenu`

```javascript
return pagMenu(res, req, mensagemOpcional);
```

- Trata o redirecionamento para a página inicial ou painel do usuário após login ou cadastro.
- Aceita uma **mensagem de feedback opcional**.

---

## Considerações Finais

- O módulo segue uma **estrutura clara e modular**.
- Rsponsabilidade de cada função definida.
- Uso de **funções utilitárias** e **transações** reforça a robustez do código.
- Aplicação de **boas práticas de segurança** (como hashing de senhas).
- Mensagens de erro são pensadas para o usuário final.
