
# Documentação do Arquivo server.js

## Visão Geral

O arquivo `server.js` é responsável por iniciar o servidor da aplicação. Ele importa a aplicação Express configurada em `app.js` e a coloca para escutar em uma porta específica (porta 3000). É o ponto de execução principal da aplicação web, permitindo que ela esteja disponível para receber requisições HTTP.

---

## Importação da Aplicação

```js
const { app } = require('./app');
```

- Importa a instância do servidor Express configurada no arquivo `app.js`.
- A instância `app` já vem com middlewares, rotas, sessão e configurações de view engine prontos para uso.

- **Boas práticas:** manter a configuração do servidor (`app.js`) separada da inicialização do servidor (`server.js`) melhora a organização e facilita testes.

---

## Definição da Porta

```js
const port = 3000;
```

- Define que o servidor será iniciado na porta 3000.
- Essa porta será usada para escutar requisições HTTP no ambiente local: `http://localhost:3000`.

---

## Inicialização do Servidor

```js
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
```

- `app.listen(...)` inicia efetivamente o servidor Express na porta definida.
- O callback dentro da função é executado assim que o servidor começa a escutar, exibindo no console uma mensagem de confirmação.

### Detalhes

- `console.log(...)` auxilia o desenvolvedor a confirmar que o servidor está no ar e acessível.
- Não há tratamento de erro explícito no `listen`, tornando-se melhoria futura para ambientes de produção.

---

## Considerações Finais

- O `server.js` mantém sua função única e clara: iniciar o servidor Express com base nas configurações de `app.js`.
- A separação entre `app.js` (configuração do app) e `server.js` (execução do servidor) segue as boas práticas de desenvolvimento web com Node.js e Express.
- O ponto de partida da aplicação ao rodar o comando `node server.js`
