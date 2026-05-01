// ==================== INTEGRAÇÃO COM APIs PÚBLICAS ====================

async function buscarAPIsPublicas(filtros = {}) {
    const { limit = 10, sort = 'best' } = filtros;

    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            sort: sort
        });

        const response = await fetch(
            `https://www.freepublicapis.com/api/apis?${params}`
        );

        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        return data.data || [];

    } catch (error) {
        console.error('Erro ao buscar APIs:', error);
        return [];
    }
}

async function buscarAPIPorId(id) {
    try {
        const response = await fetch(
            `https://www.freepublicapis.com/api/apis/${id}`
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function obterAPIAleatoria() {
    try {
        const response = await fetch(
            'https://www.freepublicapis.com/api/random'
        );
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function abrirModalAPIs() {
    document.getElementById('modalAPIs').classList.remove('hidden');
    carregarSugestoesAPI();
}

function fecharModalAPIs() {
    document.getElementById('modalAPIs').classList.add('hidden');
}

async function carregarSugestoesAPI() {
    const lista = document.getElementById('listaAPIs');
    const sort = document.getElementById('filtroSort')?.value || 'best';

    lista.innerHTML = '<p style="text-align: center; color: #666;">Carregando sugestões...</p>';

    const apis = await buscarAPIsPublicas({ limit: 15, sort: sort });

    if (apis.length === 0) {
        lista.innerHTML = '<p style="text-align: center; color: #666;">Nenhuma API encontrada.</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 10px;">';

    apis.forEach(api => {
        const saude = api.health || 0;
        const corSaude = saude >= 90 ? '#2E7D32' : saude >= 70 ? '#F9A825' : '#D32F2F';

        html += `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 12px; background: #fafafa;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <strong style="font-size: 14px;">${api.emoji || '🔗'} ${api.title}</strong>
                        <p style="font-size: 12px; color: #666; margin: 5px 0;">${api.description ? api.description.substring(0, 100) : ''}${api.description && api.description.length > 100 ? '...' : ''}</p>
                        <div style="display: flex; gap: 10px; font-size: 11px; color: #888; flex-wrap: wrap;">
                            <span>📊 Saúde: <span style="color: ${corSaude}; font-weight: bold;">${saude}%</span></span>
                            <span>⚡ Latência: ${api.avg_latency || '?'}ms</span>
                            <span>🔁 Confiabilidade: ${api.avg_reliability || '?'}%</span>
                        </div>
                    </div>
                    <button onclick="usarEstaAPI('${api.id}', '${api.title ? api.title.replace(/'/g, "\\'") : ''}', '${api.documentation || ''}')"
                            style="background: #0047B6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 10px;">
                        Usar
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    lista.innerHTML = html;
}

function usarEstaAPI(id, titulo, documentacao) {
    fecharModalAPIs();

    if (typeof abrirModalIA === 'function' && dadosContextoIA.semana !== null) {
        const habilidadeField = document.getElementById('modalHabilidade');
        if (habilidadeField) {
            habilidadeField.value = `Sugestão: Utilizar API "${titulo}" (${documentacao}) para enriquecer a aula com dados em tempo real e atividades interativas.`;
        }

        const tituloField = document.getElementById('modalTitulo');
        if (tituloField) {
            tituloField.focus();
        }

        alert(`💡 Sugestão adicionada! Complete o título e clique em "Gerar Plano" para criar sua aula.`);
    } else {
        alert(`📌 API sugerida: ${titulo}\n\nDocumentação: ${documentacao}\n\nUse esta API para criar atividades interativas!`);
    }
}

async function inserirAPIAleatoria() {
    const api = await obterAPIAleatoria();

    if (api) {
        usarEstaAPI(api.id, api.title, api.documentation);
    } else {
        alert('Não foi possível carregar uma API aleatória. Tente novamente.');
    }
}
