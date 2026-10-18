# **Documentação do Arquivo menu.ejs**

## **Visão Geral**

Este arquivo EJS (Embedded JavaScript) define a página de menu principal da aplicação, que oferece diferentes funcionalidades com base no tipo de usuário logado. Ele combina:

- **HTML** para a estrutura da página.  
- **EJS** para renderização dinâmica de conteúdo e lógica condicional.  
- **Bootstrap** para layout responsivo e componentes interativos (Accordion).  
- **JavaScript** para interações simples com o usuário, como a alternância de visibilidade da senha.

---

# Estrutura Geral

```ejs
<%- include('partials/header', { css: '/css/menu.css', title: 'Inserção de Dados' }) %>
```
- Inclui o parcial de cabeçalho (partials/header), que contém o <head> da página e carrega o arquivo CSS específico para este menu (/css/menu.css). O título da página é definido como "Inserção de Dados".  
- **Boas práticas:** organização modular utilizando includes para centralizar elementos comuns e melhorar a manutenção.

---

**Exibição de Mensagens**

```ejs
<%- mensagem %>
```
- Este trecho é responsável por exibir mensagens dinâmicas ao usuário, que podem ser enviadas pelo backend (por exemplo, mensagens de sucesso ou erro após uma operação).

---

**Funcionalidades (Accordion)**

O layout das funcionalidades é organizado usando o componente **Accordion** do Bootstrap, que permite agrupar e recolher seções de conteúdo.

---

**Botão de Inserção de Dados (Apenas para Usuários Não Comuns)**

```ejs
<% if(tipo !== 'comum'){ %>  
    <div class="accordion-item">  
        <h2 class="accordion-header" id="insertDataHeading">  
            <form action="/movmassa/insercao" method="get">  
                <button class="accordion-button collapsed" type="submit" data-bs-toggle="collapse" data-bs-target="#insertDataCollapse" aria-expanded="false">  
                    Inserção de Dados  
                </button>  
            </form>  
        </h2>  
    </div>  
<% } %>
```

