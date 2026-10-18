# **Documentação do Arquivo register.ejs**

## **Visão Geral**

Este arquivo EJS (Embedded JavaScript) define a página de cadastro de novos usuários na aplicação. Ele integra:

- **HTML** para a estrutura base da página.  
- **EJS** para renderização dinâmica de conteúdo.  
- **Bootstrap** para um layout responsivo e estilizado.

---

**Estrutura Geral**

```ejs
<% title = 'Cadastro' %>  
<%- include('partials/header', { css: '/css/login.css', title: 'Cadastro' }) %>
```

- Atribui o título da página (**title = 'Cadastro'**).  
- Inclui o parcial de cabeçalho (**partials/header**), que gerencia o <head> da página, incluindo o CSS específico para login.css (que, presumivelmente, também cobre o estilo desta página de cadastro).  
 
- **Boas práticas:** reuso de componentes de cabeçalho para manter a consistência e modularidade do código.

---

**Inclusão do Tratamento de Erros**

```ejs
<%- include('partials/error-handler') %>
```
- Responsável por exibir mensagens de erro, como falhas no cadastro devido a dados inválidos ou emails já existentes.  
- **Boas práticas:** centralização da lógica de exibição de erros em um parcial reutilizável para garantir uma experiência de usuário consistente em diferentes formulários.

---

**Formulário de Cadastro**

```html

<form id="formCadastro" action="/movmassa/cadUser" method="POST">  
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
      placeholder="Crie uma senha"  
      required  
    >  
  </div>

  <div class="mb-3 text-center">  
    <button type="submit" class="btn btn-success w-100">Criar Conta</button>  
  </div>  
</form>

<div class="text-center">  
  <p>Já tem uma conta? <a href="/movmassa/">Entre aqui</a></p>  
</div>
```
### **Detalhamento**

* **Action e Method:** O formulário envia os dados via POST para a rota /cadUser.  
* **Campo de Email:**  
  * type="email" ativa validação básica do navegador para o formato de email.  
  * required assegura que o campo seja preenchido.  
  * value="<%= email %>" pré-preenche o campo com o email digitado anteriormente, útil em caso de falha no cadastro para evitar que o usuário digite novamente.  
* **Campo de Senha:**  
  * type="password" oculta os caracteres digitados, garantindo a privacidade.  
  * required impõe que uma senha seja informada.  
* **Botão de Envio:**  
  * class="btn btn-success w-100" aplica estilos do Bootstrap para um botão de sucesso com largura total.  
* **Link para Login:**  
  * Oferece uma opção para usuários que já possuem uma conta retornarem à página de login.

---

## Recursos Utilizados

### **Bootstrap (via CDN)**

```html

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
```
- Classes como container, d-flex, justify-content-center, align-items-center, min-vh-100, card, form-control, btn, etc., são usadas para a estilização e o layout responsivo da página.  
- **Boas práticas:** o uso de um framework CSS como Bootstrap agiliza o desenvolvimento e garante uma interface de usuário consistente.

### EJS

- <% %> para executar código JavaScript no lado do servidor.  
- <%= %> para inserir dados dinâmicos na página com escapamento HTML, prevenindo ataques XSS.  
- <%- %> para incluir conteúdo bruto (HTML) de outros arquivos EJS, como os parciais.  
- **Boas práticas:** EJS é utilizado para integrar dados do servidor e reutilizar componentes, mantendo a lógica de apresentação mínima na view.

---

## Hierarquia de Includes

1. partials/header  
   * Gerencia a seção <head> do documento, incluindo o título dinâmico da página e a folha de estilo CSS.  
2. partials/error-handler  
   * Um componente reutilizável para exibir mensagens de erro, que podem ser passadas do backend.

---

## Considerações Finais

- A estrutura do **register.ejs** é **modular**, aproveitando parciais (header e error-handler) para reduzir a duplicação de código e facilitar a manutenção.  
- O **Bootstrap** é fundamental para o design responsivo e a estilização padronizada do formulário.  
* Os atributos **required** nos campos de input oferecem uma **validação básica no frontend**, que deve ser complementada por validações robustas no lado do servidor para garantir a integridade dos dados e a segurança da aplicação.  
- A simplicidade do formulário, com foco em email e senha, sugere uma **experiência de cadastro direta** para o usuário.
