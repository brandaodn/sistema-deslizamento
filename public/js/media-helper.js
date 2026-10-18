/**
 * Cria uma div 
 * 
 * @param {midia} media - entidade da tabela midia que será renderizada
 * @param {string} divClassName - .className
 * @param {string} divMinWidth - .style.minWidht
 * @param {string} divFlex - .style.flex
 */

export function createDivToMedias(media, divClassName, divMinWidth, divFlex) {
    const wrapper = document.createElement('div');
    wrapper.className = divClassName;
    wrapper.style.minWidth = divMinWidth;
    wrapper.style.flex = divFlex;

    wrapper.innerHTML = getMediaWrapper(media);
    return wrapper;
}

/**
 * Retorna tags html em formato string para posteriormente serem renderizadas.
 * 
 * @param {midia} media - entidade da tabela midia que será renderizada
 */

function getMediaWrapper(media) {
    const url = media.url_midia;
    const urlLower = (url || '').toLowerCase();
    const isVideo = media.tipo_midia === "Vídeo";

    if (isVideo) {
        if (urlLower.endsWith('.mp4') || urlLower.endsWith('.webm') || urlLower.endsWith('.ogg')) {
        return `
            <video controls style="width:250px; height:160px; object-fit:cover;" class="rounded shadow-sm">
            <source src="${url}" />
            Seu navegador não suporta vídeo.
            </video>`;
        } else {
        const embedUrl = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') :
                        (url.includes('youtu.be/') ? url.replace('youtu.be/', 'www.youtube.com/embed/') : url);
        return `
                <iframe width="250" height="160" src="${embedUrl}" frameborder="0" allowfullscreen class="rounded shadow-sm"></iframe>`;
        }
    } else {
        return `
            <img src="${url}" alt="mídia" style="width:250px; height:160px; object-fit:cover;" class="rounded shadow-sm"/>`;
    }
}