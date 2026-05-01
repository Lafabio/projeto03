// ==================== PLANEJAMENTO DE AULAS ====================

function gerarSemanas(dataISO) {
    if (!dataISO) return;

    if (Object.keys(horarioProfessor).length === 0) {
        alert('Configure seu horário primeiro! Clique em "Meu Horário"');
        abrirConfiguracaoHorario();
        return;
    }

    semanas = [];
    const data = new Date(dataISO);

    const diaSemana = data.getDay();
    if (diaSemana !== 1) {
        const ajuste = diaSemana === 0 ? 1 : 1 - diaSemana;
        data.setDate(data.getDate() + ajuste);
    }

    for (let i = 0; i < 43; i++) {
        const inicio = new Date(data);
        const fim = new Date(data);
        fim.setDate(fim.getDate() + 4);

        semanas.push({
            id: i + 1,
            inicio: new Date(inicio),
            fim: new Date(fim)
        });

        data.setDate(data.getDate() + 7);
    }

    if (usuarioLogado) {
        localStorage.setItem('dataInicioLetivo_' + usuarioLogado.usuario, dataISO);
    }

    inicializarPlanejamentos();
    renderSemanas();
}

function inicializarPlanejamentos() {
    semanas.forEach((semana, index) => {
        const chave = `semana_${index}`;
        if (!planejamentos[chave]) {
            planejamentos[chave] = {
                aulas: criarGradeBaseadaNoHorario(),
                anotacoes: ''
            };
        }
    });

    if (usuarioLogado) {
        localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
    }
}

function criarGradeBaseadaNoHorario() {
    const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
    const grade = Array(5).fill().map(() => Array(7).fill({ disciplina: null, turma: null, conteudo: '' }));

    dias.forEach((dia, diaIndex) => {
        if (horarioProfessor[dia]) {
            horarioProfessor[dia].forEach((aulaData, aulaIndex) => {
                if (aulaData && aulaData.disciplina && aulaData.turma) {
                    grade[diaIndex][aulaIndex] = {
                        disciplina: aulaData.disciplina,
                        turma: aulaData.turma,
                        conteudo: ''
                    };
                }
            });
        }
    });

    return grade;
}

function renderSemanas() {
    const container = document.getElementById('listaSemanas');
    if (!container) return;
    container.innerHTML = '';

    semanas.forEach((semana, index) => {
        const div = document.createElement('div');
        div.style.cssText = `
            background: white;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #0047B6;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        `;

        div.onclick = () => abrirSemana(index);

        const formatarData = (data) => data.toLocaleDateString('pt-BR');

        div.innerHTML = `
            <h3 style="margin: 0 0 5px 0; color: #0047B6;">Semana ${semana.id}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">${formatarData(semana.inicio)} a ${formatarData(semana.fim)}</p>
        `;

        container.appendChild(div);
    });

    const contador = document.getElementById('contadorSemanas');
    if (contador) contador.textContent = `${semanas.length} semanas geradas`;
}

function abrirSemana(index) {
    semanaAtual = index;
    const semana = semanas[index];
    document.getElementById('paginaSemanas').classList.add('hidden');
    document.getElementById('paginaAulas').classList.remove('hidden');

    const titulo = document.getElementById('tituloSemana');
    if (titulo) {
        const formatarData = (data) => data.toLocaleDateString('pt-BR');
        titulo.textContent = `Semana ${semana.id} - ${formatarData(semana.inicio)} a ${formatarData(semana.fim)}`;
    }

    renderGradeSemana(index);
}

function renderGradeSemana(index) {
    const container = document.getElementById('gradeSemana');
    if (!container) return;

    const semana = semanas[index];
    const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
    const chave = `semana_${index}`;

    if (!planejamentos[chave]) {
        planejamentos[chave] = { aulas: criarGradeBaseadaNoHorario(), anotacoes: '' };
    }
    const planejamentoSemana = planejamentos[chave];

    let html = `
        <div style="display: grid; grid-template-columns: 100px repeat(5, 1fr); gap: 1px; background: #f0f0f0; border: 1px solid #f0f0f0;">
            <div style="background: #0047B6; color: white; padding: 10px; text-align: center; font-weight: bold;">Horário</div>
    `;

    dias.forEach((dia, i) => {
        const data = new Date(semana.inicio);
        data.setDate(data.getDate() + i);
        html += `<div style="background: #0047B6; color: white; padding: 10px; text-align: center; font-weight: bold;">
            ${DIAS_SEMANA_COMPLETO[i]} <br> <small>${data.toLocaleDateString('pt-BR')}</small>
        </div>`;
    });

    for (let aula = 0; aula < 7; aula++) {
        html += `<div style="background: white; padding: 10px; text-align: center; font-weight: bold; color: #0047B6;">
            ${HORARIOS[aula]} <br> <small>45 min</small>
        </div>`;

        for (let dia = 0; dia < 5; dia++) {
            const aulaData = planejamentoSemana.aulas[dia][aula] || { disciplina: null, turma: null, conteudo: '' };
            const temAula = aulaData.disciplina && aulaData.turma;

            html += `
                <div style="background: white; padding: 10px; min-height: 150px; ${!temAula ? 'background: #f9f9f9;' : ''}">
                    ${temAula ? `
                        <div style="margin-bottom: 5px;">
                            <strong style="font-size: 13px;">${DISCIPLINAS.find(d => d.id === aulaData.disciplina)?.nome || ''}</strong>
                            <div style="font-size: 12px; color: #0047B6;">🏫 Turma ${aulaData.turma}</div>
                        </div>
                        <textarea
                            style="width: 100%; height: 70px; padding: 5px; border: 1px solid #ddd; border-radius: 4px; font-size: 12px;"
                            placeholder="Conteúdo da aula..."
                            oninput="salvarConteudoAula(${index}, ${dia}, ${aula}, this.value)"
                        >${aulaData.conteudo || ''}</textarea>
                        <div class="botoes-aula">
                            <button class="btn-ia" onclick="abrirModalIA(${index}, ${dia}, ${aula})" style="background: #6200EA;">🤖 Gerar com IA</button>
                            <button class="btn-ia" onclick="abrirModalAPIs()" style="background: #00897B; margin-left: 5px;">🔗 APIs</button>
                            <button class="btn-apagar" onclick="apagarConteudoAula(${index}, ${dia}, ${aula})">🗑️</button>
                        </div>
                    ` : `<div style="color: #999; font-style: italic; text-align: center; padding: 20px 0;">Sem aula</div>`}
                </div>
            `;
        }
    }

    html += `</div>`;

    html += `
        <div style="margin-top: 20px;">
            <h3>📝 Anotações da Semana</h3>
            <textarea id="anotacoesSemana"
                     style="width: 100%; height: 80px; padding: 10px; border: 1px solid #ddd; border-radius: 6px;"
                     placeholder="Anotações gerais..."
                     oninput="salvarAnotacoesSemana(${index}, this.value)">${planejamentoSemana.anotacoes || ''}</textarea>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button onclick="apagarAnotacoesSemana(${index})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">🗑️ Apagar Anotações</button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}
