// ==================== INTEGRAÇÃO COM IA (GEMINI) ====================

function abrirModalIA(semanaIndex, diaIndex, aulaIndex) {
    const chave = `semana_${semanaIndex}`;
    const aulaData = planejamentos[chave].aulas[diaIndex][aulaIndex];

    if (!aulaData.disciplina || !aulaData.turma) {
        alert("⚠️ Configure disciplina e turma primeiro.");
        return;
    }

    dadosContextoIA = { semana: semanaIndex, dia: diaIndex, aula: aulaIndex };

    const disciplinaNome = DISCIPLINAS.find(d => d.id === aulaData.disciplina)?.nome || '';
    const turma = aulaData.turma;

    document.getElementById('modalDisciplina').textContent = disciplinaNome;
    document.getElementById('modalTurma').textContent = turma;
    document.getElementById('modalTitulo').value = '';
    document.getElementById('modalHabilidade').value = '';

    document.getElementById('modalIA').classList.remove('hidden');
}

function fecharModalIA() {
    document.getElementById('modalIA').classList.add('hidden');
}

async function gerarPlanoComIAModal() {
    let apiKey = document.getElementById('geminiApiKey').value.trim();

    // Se for superusuário, usa a API Key salva ou permite salvar uma nova
    if (usuarioLogado && usuarioLogado.tipo === "superuser") {
        const apiKeySalva = localStorage.getItem('apiKeySuperuser');
        if (!apiKey && apiKeySalva) {
            apiKey = apiKeySalva;
            document.getElementById('geminiApiKey').value = apiKey;
        }
        // Salva a API Key atual para uso futuro
        if (apiKey) {
            localStorage.setItem('apiKeySuperuser', apiKey);
        }
    }

    const titulo = document.getElementById('modalTitulo').value.trim();
    const habilidade = document.getElementById('modalHabilidade').value.trim();

    if (!apiKey) {
        alert("⚠️ Insira sua API Key do Gemini no topo da página.");
        return;
    }
    if (!titulo) {
        alert("⚠️ Preencha o Título da Aula.");
        return;
    }

    const btn = document.getElementById('btnGerarIA');
    btn.disabled = true;
    btn.innerHTML = "⏳ Gerando...";

    const { semana, dia, aula } = dadosContextoIA;
    const disciplinaNome = document.getElementById('modalDisciplina').textContent;
    const turma = document.getElementById('modalTurma').textContent;

    const prompt = `
Atue como especialista em planejamento pedagógico SESI. Crie plano de aula seguindo ESTRITAMENTE:

DADOS:
- Disciplina: ${disciplinaNome}
- Turma: ${turma}
- Título: ${titulo}
- Habilidade: ${habilidade || "Não especificada"}

ESTRUTURA OBRIGATÓRIA:

**Título da aula**
${titulo}

**Objetivos da aula**
(Liste 2-3 objetivos claros)

**Objeto de Conhecimento**
(Conceitos principais da BNCC)

**Momentos (Desenvolvimento)**
1. **Abertura:** (Situação-problema ou engajamento)
2. **Exploração:** (Explicação do conteúdo)
3. **Prática:** (Atividade dos alunos)
4. **Consolidação:** (Fechamento)

**Estratégias**
(Metodologias ativas e recursos)

**Tarefa de casa**
(Atividade sugerida)

Retorne APENAS o plano formatado.
`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const textoGerado = data.candidates[0].content.parts[0].text;

        const chave = `semana_${semana}`;
        planejamentos[chave].aulas[dia][aula].conteudo = textoGerado;
        localStorage.setItem('planejamentos_' + usuarioLogado.usuario, JSON.stringify(planejamentos));

        fecharModalIA();
        renderGradeSemana(semana);
        alert('✅ Plano gerado com sucesso!');

    } catch (error) {
        console.error(error);
        alert("❌ Erro: " + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = "✨ Gerar Planejamento";
    }
}
