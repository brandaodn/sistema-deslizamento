import { createDivToMedias } from '../media-helper.js';
import { filtrarEventos } from '../filter-events.js';
import { validarDataMenorQueHoje, validarDataInicialMenorQueFinal } from '../date-helper.js';

/**
 * Lógica para a exibição do mapa interativo, das mídias relacionadas a cada evento e dos formulários
 * responsáveis por validar
 * 
 * @param {evento[]} eventos - vetor dos eventos que serão renderizados no mapa e validados
 * @param {midia[]} midias - vetor de mídias que serão renderizadas por evento.
 */
export function viewMapLogic(eventos, midias) {
    document.addEventListener("DOMContentLoaded", function() {
        const inputIdEvento = document.getElementById('id-evento-avaliado');
        const btnVerDetalhes = document.getElementById('btn-ver-detalhes');

        const filtroLocalidade = document.getElementById('filtro-localidade');
        const filtroLocalidadePais = document.getElementById('filtro-localidade-pais');
        const filtroLocalidadeUF = document.getElementById('filtro-localidade-uf');
        const filtroTipoEvento = document.getElementById('filtro-tipo-evento');
        const minMortosInput = document.getElementById('min-mortos');
        const maxMortosInput = document.getElementById('max-mortos');
        const dataInicialInput = document.getElementById('data-inicial');
        const dataFinalInput = document.getElementById('data-final');
        const alertErroData = document.getElementById('alert-error-filter');

        const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');

        let selectedCircle = null;

        const map = L.map('map').setView([-14.2350, -51.9253], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap colaboradores'
        }).addTo(map);

        const validadosGroup = L.featureGroup().addTo(map);

        function coletarCriterios() {
            return {
                localidadePais: filtroLocalidadePais.value || null, 
                localidadeUF: filtroLocalidadeUF.value || null ,
                localidadeMunicipio: filtroLocalidade.value || null,
                tipos: Array.from(filtroTipoEvento.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
                minMortos: minMortosInput.value ? parseInt(minMortosInput.value) : null,
                maxMortos: maxMortosInput.value ? parseInt(maxMortosInput.value) : null,
                dataMin: dataInicialInput.value || null,
                dataMax: dataFinalInput.value || null
            };
        }

        function aplicarFiltros() {
            if ((dataInicialInput.value && !validarDataMenorQueHoje(dataInicialInput.value))|| (dataFinalInput.value && !validarDataMenorQueHoje(dataFinalInput.value))) {
                alertErroData.removeAttribute('hidden');
                alertErroData.querySelector('p').textContent = 'Por favor, insira datas menores que hoje';
                return;
            } 
            else if(dataInicialInput.value && dataFinalInput.value && !validarDataInicialMenorQueFinal(dataInicialInput.value, dataFinalInput.value)){
                alertErroData.removeAttribute('hidden');
                alertErroData.querySelector('p').textContent = 'Por favor, insira uma data inicial menor que a final';
                return;
            }
            else if(minMortosInput.value && maxMortosInput.value && minMortosInput.value > maxMortosInput.value) {
                alertErroData.removeAttribute('hidden');
                alertErroData.querySelector('p').textContent = 'Por favor, insira um mínimo de fatalidades menor que o máximo';
                return;
            }
            else {
                alertErroData.setAttribute('hidden', 'true');
            }
            
            const criterios = coletarCriterios();
            const eventosFiltrados = filtrarEventos(eventos, criterios);
            renderizarEventos(eventosFiltrados);
        }

        const localidadesPais = [...new Set(eventos.map(e => e.nome_pais).filter(Boolean))].sort();
        localidadesPais.forEach(loc => filtroLocalidadePais.insertAdjacentHTML('beforeend', `<option value="${loc}">${loc}</option>`));

        const localidadesUF = [...new Set(eventos.map(e => e.nome_uf).filter(Boolean))].sort();
        localidadesUF.forEach(loc => filtroLocalidadeUF.insertAdjacentHTML('beforeend', `<option value="${loc}">${loc}</option>`));

        const localidades = [...new Set(eventos.map(e => e.nome_municipio).filter(Boolean))].sort();
        localidades.forEach(loc => filtroLocalidade.insertAdjacentHTML('beforeend', `<option value="${loc}">${loc}</option>`));

        const categorias = [...new Set(eventos.flatMap(e => e.categoria || []))].sort();
        categorias.forEach(cat => {
            filtroTipoEvento.insertAdjacentHTML('beforeend', `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${cat}" id="tipo-${cat}">
                <label class="form-check-label" for="tipo-${cat}">${cat}</label>
            </div>
            `);
        });

        function mostrarMidiasPorEvento(idEvento) {
            const midiaContainer = document.getElementById('midia-container');
            const titulo = document.getElementById('midia-title');

            midiaContainer.innerHTML = '';

            const midiasDoEvento = midias.filter(m => +m.id_evento === +idEvento);
            if (midiasDoEvento.length === 0) {
                titulo.style.display = 'block';
                midiaContainer.innerHTML = '<p class="text-center text-muted">Nenhuma mídia encontrada para este evento.</p>';
                return;
            }

            titulo.style.display = 'block';
            midiasDoEvento.forEach(m => {
                const mediaDiv = createDivToMedias(m, 'd-flex flex-column align-items-center', '260px', '0 0 auto');
                midiaContainer.appendChild(mediaDiv);
            });
        }

        function renderizarEventos(eventosFiltrados) {
            validadosGroup.clearLayers();

            eventosFiltrados.forEach(ev => {
                if (!ev.coordenadas_x || !ev.coordenadas_y) return;

                const lat = parseFloat(ev.coordenadas_y);
                const lng = parseFloat(ev.coordenadas_x);
                if (Number.isNaN(lat) || Number.isNaN(lng)) return;

                const cor =  'green';
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color:${cor}; width:16px; height:16px; border-radius:50%; border:2px solid white;"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                });

                const marker = L.marker([lat, lng], { icon });
                marker.bindPopup(`
                    <b>Município:</b> ${ev.nome_municipio}<br>
                    <b>Data:</b> ${new Date(ev.data_evento).toLocaleString('pt-BR')}<br>
                    <b>Mortos:</b> ${ev.n_mortos || 'Não informado'}<br>
                    <b>Categorias:</b> ${ev.categoria ? ev.categoria.join(', ') : 'Sem categoria'}
                `);

                marker.on('click', function() {
                    if (selectedCircle) map.removeLayer(selectedCircle);

                    selectedCircle = L.circleMarker([lat, lng], {
                        color: 'black',
                        fillColor: 'white',
                        fillOpacity: 0.25,
                        radius: 15,
                        weight: 3
                    }).addTo(map).bringToFront();
                    inputIdEvento.value = ev.id_evento;
                    btnVerDetalhes.style.display = 'block';
                    mostrarMidiasPorEvento(ev.id_evento);
                });

                validadosGroup.addLayer(marker);

                const totalLayers = validadosGroup.getLayers().length;
                if (totalLayers > 0) {
                    const bounds = validadosGroup.getBounds();
                    map.fitBounds(bounds);
                }
            });
        }

        btnAplicarFiltros.addEventListener('click', aplicarFiltros);
        renderizarEventos(eventos);
    });
}
