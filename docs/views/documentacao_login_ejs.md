
# Documentação do Arquivo `login.ejs`

## Visão Geral

Este arquivo EJS (`Embedded JavaScript`) define a página de login da aplicação. Ele combina:

- **HTML** para a estrutura da página.
- **EJS** para renderização dinâmica de conteúdo.
- **Bootstrap** para layout responsivo e classes de estilo.
- **JavaScript** para interações simples com o usuário.

---

## Estrutura Geral

```ejs
<% title = 'Login' %>
<%- include('partials/header', { css: '/css/login.css', title: 'Login' }) %>
```

- Atribui o título da página (`title = 'Login'`).
- Inclui o parcial de cabeçalho (`partials/header`), que contém o `<head>` e possivelmente a inclusão de arquivos CSS/JS comuns.
  - **Boas práticas:** organização modular utilizando includes para evitar duplicação de código.

---

## Inclusão do Tratamento de Erros

```ejs
<%- include('partials/error-handler') %>
```

- Responsável por exibir mensagens de erro (por exemplo, credenciais inválidas).
- **Boas práticas:** reutilização de um componente (parcial) para exibir erros de forma consistente em várias views.

---

## Formulário de Login

```html
<form id="formLogin" action="/movmassa/login" method="POST">
  <div class="mb-3">
    <label for="email" class="form-label">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      class="form-control"
      placeholder="Digite seu email"
      value="<%= email %>"
      required
    >
  </div>

  <div class="mb-3">
    <label for="senha" class="form-label">Senha</label>
    <input
      type="password"
      id="senha"
      name="senha"
      class="form-control"
      placeholder="Digite sua senha"
      required
    >
    <div class="mb-3">
      <label>
        <input type="checkbox" id="showSenha"> Mostrar senha
      </label>
    </div>
  </div>

  <div class="mb-3 text-center">
    <button type="submit" class="btn btn-primary w-100">Entrar</button>
  </div>
</form>

<div class="text-center">
  <p>Não tem uma conta? <a href="/movmassa/register">Crie uma aqui</a></p>
</div>
```

### Detalhamento

- **Action e Method:** O formulário envia dados via `POST` para a rota `/login`.

- **Campo de Email:**
  - `type="email"` garante validação básica pelo navegador.
  - `required` impõe que o campo seja preenchido antes de submeter.
  - `value="<%= email %>"` preserva o valor digitado anteriormente em caso de erro, melhorando a experiência do usuário.

- **Campo de Senha:**
  - `type="password"` oculta o texto digitado.
  - `required` garante que a senha seja informada antes do envio.

- **Checkbox “Mostrar senha”:**
  - Permite ao usuário alternar entre exibir e ocultar o valor digitado no campo de senha.
  - **Boas práticas:** inclusão de controle para melhorar a usabilidade sem expor dados sensíveis por padrão.

- **Botão de Envio:**
  - `class="btn btn-primary w-100"` utiliza classes do Bootstrap para estilo e largura total.

- **Link para Registro:**
  - Fornece navegação para a página de criação de conta caso o usuário não tenha cadastro.

---

## JavaScript: Alternância de Visibilidade da Senha

```html
<script>
  const showSenhaCheckbox = document.getElementById('showSenha');
  const senhaInput = document.getElementById('senha');

  showSenhaCheckbox.addEventListener('change', function() {
    if (showSenhaCheckbox.checked) {
      senhaInput.type = 'text';
    } else {
      senhaInput.type = 'password';
    }
  });
</script>
```

- **Descrição:** Recupera referências ao checkbox e ao input de senha e adiciona um listener para alterar o tipo do campo entre `text` e `password`.
- **Boas práticas:**
  - Uso de `addEventListener` em vez de atributos inline.
  - Código enxuto e legível, separado do HTML estático.
  - Interação mínima, sem bibliotecas adicionais, mantendo a página leve.

---

## Recursos Utilizados

### Bootstrap (via CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
  integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
  crossorigin="anonymous">
</script>
```

- Classes como `container`, `d-flex`, `justify-content-center`, `align-items-center`, `min-vh-100`, `card`, `form-control`, `btn`, etc., definem a aparência responsiva e uniforme.
- **Boas práticas:** adoção de framework CSS para padronização visual e agilidade no desenvolvimento.

### EJS

- `<% %>` para executar código JavaScript sem renderizar.
- `<%= %>` para renderizar conteúdo com escapamento de caracteres.
- `<%- %>` para renderizar conteúdo bruto (útil para incluir outros arquivos ou blocos de HTML gerados).
- **Boas práticas:** separar lógica de apresentação ao mínimo, usando EJS apenas para injetar dados e includes de componentes.

---

## Hierarquia de Includes

1. `partials/header`  
   - Inclui elementos do `<head>`, título dinâmico, links para CSS gerais ou específicos (neste caso, `/css/login.css`).

2. `partials/error-handler`  
   - Renderiza mensagens de erro utilizando lógica de condição no backend, de forma centralizada.

---

## Considerações Finais

- A modularização por meio de **partials** (header e error-handler) evita repetição e facilita manutenção.
- O uso de **Bootstrap** garante responsividade sem necessidade de escrever estilos CSS próprios para cada componente.
- A interação por **JavaScript puro** para alternância de senha mantém a dependência de bibliotecas externas reduzida e o desempenho otimizado.
- Os atributos `required` e os tipos de input (`email` e `password`) asseguram validações básicas no frontend, complementando possíveis validações no servidor.
