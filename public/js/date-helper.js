export function validarDataMenorQueHoje(data) {
    const dataInserida = new Date(data);
    const dataAtual = new Date();

    if (isNaN(dataInserida.getTime()) || dataInserida > dataAtual) {
        return false;
    } 
   
    return true;
}

export function validarDataInicialMenorQueFinal(dataInicial, dataFinal) {
    const dataInicio = new Date(dataInicial);
    const dataFim = new Date(dataFinal);

    return dataInicio < dataFim;
}