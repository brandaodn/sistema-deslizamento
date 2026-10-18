/**
 * Filtra uma lista de eventos conforme critérios de localidade, tipo e número de mortos.
 * 
 * @param {Array} eventos - Lista de objetos de eventos.
 * @param {Object} criterios - Objeto com os filtros desejados.
 * @param {string|null} criterios.localidadeMunicipio - Nome do município (ou null para todos).
 * @param {Array<string>} criterios.tipos - Lista de categorias selecionadas.
 * @param {number|null} criterios.minMortos - Limite inferior de mortos.
 * @param {number|null} criterios.maxMortos - Limite superior de mortos.
 * 
 * @returns {Array} - Lista de eventos que passaram pelos filtros.
 */

export function filtrarEventos(eventos, criterios) {
    const { localidadePais, localidadeUF, localidadeMunicipio, tipos, minMortos, maxMortos, dataMin, dataMax } = criterios;

    return eventos.filter(ev => {
        if (localidadePais && ev.nome_pais !== localidadePais)
            return false;
        if (localidadeUF && ev.nome_uf !== localidadeUF)
            return false;
        if (localidadeMunicipio && ev.nome_municipio !== localidadeMunicipio)
            return false;

        if (tipos && tipos.length > 0) {
            const categorias = ev.categoria || [];
            const temIntersecao = categorias.some(c => tipos.includes(c));
            if (!temIntersecao) return false;
        }

        const mortos = ev.n_mortos ? parseInt(ev.n_mortos) : 0;
        if (minMortos != null && mortos < minMortos) return false;
        if (maxMortos != null && mortos > maxMortos) return false;

        if (dataMin || dataMax) {
            const dataEvento = ev.data_evento ? new Date(ev.data_evento) : null;

            if (!dataEvento || isNaN(dataEvento)) return false;

            if (dataMin && dataEvento < new Date(dataMin)) return false;
            if (dataMax && dataEvento > new Date(dataMax)) return false;
        }

        return true;
    });
}
