/**
 * Vincula dois <select>, de forma que ao escolher uma opção do select origem,
 * o select destino seja atualizado automaticamente de acordo com o atributo data-*
 * 
 * @param {string} origemId - ID do select de origem (ex: "idUF")
 * @param {string} destinoId - ID do select de destino (ex: "idPaisUF")
 * @param {string} attrName - Nome do atributo que contém o valor do destino (ex: "data-idpais")
 */
function linkSelectToSelectInput(origemId, destinoId, attrName) {
  document.addEventListener("DOMContentLoaded", function () {
    const origemSelect = document.getElementById(origemId);
    const destinoSelect = document.getElementById(destinoId);

    if (origemSelect && destinoSelect) {
      origemSelect.addEventListener("change", function () {
        const selectedOption = origemSelect.options[origemSelect.selectedIndex];
        const destinoValue = selectedOption.getAttribute(attrName);

        if (destinoValue) {
            destinoSelect.value = destinoValue;
        } else {
            destinoSelect.value = "";
        }
      });
    }
  });
}

/**
 * Preenche um input de texto automaticamente quando um item é selecionado em um select.
 * 
 * @param {string} selectId - ID do <select>
 * @param {string} inputId - ID do <input type="text">
 * @param {string} dataAttr - Nome do atributo data-* no <option> que contém o valor
 */
function linkSelectToTextInput(selectId, inputId, dataAttr) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);

    if (!select || !input) {
        console.error(`Elemento não encontrado: #${selectId} ou #${inputId}`);
        return;
    }

    select.addEventListener("change", () => {
        const selectedOption = select.options[select.selectedIndex];
        const value = selectedOption.getAttribute(dataAttr);

        if (value !== null) {
            input.value = value;
        } else {
            input.value = "";
        }
    });
}

/**
 * Preenche um input de data automaticamente quando um item é selecionado em um select.
 * 
 * @param {string} selectId - ID do <select>
 * @param {string} inputId - ID do <input type="date">
 * @param {string} dataAttr - Nome do atributo data-* no <option> que contém a data (em formato ISO: yyyy-mm-dd)
 */
function linkSelectToDateInput(selectId, inputId, dataAttr) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);

    if (!select || !input) {
        console.error(`Elemento não encontrado: #${selectId} ou #${inputId}`);
        return;
    }

    select.addEventListener("change", () => {
        const selectedOption = select.options[select.selectedIndex];
        const value = selectedOption.getAttribute(dataAttr);

        if (value !== null) {
            input.value = value;
        } else {
            input.value = "";
        }
    });
}

/**
 * Preenche um input com múltiplas checkboxes automaticamente quando um item é selecionado em um select.
 * 
 * @param {string} selectId - ID do <select>
 * @param {string} checkboxName - nome do input checkbox
 * @param {string} dataAttr - Nome do atributo data-* no <option> que contém os valores das checkboxes
 */
function linkSelectToCheckboxes(selectId, checkboxName, dataAttr) {
    const select = document.getElementById(selectId);

    if (!select) return;

    select.addEventListener("change", () => {
        const selectedOption = select.options[select.selectedIndex];
        const values = selectedOption.getAttribute(dataAttr);
        
        const checkboxes = document.querySelectorAll(`input[name='${checkboxName}']`);
        checkboxes.forEach(cb => cb.checked = false);

        if (values) {
            const tempValues = values.replace(/, /g, "***TEMP***");
            
            const selectedValues = tempValues.split(",");
            
            const finalValues = selectedValues.map(val => 
                val.replace(/\*\*\*TEMP\*\*\*/g, ", ")
            );

            checkboxes.forEach(cb => {
                if (finalValues.includes(cb.value)) {
                    cb.checked = true;
                }
            });
        }
    });
}