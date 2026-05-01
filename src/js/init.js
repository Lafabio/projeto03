// ==================== INICIALIZAÇÃO E EVENTOS ====================

function iniciarAplicacao() {
    if (!telaLogin || !appPrincipal) return;
    telaLogin.classList.add('hidden');
    appPrincipal.classList.remove('hidden');

    carregarDados();
    setupEventListeners();
    atualizarInterface();
}

function carregarDados() {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
        usuarioLogado = JSON.parse(usuarioSalvo);
    }

    // Carrega API Key do superusuário se estiver logado como admin
    if (usuarioLogado && usuarioLogado.tipo === "superuser") {
        const apiKeySalva = localStorage.getItem('apiKeySuperuser');
        if (apiKeySalva && document.getElementById('geminiApiKey')) {
            document.getElementById('geminiApiKey').value = apiKeySalva;
        }
    }

    if (usuarioLogado) {
        const planejamentosSalvos = localStorage.getItem('planejamentos_' + usuarioLogado.usuario);
        if (planejamentosSalvos) {
            planejamentos = JSON.parse(planejamentosSalvos);
        }

        const horarioSalvo = localStorage.getItem('horarioProfessor_' + usuarioLogado.usuario);
        if (horarioSalvo) {
            horarioProfessor = JSON.parse(horarioSalvo);
        }

        const dataInicio = localStorage.getItem('dataInicioLetivo_' + usuarioLogado.usuario);
        if (dataInicio && document.getElementById('inicioLetivo')) {
            document.getElementById('inicioLetivo').value = dataInicio;
            setTimeout(() => gerarSemanas(dataInicio), 100);
        }
    }
}

function setupEventListeners() {
    const inicioLetivo = document.getElementById('inicioLetivo');
    const btnHoje = document.getElementById('btnHoje');
    const btnVoltar = document.getElementById('voltar');

    if (inicioLetivo) {
        inicioLetivo.addEventListener('change', function() {
            gerarSemanas(this.value);
        });
    }

    if (btnHoje) {
        btnHoje.addEventListener('click', function() {
            const hoje = new Date().toISOString().split('T')[0];
            if (document.getElementById('inicioLetivo')) {
                document.getElementById('inicioLetivo').value = hoje;
                gerarSemanas(hoje);
            }
        });
    }

    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            document.getElementById('paginaAulas').classList.add('hidden');
            document.getElementById('paginaSemanas').classList.remove('hidden');
        });
    }
}

function atualizarInterface() {
    if (usuarioLogado && document.getElementById('userCumprimento')) {
        document.getElementById('userCumprimento').textContent = usuarioLogado.nome.split(' ')[0];
    }

    if (usuarioLogado && usuarioLogado.tipo === "superuser" && btnAdmin) {
        btnAdmin.classList.remove('hidden');
    } else if (btnAdmin) {
        btnAdmin.classList.add('hidden');
    }

    atualizarStatusHorario();
}
