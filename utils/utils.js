function validarCampos(campos){
    for (let campo in campos) {
        if (campos[campo] === "") {
            campos[campo] = null; 
        } else if (campos[campo] === "true"){
            campos[campo] = true;
        }else if (campos[campo] === "false"){
            campos[campo] = false;
        }
    }
};

function processCheckboxes(campo) {
    if (!campo) {
        return null;
    }
    if (!Array.isArray(campo)) {
        return [campo];
    }
    return campo;
}

module.exports = {validarCampos, processCheckboxes};
