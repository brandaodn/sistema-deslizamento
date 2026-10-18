# Documentação do Arquivo `insercao.ejs`

## Visão Geral

Este arquivo EJS (`Embedded JavaScript`) define a página de inserção de dados da aplicação, focada na entrada de informações relacionadas a deslizamentos de terra. Ele utiliza:

- **HTML** para a estrutura da página.  
- **EJS** para renderização dinâmica de conteúdo e inclusão de parciais.  
- **Bootstrap** para layout responsivo, componentes de acordeão e estilos de formulário.

---

## Estrutura Geral

```ejs  
<%- include('partials/header', { css: '/css/insercao.css', title: 'Inserção de Dados' }) %>  
```

- Inclui o parcial de cabeçalho (partials/header), que contém o <head> da página.  
- Define o CSS específico para esta página (/css/insercao.css).  
- Atribui o título da página (title: 'Inserção de Dados').  
- **Boas práticas:** Reutilização de um cabeçalho comum para consistência e manutenção simplificada.

---

## Mensagens Dinâmicas

```ejs  
<%- mensagem %>  
```

- Este bloco EJS é responsável por exibir mensagens dinâmicas ao usuário, que podem ser provenientes do backend (por exemplo, mensagens de sucesso ou erro após uma inserção de dados).  
- **Boas práticas:** Centralização da exibição de feedback ao usuário para uma experiência consistente.

---

## Acordeão de Inserção de Dados (dataInsertionAccordion)

```html

<div class="accordion" id="dataInsertionAccordion">  
    </div>
```

- A estrutura principal da página é um componente de acordeão do Bootstrap, que organiza os diferentes formulários de inserção de dados em seções colapsáveis.  
- Isso melhora a usabilidade, permitindo que o usuário se concentre em um tipo de inserção de dados por vez e mantendo a página organizada.

---

- Inclusão Condicional de Formulários (Administrador)

```ejs

<% if(tipo === 'administrador'){ %>  
    <%- include('partials/form-accordion', { ... }) %>

    <%- include('partials/form-accordion', { ... }) %>

    <%- include('partials/form-accordion', { ... }) %>  
      
    <%- include('partials/form-accordion', { ... }) %>  
<% } %>  
```

* Este bloco EJS utiliza uma condição (if(tipo === 'administrador')) para incluir dinamicamente formulários específicos apenas se o usuário logado tiver o tipo de "administrador".  
* Isso implementa o controle de acesso baseado em papel, garantindo que apenas usuários autorizados possam realizar certas inserções de dados (Países, UFs, Municípios e Usuários).  
* **Boas práticas:** Lógica de exibição condicional para gerenciar permissões de usuário e simplificar a interface para diferentes perfis.

---

**Componente partials/form-accordion**

Este parcial é a peça central para a organização dos formulários, encapsulando a lógica de um item do acordeão.

### **Uso (Exemplo: Adicionar País)**

```ejs

<%- include('partials/form-accordion', {  
    headingId: 'paisHeading',  
    collapseId: 'paisCollapse',  
    titulo: 'Adicionar País',  
    formId: 'formPais',  
    action: '/addPais',  
    formPartial: '../forms/form-pais',   
    show: false,  
    expanded: false,  
    botaoTexto: 'Adicionar País'  
}) %>  
```

### **Detalhamento dos Parâmetros**

* **headingId**: ID único para o cabeçalho do item do acordeão.  
* **collapseId**: ID único para o corpo colapsável do item do acordeão.  
* **titulo**: Texto exibido no cabeçalho do acordeão (e.g., "Adicionar País").  
* **formId**: ID único para o formulário dentro do item do acordeão.  
* **action**: A URL para onde o formulário enviará os dados (e.g., /addPais).  
* **formPartial**: O caminho para o arquivo EJS que contém o corpo do formulário específico (e.g., ../forms/form-pais). Isso permite a modularidade dos formulários.  
* **show**: Booleano que determina se o item do acordeão deve estar aberto por padrão (true para "mostrar", false para "colapsado").  
* **expanded**: Booleano para o atributo aria-expanded, indicando o estado inicial de expansão para acessibilidade.  
* **botaoTexto**: Texto para o botão de submissão do formulário (padrão é 'Enviar' se não fornecido).