- **Lógica Condicional:** Este bloco EJS (<% if(tipo !== 'comum'){ %>) garante que o botão "Inserção de Dados" seja exibido **apenas** para usuários cujo tipo não seja 'comum'. Isso implementa um controle de acesso baseado no perfil do usuário.  
- **Navegação:** O botão é encapsulado em um formulário com action="/movmassa/insercao" e method="get", que redireciona o usuário para a página de inserção de dados ao ser clicado.  
- **Accordion:** O botão é formatado como um accordion-button, embora não tenha um accordion-collapse associado diretamente para conteúdo a ser expandido nesta mesma página. Ele serve principalmente como um link estilizado.

---

**Formulário de Troca de Senha**

```html

<div class ="accordion-item">  
    <h2 class="accordion-header" id="changePasswordHeading">  
        <button class = "accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#changePasswordCollapse" aria-expanded="false">  
            Alterar Senha  
        </button>  
    </h2>  
    <div id="changePasswordCollapse" class="accordion-collapse collapse" aria-labelledby="changePasswordHeading">  
        <div class="accordion-body">  
            <form id="formUser" action="/movmassa/mudSenha" method="post">  
                <div class="mb-3">  
                    <label for="email" class="form-label">E-mail</label>  
                    <input type="email" class="form-control" id="email" name="email" placeholder="Insira o E-mail do usuário" value="<%= email %>" disabled>  
                </div>  
                <div class="mb-3">  
                    <label for="senhaV" class="form-label">Senha Antiga</label>  
                    <input type="password" class="form-control" id="senhaV" name="senhaV" placeholder="Insira a senha antiga" required>  
                    <label class="checkbox-label">  
                        <input type="checkbox" id="showSenhaV"> Mostrar senha  
                    </label>  
                </div>  
                <div class="mb-3">  
                    <label for="senhaN" class="form-label">Senha Nova</label>  
                    <input type="password" class="form-control" id="senhaN" name="senhaN" placeholder="Insira a nova senha" required>  
                    <label class="checkbox-label">  
                        <input type="checkbox" id="showSenhaN"> Mostrar senha  
                    </label>  
                </div>  
                <button type="submit" class="btn-custom">Mudar senha</button>  
            </form>  
        </div>  
    </div>  
</div>
```
### **Detalhamento**

- **Acionador do Accordion:** O botão "Alterar Senha" atua como o cabeçalho do accordion-item e, quando clicado, expande ou recolhe o formulário de alteração de senha.  
- **Formulário de Envio:** O formulário envia dados via POST para a rota /mudSenha.  
- **Campo de E-mail:**  
  * type="email" garante validação básica.  
  * value="<%= email %>" exibe o e-mail do usuário logado (passado pelo backend).  
  * disabled impede que o usuário altere este campo diretamente.  
- **Campo de Senha Antiga (senhaV):**  
  * type="password" oculta o texto digitado.  
  * required impõe que o campo seja preenchido.  
  * Inclui um **checkbox "Mostrar senha"** para alternar a visibilidade do texto.  
- **Campo de Senha Nova (senhaN):**  
  * type="password" oculta o texto digitado.  
  * required impõe que o campo seja preenchido.  
  * Inclui um **checkbox "Mostrar senha"** para alternar a visibilidade do texto.  
* **Botão de Envio:** type="submit" para enviar o formulário, com a classe btn-custom para estilo personalizado.

---

**JavaScript: Alternância de Visibilidade da Senha**

```html

<script>  
    const showSenhaVCheckbox = document.getElementById('showSenhaV');  
    const senhaInputV = document.getElementById('senhaV');

    const showSenhaNCheckbox = document.getElementById('showSenhaN');  
    const senhaInputN = document.getElementById('senhaN');

    showSenhaVCheckbox.addEventListener('change', function() {  
        if (showSenhaVCheckbox.checked) {  
            senhaInputV.type = 'text';  
        } else {  
            senhaInputV.type = 'password';  
        }  
    });

    showSenhaNCheckbox.addEventListener('change', function() {  
        if (showSenhaNCheckbox.checked) {  
            senhaInputN.type = 'text';  
        } else {  
            senhaInputN.type = 'password';  
        }  
    });  
</script>
```
- **Descrição:** Este script manipula a visibilidade dos campos de senha ("Senha Antiga" e "Senha Nova"). Ele obtém as referências dos checkboxes e dos campos de input correspondentes.  
- **Funcionalidade:** Para cada checkbox, um eventListener é adicionado para monitorar a alteração do estado (marcado/desmarcado). Se o checkbox estiver marcado, o type do input da senha é alterado para 'text', revelando o conteúdo. Caso contrário, o type é revertido para 'password', ocultando-o.  
- **Boas práticas:**  
  * Uso de addEventListener para uma manipulação de eventos limpa e separada do HTML.  
  * Código enxuto e específico para a funcionalidade de alternância de senha.

---

**Recursos Utilizados**

### **Bootstrap (via CDN)**

```html

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```
* **Classes:** Utiliza classes do Bootstrap como container, accordion, accordion-item, accordion-header, accordion-button, accordion-collapse, accordion-body, mb-3, form-label, form-control, entre outras, para construir o layout responsivo e os componentes interativos.  
* **Componentes:** O Accordion é um componente chave para organizar as funcionalidades de forma expansível e colapsável, melhorando a usabilidade ao permitir que o usuário foque na funcionalidade desejada.  
- **Boas práticas:** Adoção de framework CSS para padronização visual e agilidade no desenvolvimento, além de fornecer componentes interativos prontos para uso.

### **EJS**

- <% %> para executar código JavaScript sem renderizar o resultado (usado para a lógica condicional if(tipo !== 'comum')).  
- <%= %> para renderizar conteúdo com escapamento de caracteres (usado para exibir o email e a mensagem).  
- <%- %> para renderizar conteúdo bruto (usado para incluir o partials/header e a mensagem para que o HTML gerado seja interpretado corretamente).  
- **Boas práticas:** Utilização do EJS para injetar dados dinamicamente e controlar a renderização de seções com base em variáveis do backend, mantendo a lógica de apresentação mínima na view.

---

**Hierarquia de Includes**

1. partials/header  
   - Inclui elementos do <head>, título dinâmico e links para CSS específicos (neste caso, /css/menu.css).

---

**Considerações Finais**

- A modularização com **partials** (como o header) promove a reutilização de código e a organização do projeto.  
- O uso de **Bootstrap** facilita a criação de uma interface responsiva e moderna com componentes interativos como o Accordion.  
- A **lógica condicional EJS** (<% if(tipo !== 'comum'){ %>) é fundamental para implementar o controle de acesso e exibir funcionalidades específicas para diferentes perfis de usuário.  
- O **JavaScript puro** para a alternância de visibilidade da senha é uma implementação leve e eficiente que melhora a experiência do usuário.  
- Os atributos required nos campos de senha garantem uma validação básica no frontend antes do envio do formulário, complementando as validações do servidor.