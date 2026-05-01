// ==================== SALVAMENTO E EXPORTAÇÃO ====================

function salvarConteudoAula(semanaIndex, diaIndex, aulaIndex, conteudo) {
    if (!usuarioLogado) return;
    const chave = `semana_${semanaIndex}`;
    if (!planejamentos[chave]) {
        planejamentos[chave] = { aulas: criarGradeBaseadaNoHorario(), anotacoes: '' };
    }
    planejamentos[chave].aulas[diaIndex][aulaIndex].conteudo = conteudo;
    localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
}

function apagarConteudoAula(semanaIndex, diaIndex, aulaIndex) {
    if (confirm('Tem certeza que deseja apagar o conteúdo desta aula?')) {
        const chave = `semana_${semanaIndex}`;
        if (planejamentos[chave]) {
            planejamentos[chave].aulas[diaIndex][aulaIndex].conteudo = '';
            if (usuarioLogado) {
                localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
            }
            renderGradeSemana(semanaIndex);
            alert('Conteúdo apagado com sucesso!');
        }
    }
}

function apagarTodaSemana() {
    if (semanaAtual === -1) { alert('Nenhuma semana selecionada!'); return; }
    if (confirm('⚠️ ATENÇÃO: Isso apagará TODOS os conteúdos desta semana. Continuar?')) {
        const chave = `semana_${semanaAtual}`;
        if (planejamentos[chave]) {
            for (let dia = 0; dia < 5; dia++) {
                for (let aula = 0; aula < 7; aula++) {
                    planejamentos[chave].aulas[dia][aula].conteudo = '';
                }
            }
            planejamentos[chave].anotacoes = '';
            if (usuarioLogado) {
                localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
            }
            renderGradeSemana(semanaAtual);
            alert('Semana apagada!');
        }
    }
}

function salvarAnotacoesSemana(semanaIndex, anotacoes) {
    if (!usuarioLogado) return;
    const chave = `semana_${semanaIndex}`;
    if (!planejamentos[chave]) {
        planejamentos[chave] = { aulas: criarGradeBaseadaNoHorario(), anotacoes: '' };
    }
    planejamentos[chave].anotacoes = anotacoes;
    localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
}

function apagarAnotacoesSemana(semanaIndex) {
    if (confirm('Tem certeza que deseja apagar todas as anotações desta semana?')) {
        const chave = `semana_${semanaIndex}`;
        if (planejamentos[chave]) {
            planejamentos[chave].anotacoes = '';
            if (usuarioLogado) {
                localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));
            }
            renderGradeSemana(semanaIndex);
            alert('Anotações apagadas com sucesso!');
        }
    }
}

function copiarConteudo(semanaIndex, diaIndex, aulaIndex) {
    const chave = `semana_${semanaIndex}`;
    const aula = planejamentos[chave]?.aulas[diaIndex]?.[aulaIndex];
    if (!aula || !aula.conteudo) { alert('Nada para copiar!'); return; }

    const texto = `Conteúdo da aula (${DISCIPLINAS.find(d => d.id === aula.disciplina)?.nome || ''} - Turma ${aula.turma}):\n\n${aula.conteudo}`;
    navigator.clipboard.writeText(texto).then(() => {
        alert('Conteúdo copiado para a área de transferência!');
    });
}

// ==================== EXPORTAÇÃO PARA DOC ====================

function formatarDataDOC(data) {
    if (!data) return '';
    const d = new Date(data);
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function formatarConteudoCompletoDOC(conteudo) {
    if (!conteudo || conteudo.trim() === '') return 'Sem conteúdo planejado';
    return conteudo.replace(/\n/g, '<br>').replace(/  /g, ' &nbsp;');
}

function exportarSemanaDOC() {
    if (semanaAtual === -1) { alert('Nenhuma semana selecionada!'); return; }

    const semana = semanas[semanaAtual];
    const chave = `semana_${semanaAtual}`;
    const planejamento = planejamentos[chave] || { aulas: [], anotacoes: '' };

    let html = `
    <html><head><meta charset="utf-8"><title>Planejamento</title>
    <style>
        body{font-family:Arial; font-size:11pt;}
        table{width:100%; border-collapse:collapse;}
        th, td{border:1px solid #000; padding:8px; vertical-align:top;}
        th{background:#0047B6; color:white;}
    </style></head><body>
    <h2>Planejamento Semanal - Semana ${semana.id}</h2>
    <table><tr><th>Horário</th><th>Seg</th><th>Ter</th><th>Qua</th><th>Qui</th><th>Sex</th></tr>`;

    HORARIOS.forEach((h, i) => {
        html += `<tr><td><b>${h}</b></td>`;
        for(let d=0; d<5; d++) {
            const aula = planejamento.aulas[d]?.[i];
            if(aula && aula.disciplina) {
                const nome = DISCIPLINAS.find(x=>x.id===aula.disciplina)?.nome || '';
                html += `<td><b>${nome} (${aula.turma})</b><br>${(aula.conteudo||'').replace(/\n/g,'<br>')}</td>`;
            } else {
                html += `<td>-</td>`;
            }
        }
        html += `</tr>`;
    });

    html += `</table></body></html>`;

    const blob = new Blob([html], {type:'application/msword'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `plano_semana_${semana.id}.doc`;
    a.click();
}

function exportarParaDOC() {
    if (semanas.length === 0) {
        alert('Nenhuma semana gerada! Configure o horário e a data de início primeiro.');
        return;
    }

    const opcao = prompt('Escolha o tipo de exportação:\n1 - Semana atual (DOC/Word)\n2 - Semana específica (DOC/Word)\n\nDigite o número:');

    switch(opcao) {
        case '1':
            if (semanaAtual !== -1) exportarSemanaDOC();
            else alert('Nenhuma semana selecionada!');
            break;
        case '2':
            const semanaNum = prompt(`Digite o número da semana (1 a ${semanas.length}):`);
            const num = parseInt(semanaNum);
            if (num >= 1 && num <= semanas.length) {
                const index = num - 1;
                const temp = semanaAtual;
                semanaAtual = index;
                exportarSemanaDOC();
                semanaAtual = temp;
            } else {
                alert('Número de semana inválido!');
            }
            break;
        default:
            alert('Opção inválida!');
    }
}
