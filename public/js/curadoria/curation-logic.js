import { createDivToMedias } from '../media-helper.js';
import { filtrarEventos } from '../filter-events.js';

/**
 * Lógica para a exibição do mapa interativo, das mídias relacionadas a cada evento e dos formulários
 * responsáveis por validar
 * 
 * @param {evento[]} eventos - vetor dos eventos que serão renderizados no mapa e validados
 * @param {midia[]} midias - vetor de mídias que serão renderizadas por evento.
 */
export function curationLogic(eventos, midias) {
    document.addEventListener("DOMContentLoaded", function() {
        const avaliacaoRadios = document.querySelectorAll('input[name="avaliacao"]');
        const transferenciaContainer = document.getElementById('transferencia-container');
        const transferenciaOpcoes = document.getElementById('transferencia-opcoes');
        const inputIdEvento = document.getElementById('id-evento-avaliado');

        const filtroLocalidadePais = document.getElementById('filtro-localidade-pais');
        const filtroLocalidadeUF = document.getElementById('filtro-localidade-uf');
        const filtroLocalidade = document.getElementById('filtro-localidade');

        const filtroTipoEvento = document.getElementById('filtro-tipo-evento');
        const minMortosInput = document.getElementById('min-mortos');
        const maxMortosInput = document.getElementById('max-mortos');
        const btnAplicarFiltros = document.getElementById('btn-aplicar-filtros');

        let selectedCircle = null;

        const map = L.map('map').setView([-14.2350, -51.9253], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap colaboradores'
        }).addTo(map);

        const validadosGroup = L.featureGroup().addTo(map);
        const naoValidadosGroup = L.featureGroup().addTo(map);

        function coletarCriterios() {
            return {
                localidadePais: filtroLocalidadePais.value || null, 
                localidadeUF: filtroLocalidadeUF.value || null ,
                localidadeMunicipio: filtroLocalidade.value || null,
                tipos: Array.from(filtroTipoEvento.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
                minMortos: minMortosInput.value ? parseInt(minMortosInput.value) : null,
                maxMortos: maxMortosInput.value ? parseInt(maxMortosInput.value) : null
            };
        }

        function aplicarFiltros() {
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

        let eventoSelecionado = null;

        function mostrarMidiasPorEvento(idEvento, esta_validado) {
            eventoSelecionado = eventos.find(ev => ev.id_evento === idEvento) || null;

            const midiaContainer = document.getElementById('midia-container');
            const titulo = document.getElementById('midia-title');
            const avaliacaoContainer = document.getElementById('avaliacao-container');

            midiaContainer.innerHTML = '';
            transferenciaContainer.style.display = 'none';
            transferenciaOpcoes.innerHTML = '';

            if (esta_validado === false) {
                avaliacaoContainer.style.display = 'block';
                inputIdEvento.value = idEvento;
            } else {
                avaliacaoContainer.style.display = 'none';
            }

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
            naoValidadosGroup.clearLayers();

            eventosFiltrados.forEach(ev => {
                if (!ev.coordenadas_x || !ev.coordenadas_y) return;

                const lat = parseFloat(ev.coordenadas_y);
                const lng = parseFloat(ev.coordenadas_x);
                if (Number.isNaN(lat) || Number.isNaN(lng)) return;

                const cor = ev.esta_validado ? 'green' : 'red';
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

                    mostrarMidiasPorEvento(ev.id_evento, ev.esta_validado);
                });

                if (ev.esta_validado) validadosGroup.addLayer(marker);
                else naoValidadosGroup.addLayer(marker);
            });

            const totalLayers = validadosGroup.getLayers().length + naoValidadosGroup.getLayers().length;
            if (totalLayers > 0) {
                const bounds = validadosGroup.getBounds().extend(naoValidadosGroup.getBounds());
                map.fitBounds(bounds);
            }
        }

        btnAplicarFiltros.addEventListener('click', aplicarFiltros);
        renderizarEventos(eventos);

        L.control.layers(null, {
            "Eventos Validados 🟢": validadosGroup,
            "Eventos Não Validados 🔴": naoValidadosGroup
        }, { collapsed:false }).addTo(map);
        
        avaliacaoRadios.forEach(radio => {
            radio.addEventListener('change', function() {
            const value = this.value;
            if (value === 'repetido' && eventoSelecionado) {
                const midiasDoEvento = midias.filter(m => +m.id_evento === +eventoSelecionado.id_evento);
                if (midiasDoEvento.length > 0) {
                    renderizarOpcoesDeTransferencia();
                    transferenciaContainer.style.display = 'block';
                } else {
                    transferenciaContainer.style.display = 'none';
                }
            } else {
                transferenciaContainer.style.display = 'none';
            }
            });
        });

        function renderizarOpcoesDeTransferencia() {
            transferenciaOpcoes.innerHTML = '';

            const eventosValidados = eventos.filter(e => e.esta_validado === true);
            if (eventosValidados.length === 0) {
                transferenciaOpcoes.innerHTML = '<p class="text-muted">Não há eventos validados disponíveis para transferência.</p>';
                return;
            }

            eventosValidados.forEach(ev => {
                const label = document.createElement('label');
                label.className = 'form-check-label d-block text-start';

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'destinoMidia';
                input.value = ev.id_evento;
                input.className = 'form-check-input me-2';

                const dataHora = new Date(ev.data_evento).toLocaleString('pt-BR');
                label.appendChild(input);
                label.insertAdjacentHTML('beforeend', `Lat: ${ev.coordenadas_y}, Lng: ${ev.coordenadas_x}, Data e Hora: ${dataHora}`);

                const wrapper = document.createElement('div');
                wrapper.className = 'form-check mb-2';
                wrapper.appendChild(label);

                transferenciaOpcoes.appendChild(wrapper);
            });

            const deletarDiv = document.createElement('div');
            deletarDiv.className = 'form-check mb-3 text-start';
            deletarDiv.innerHTML = `
                <input class="form-check-input" type="radio" name="destinoMidia" id="deletarMidia" value="-1">
                <label class="form-check-label" for="deletarMidia">
                    <strong>Deletar mídias junto ao evento</strong>
                </label>
            `;
            transferenciaOpcoes.appendChild(deletarDiv);
        }
    });
}
