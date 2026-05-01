// ==================== ESTADO DA APLICAÇÃO ====================

let usuarioLogado = null;
let semanas = [];
let semanaAtual = -1;
let planejamentos = {};
let horarioProfessor = {};
let dadosContextoIA = { semana: null, dia: null, aula: null };

// Elementos do DOM
let telaLogin, appPrincipal, loginForm, cadastroForm, recuperacaoForm, novaSenhaForm, btnAdmin;

function inicializarEstado() {
    telaLogin = document.getElementById('telaLogin');
    appPrincipal = document.getElementById('appPrincipal');
    loginForm = document.getElementById('loginForm');
    cadastroForm = document.getElementById('cadastroForm');
    recuperacaoForm = document.getElementById('recuperacaoForm');
    novaSenhaForm = document.getElementById('novaSenhaForm');
    btnAdmin = document.getElementById('btnAdmin');
}