### **Tipos de Formulários Incluídos**

#### **Formulários para Administradores (if(tipo === 'administrador')):**

- **Adicionar País**: formPartial: '../forms/form-pais'  
- **Action**: /addPais  
- **Adicionar UF (Estado)**: formPartial: '../forms/form-uf'  
- **Action**: /addUF  
- **Adicionar Município**: formPartial: '../forms/form-municipio'  
- **Action**: /addMun  
- **Adicionar Usuário**: formPartial: '../forms/form-user'  
- **Action**: /addUser

#### **Formulários para Todos os Usuários:**

- **Adicionar Evento**: formPartial: '../forms/form-evento'  
- **Action**: /addEvento  
- **Adicionar Mídia**: formPartial: '../forms/form-midia'  
- **Action**: /addMidia

---

**Exemplo de Formulário Detalhado: form-uf.ejs**

```html

<div class="mb-3">  
    <label for="nomeUF" class="form-label">Nome</label>  
    <input type="text" class="form-control" id="nomeUF" name="nomeUF" placeholder="Insira o nome do UF" required>  
</div>  
<div class="mb-3">  
    <label for="idPaisUF" class="form-label">País</label>  
    <select class="form-control" id="idPaisUF" name="idPaisUF" required>  
        <option value="" disabled selected>Selecione o país</option>  
        <% pais.forEach(function(paisItem) { %>  
            <option value="<%= paisItem.id_pais %>"><%= paisItem.nome_pais %></option>  
        <% }); %>  
    </select>  
</div>  
```

### **Detalhamento**

- **Preenchimento Dinâmico**: Loops como <% pais.forEach(function(paisItem) { %> iteram sobre uma variável (pais, nesse caso) para popular dinamicamente as opções do select. Cada opção terá um id como valor e o nome relativo a esse id como texto visível.  
- required para garantir que um elemento do select seja selecionado.  
* **Boas práticas:** Utilização de elementos de formulário semânticos e atributos HTML para validação básica no frontend.

---

**Recursos Utilizados**

### **Bootstrap (via CDN)**

```html

<script src="[https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js](https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js)" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>  
```

* As classes do Bootstrap (e.g., container, mt-5, text-center, mb-4, accordion, accordion-item, form-control, btn, etc.) são amplamente utilizadas para a estrutura, layout responsivo e estilização dos componentes, como o acordeão e os formulários.  
* **Boas práticas:** Uso de um framework CSS robusto para agilizar o desenvolvimento e garantir uma interface consistente e responsiva.

### **EJS**

* <%- include(...) %>: Utilizado extensivamente para incluir parciais (cabeçalho e formulários dentro do acordeão), promovendo a modularidade.  
* <%= ... %>: Para renderizar conteúdo dinâmico com escapamento de caracteres (e.g., titulo, mensagem, paisItem.nome_pais).  
* <% ... %>: Para lógica de programação (e.g., a condição if(tipo === 'administrador') e o loop pais.forEach).  
* **Boas práticas:** Separação clara entre a lógica de apresentação e a injeção de dados.

---

**Hierarquia de Includes**

1. partials/header  
   * Inclui elementos do <head>, título dinâmico, links para CSS (neste caso, /css/insercao.css).  
2. partials/form-accordion  
   * Este é um parcial genérico que cria a estrutura de um item de acordeão.  
   * Internamente, ele inclui o parcial de formulário específico (e.g., ../forms/form-uf) baseado no parâmetro formPartial.

---

**Considerações Finais**

* A página insercao.ejs é um exemplo sólido de como usar **EJS e Bootstrap** para criar uma interface de usuário modular, responsiva e dinâmica.  
* A utilização de **partials** é fundamental para evitar a duplicação de código e melhorar a manutenibilidade, especialmente com a criação de um parcial genérico como form-accordion.  
* O **controle de acesso condicional** baseado no tipo de usuário (administrador) é uma boa prática para gerenciar permissões diretamente na camada de visualização.  
* A **população dinâmica de dropdowns** (como a seleção de países no form-uf) é crucial para formulários com dados relacionados, garantindo que as opções estejam sempre atualizadas.