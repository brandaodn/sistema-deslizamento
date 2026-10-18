# Documentação do Arquivo `menu.controller.js`

## Visão Geral

Este módulo é responsável por:

- Exibir o menu principal do sistema.
- Permitir a alteração de senha por parte de usuários autenticados.
- Utiliza **bcrypt** para hashing de senhas, **PostgreSQL** via `client`, e transações com `transactionWrapper`.
- Interface com a view via `pagMenu`, que renderiza a interface do usuário.

---

## Importações

```javascript
const bcrypt = require('bcrypt');
const client = require('../db');
const transactionWrapper = require('../utils/dbTransactions');
const { pagMenu } = require('../utils/menu.utils');
```

- **bcrypt:** Biblioteca para hashing e verificação de senhas.
- **client:** Conexão com o banco de dados PostgreSQL.
- **transactionWrapper:** Garante atomicidade nas operações SQL.
- **pagMenu:** Utilitário para renderizar ou redirecionar a interface do menu.

---

## Função `showMenu`

```javascript
showMenu: async (req, res, mensagem = null) => {
    return pagMenu(res, req, mensagem);
},
```

### Descrição

- **Objetivo:** Encapsula o redirecionamento para o menu principal.
- **Parâmetros:**
  - `req`: Objeto de requisição.
  - `res`: Objeto de resposta.
  - `mensagem` (opcional): Mensagem HTML a ser exibida ao usuário.
- **Boas práticas:** Reutilização de uma função centralizada para renderizar menus.

---

## Função `changePassword`

```javascript
changePassword: async (req, res) => {
    const { senhaN, senhaV } = req.body;
    ...
}
```

### Descrição

- **Objetivo:** Permitir ao usuário logado alterar sua senha de forma segura.
- **Fluxo de execução:**

1. **Validação de comprimento da nova senha:**
   ```javascript
   if (senhaN.length < 8)
   ```
   - Retorna erro se a nova senha tiver menos de 8 caracteres.

2. **Busca do usuário logado:**
   ```javascript
   const result = await client.query('SELECT * FROM users WHERE email = $1', [req.session.user.email]);
   ```
   - Verifica a existência do usuário a partir da sessão.

3. **Validação da senha atual:**
   ```javascript
   const isPasswordValid = await bcrypt.compare(senhaV, user.senha);
   ```
   - Confirma se a senha atual fornecida confere com a registrada no banco.

4. **Hash da nova senha:**
   ```javascript
   const hashedPasswordN = await bcrypt.hash(senhaN, 10);
   ```

5. **Atualização no banco de dados:**
   ```javascript
   await client.query('UPDATE users SET senha = $1 WHERE email = $2', [hashedPasswordN, req.session.user.email]);
   ```

- **Mensagens de feedback:** Exibidas ao usuário com `alert-success` ou `alert-danger` para indicar o resultado da operação.

---

## Considerações Finais

- O módulo está bem organizado e foca na **segurança do processo de troca de senha**.
- O uso de `bcrypt` evita o armazenamento de senhas em texto puro.
- As mensagens de erro e sucesso são cuidadosamente formatadas com HTML para exibição amigável.
- A função `transactionWrapper` assegura que a alteração de senha ocorra com segurança, sem efeitos colaterais em caso de falhas.

