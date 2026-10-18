# Documentação do Arquivo de Inserção de Dados de Deslizamento

## Visão Geral

Este módulo JavaScript é responsável pela inserção de dados relacionados a eventos de deslizamento de terra no banco de dados PostgreSQL. Ele implementa a lógica backend para a criação de entidades como **país**, **estado (UF)**, **município**, **usuário**, **evento** e **mídia**.

São utilizadas:

- Conexão com banco via `pg` (PostgreSQL);
- Funções utilitárias para validação e processamento;
- Transações para garantir consistência dos dados;
- `bcrypt` para criptografia de senhas.

---

## Funções Implementadas

### showInsertionPage

```js
showInsertionPage: async (req, res, mensagem)
```

- Renderiza a página de inserção sem dados, opcionalmente exibindo uma mensagem.
- Usa: `pageInsertion()`.

---

### addCountry

```js
addCountry: async (req, res)
```

- **Entrada:** nome do país (nomePais).
- **Valida duplicidade:** Consulta se o país já existe na tabela `pais`.
- **Inserção:** Se não existir, insere novo registro.
- **Transação:** Garantida via `transactionWrapper()`.

---

### addState

```js
addState: async (req, res)
```

- **Entrada:** nome do estado (nomeUF), id do país (idPaisUF).
- **Valida duplicidade:** na tabela `uf` com base no nome e id do país.
- **Inserção:** nova UF com id do país referenciado.

---

### addCity

```js
addCity: async (req, res)
```

- **Entrada:** nome do município e id da UF correspondente.
- **Valida duplicidade:** no nome e id do estado (UF).
- **Inserção:** na tabela `municipio`.

---

### addUser

```js
addUser: async (req, res)
```

- **Entrada:** tipo de usuário, email e senha.
- **Regras:**
  - Senha deve ter ao menos 8 caracteres.
  - Email não pode estar já registrado.
- **Criptografia:** senha é criptografada com `bcrypt`.

---

### addEvent

```js
addEvent: async (req, res)
```

- **Entrada:** diversos campos técnicos e sociais/ambientais referentes a um evento de deslizamento.
- **Validação:** feita por `validarCampos()`.
- **Checkboxes múltiplos:** normalizados com `processCheckboxes()`.
- **Forma do terreno:** composta com base nas curvaturas horizontal e vertical.

#### Etapas da inserção:

1. `tipo` → tabela `tipo` (descrição, categoria, material, velocidade);
2. `evento` → tabela `evento` (data, coordenadas, id do tipo);
3. `impacto` → tabela `impactos` (referente ao evento);
4. `impactos_sociais` → impactos em famílias, desalojados, etc.;
5. `impactos_economicos` → danos econômicos e agrícolas;
6. `impactos_ambientais` → recursos afetados, danos na biodiversidade, etc.

- **Transação completa:** Todos os inserts são agrupados para manter integridade relacional.

---

## Boas Práticas Adotadas

- **Transações:** Todas operações de escrita críticas utilizam `transactionWrapper`.
- **Validação de dados:** Utiliza funções auxiliares para evitar repetição de lógica e garantir sanidade dos dados.
- **Mensagens ao usuário:** Retorno com HTML contendo alerts Bootstrap para informar sucesso ou erro.
- **Criptografia:** Senhas protegidas com hash seguro via `bcrypt`.

---

## Dependências

- **client**: conexão com PostgreSQL.
- **utils/utils.js**: validação de campos e checkboxes.
- **utils/dbTransactions.js**: abstração de transações.
- **utils/menu.utils.js**: renderização da página com mensagens dinâmicas.
- **bcrypt**: hashing de senha para cadastro seguro de usuários.

---

## Considerações Finais

- Este módulo é essencial para a persistência de dados estruturados relacionados a eventos de desastres naturais.
- A lógica está bem segmentada, com separação clara entre os diferentes tipos de entidade.
- É recomendado expandir a documentação caso sejam adicionados módulos complementares como visualização e edição de dados.
- Sugere-se adicionar testes automatizados e tratamento de erros mais granulado futuramente.
