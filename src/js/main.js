// ==================== INICIALIZAÇÃO GLOBAL ====================

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa estado e referências do DOM
    inicializarEstado();

    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
        try {
            usuarioLogado = JSON.parse(usuarioSalvo);
            iniciarAplicacao();
        } catch (e) { console.error(e); }
    }

    const usuarioLembrado = localStorage.getItem('usuarioLembrado');
    if (usuarioLembrado && document.getElementById('loginUsuario')) {
        document.getElementById('loginUsuario').value = usuarioLembrado;
        document.getElementById('lembrarUsuario').checked = true;
    }
    mostrarLogin();
});

console.log('✅ Sistema Planejador de Aulas carregado!');
