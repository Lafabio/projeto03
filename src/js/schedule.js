// ==================== CONFIGURAÇÃO DE HORÁRIO ====================

function abrirConfiguracaoHorario() {
    const modalHTML = `
        <div id="modalHorario" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h3 style="color: #0047B6;">🕐 Configurar Meu Horário</h3>
                <p>Configure seu horário semanal.</p>
                <div id="gradeHorario" style="margin: 20px 0;"></div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="salvarHorario()" style="background: #2E7D32; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Salvar</button>
                    <button onclick="fecharModalHorario()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Cancelar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    renderGradeHorario();
}

function renderGradeHorario() {
    const container = document.getElementById('gradeHorario');
    if (!container) return;

    const dias = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
    let html = '<div style="display: grid; grid-template-columns: 80px repeat(5, 1fr); gap: 2px;">';

    html += '<div style="background: #0047B6; color: white; padding: 10px; text-align: center;">Horário</div>';
    dias.forEach(dia => {
        html += `<div style="background: #2A6ED4; color: white; padding: 10px; text-align: center;">${dia}</div>`;
    });

    for (let i = 0; i < 7; i++) {
        html += `<div style="background: #0047B6; color: white; padding: 10px; text-align: center;">${HORARIOS[i]}</div>`;

        for (let j = 0; j < 5; j++) {
            const dia = dias[j];
            const aulaData = (horarioProfessor[dia] && horarioProfessor[dia][i]) ? horarioProfessor[dia][i] : { disciplina: '', turma: '' };

            html += `
                <div style="padding: 5px; border: 1px solid #ddd; background: white;">
                    <select style="width: 100%; margin-bottom: 5px;" onchange="atualizarDisciplinaHorario('${dia}', ${i}, this.value)">
                        <option value="">-- Sem aula --</option>
                        ${DISCIPLINAS.map(d => `<option value="${d.id}" ${aulaData.disciplina === d.id ? 'selected' : ''}>${d.icone} ${d.nome}</option>`).join('')}
                    </select>
                    ${aulaData.disciplina ? `
                        <select style="width: 100%;" onchange="atualizarTurmaHorario('${dia}', ${i}, this.value)">
                            <option value="">Selecione turma</option>
                            ${TURMAS.map(t => `<option value="${t}" ${aulaData.turma === t ? 'selected' : ''}>Turma ${t}</option>`).join('')}
                        </select>
                    ` : ''}
                </div>
            `;
        }
    }

    html += '</div>';
    container.innerHTML = html;
}

function atualizarDisciplinaHorario(dia, aulaIndex, disciplina) {
    if (!horarioProfessor[dia]) horarioProfessor[dia] = [];
    if (!horarioProfessor[dia][aulaIndex]) horarioProfessor[dia][aulaIndex] = {};
    horarioProfessor[dia][aulaIndex].disciplina = disciplina;
    horarioProfessor[dia][aulaIndex].turma = '';
    renderGradeHorario();
}

function atualizarTurmaHorario(dia, aulaIndex, turma) {
    if (!horarioProfessor[dia]) horarioProfessor[dia] = [];
    if (!horarioProfessor[dia][aulaIndex]) horarioProfessor[dia][aulaIndex] = {};
    horarioProfessor[dia][aulaIndex].turma = turma;
}

function salvarHorario() {
    if (!usuarioLogado) return;
    localStorage.setItem('horarioProfessor_' + usuarioLogado.usuario, JSON.stringify(horarioProfessor));
    alert('Horário salvo com sucesso!');
    fecharModalHorario();
    atualizarStatusHorario();

    if (semanas.length > 0) {
        aplicarHorarioNasSemanas();
        renderSemanas();
    }
}

function aplicarHorarioNasSemanas() {
    semanas.forEach((semana, index) => {
        const chave = `semana_${index}`;
        if (planejamentos[chave]) {
            const novaGrade = criarGradeBaseadaNoHorario();
            const gradeAntiga = planejamentos[chave].aulas;

            for (let dia = 0; dia < 5; dia++) {
                for (let aula = 0; aula < 7; aula++) {
                    if (gradeAntiga[dia] && gradeAntiga[dia][aula] && gradeAntiga[dia][aula].conteudo) {
                        novaGrade[dia][aula].conteudo = gradeAntiga[dia][aula].conteudo;
                    }
                }
            }

            planejamentos[chave].aulas = novaGrade;
        }
    });
    localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
}

function fecharModalHorario() {
    const modal = document.getElementById('modalHorario');
    if (modal) modal.remove();
}

function atualizarStatusHorario() {
    const statusElement = document.getElementById('statusHorario');
    if (!statusElement) return;

    let totalAulas = 0;
    Object.keys(horarioProfessor).forEach(dia => {
        if (horarioProfessor[dia]) {
            horarioProfessor[dia].forEach(aula => {
                if (aula && aula.disciplina && aula.turma) totalAulas++;
            });
        }
    });

    if (totalAulas === 0) {
        statusElement.innerHTML = '⚠️ Configure seu horário primeiro';
        statusElement.style.color = '#d32f2f';
    } else {
        statusElement.innerHTML = `✅ Horário configurado: ${totalAulas} aulas por semana`;
        statusElement.style.color = '#2E7D32';
    }
}
