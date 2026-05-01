// ==================== AUTENTICAÇÃO ====================

function mostrarLogin() {
    if (!loginForm || !cadastroForm || !recuperacaoForm || !novaSenhaForm) return;
    loginForm.classList.remove('hidden');
    cadastroForm.classList.add('hidden');
    recuperacaoForm.classList.add('hidden');
    novaSenhaForm.classList.add('hidden');
}

function mostrarCadastro() {
    if (!loginForm || !cadastroForm || !recuperacaoForm || !novaSenhaForm) return;
    loginForm.classList.add('hidden');
    cadastroForm.classList.remove('hidden');
    recuperacaoForm.classList.add('hidden');
    novaSenhaForm.classList.add('hidden');
}

function mostrarRecuperacao() {
    if (!loginForm || !cadastroForm || !recuperacaoForm || !novaSenhaForm) return;
    loginForm.classList.add('hidden');
    cadastroForm.classList.add('hidden');
    recuperacaoForm.classList.remove('hidden');
    novaSenhaForm.classList.add('hidden');
}

function mostrarNovaSenha() {
    if (!loginForm || !cadastroForm || !recuperacaoForm || !novaSenhaForm) return;
    loginForm.classList.add('hidden');
    cadastroForm.classList.add('hidden');
    recuperacaoForm.classList.add('hidden');
    novaSenhaForm.classList.remove('hidden');
}

function fazerLogin() {
    try {
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const senha = document.getElementById('loginSenha').value;
        
        if (!email || !senha) {
            alert('Preencha email e senha');
            return;
        }
        
        // Login do superusuário (admin)
        if (email === SUPER_USUARIO.email && senha === SUPER_USUARIO.senha) {
            usuarioLogado = {
                nome: SUPER_USUARIO.nome,
                email: SUPER_USUARIO.email,
                tipo: SUPER_USUARIO.tipo
            };
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
            iniciarAplicacao();
            return;
        }
        
        // Busca usuário pelo email no localStorage
        let usuarioEncontrado = null;
        let chaveUsuario = null;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('usuario_')) {
                const userData = JSON.parse(localStorage.getItem(key));
                if (userData.email === email) {
                    usuarioEncontrado = userData;
                    chaveUsuario = key.replace('usuario_', '');
                    break;
                }
            }
        }
        
        if (!usuarioEncontrado) {
            alert('Email não encontrado');
            return;
        }
        
        const senhaUsuario = localStorage.getItem('senha_' + chaveUsuario);
        
        if (!senhaUsuario || senhaUsuario !== senha) {
            alert('Senha incorreta');
            return;
        }
        
        usuarioLogado = usuarioEncontrado;
        usuarioLogado.tipo = "professor";
        
        const lembrar = document.getElementById('lembrarUsuario').checked;
        if (lembrar) {
            localStorage.setItem('usuarioLembrado', email);
        } else {
            localStorage.removeItem('usuarioLembrado');
        }
        
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        iniciarAplicacao();
        
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

function fazerCadastro() {
    try {
        const nome = document.getElementById('cadastroNome').value.trim();
        const email = document.getElementById('cadastroEmail').value.trim().toLowerCase();
        const senha = document.getElementById('cadastroSenha').value;
        const confirmarSenha = document.getElementById('cadastroConfirmarSenha').value;
        const termos = document.getElementById('termosUso').checked;
        
        if (!nome || !email || !senha || !confirmarSenha) {
            alert('Preencha todos os campos');
            return;
        }
        
        // Verifica se é o email do superusuário
        if (email === SUPER_USUARIO.email) {
            alert('Este email é reservado para a coordenação');
            return;
        }
        
        if (senha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (senha !== confirmarSenha) {
            alert('As senhas não coincidem');
            return;
        }
        
        if (!termos) {
            alert('Aceite os termos de uso');
            return;
        }
        
        // Verifica se email já está cadastrado
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('usuario_')) {
                const userData = JSON.parse(localStorage.getItem(key));
                if (userData.email === email) {
                    alert('Este email já está cadastrado');
                    return;
                }
            }
        }
        
        // Gera um nome de usuário único baseado no email
        const usuario = email.split('@')[0];
        
        const novoUsuario = { 
            nome, 
            usuario, 
            email,
            tipo: "professor",
            dataCadastro: new Date().toISOString()
        };
        
        localStorage.setItem('usuario_' + usuario, JSON.stringify(novoUsuario));
        localStorage.setItem('senha_' + usuario, senha);
        
        usuarioLogado = novoUsuario;
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        iniciarAplicacao();
        alert('Conta criada com sucesso!');
        
    } catch (error) {
        alert('Erro no cadastro: ' + error.message);
    }
}

function iniciarRecuperacao() {
    try {
        const email = document.getElementById('recuperacaoEmail').value.trim().toLowerCase();
        
        if (!email) {
            alert('Preencha o email');
            return;
        }
        
        // Busca usuário pelo email
        let usuarioEncontrado = null;
        let chaveUsuario = null;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('usuario_')) {
                const userData = JSON.parse(localStorage.getItem(key));
                if (userData.email === email) {
                    usuarioEncontrado = userData;
                    chaveUsuario = key.replace('usuario_', '');
                    break;
                }
            }
        }
        
        if (!usuarioEncontrado) {
            alert('Email não encontrado');
            return;
        }
        
        const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
        const expiracao = Date.now() + 3600000;
        
        localStorage.setItem('recuperacao_' + chaveUsuario, JSON.stringify({
            codigo,
            expiracao,
            usuario: chaveUsuario,
            email: email
        }));
        
        alert(`Código de recuperação (simulação): ${codigo}\n\nEm produção, este código seria enviado para: ${email}`);
        
        mostrarNovaSenha();
        
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

function definirNovaSenha() {
    try {
        const codigo = document.getElementById('codigoVerificacao').value.trim().toUpperCase();
        const novaSenha = document.getElementById('novaSenha').value;
        const confirmarNovaSenha = document.getElementById('confirmarNovaSenha').value;
        
        if (!codigo || !novaSenha || !confirmarNovaSenha) {
            alert('Preencha todos os campos');
            return;
        }
        
        if (novaSenha.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        
        if (novaSenha !== confirmarNovaSenha) {
            alert('As senhas não coincidem');
            return;
        }
        
        let usuarioRecuperacao = null;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('recuperacao_')) {
                const dados = JSON.parse(localStorage.getItem(key));
                if (dados.codigo === codigo && dados.expiracao > Date.now()) {
                    usuarioRecuperacao = dados.usuario;
                    break;
                }
            }
        }
        
        if (!usuarioRecuperacao) {
            alert('Código inválido ou expirado');
            return;
        }
        
        localStorage.setItem('senha_' + usuarioRecuperacao, novaSenha);
        localStorage.removeItem('recuperacao_' + usuarioRecuperacao);
        
        alert('Senha alterada com sucesso! Faça login com sua nova senha.');
        mostrarLogin();
        
    } catch (error) {
        alert('Erro: ' + error.message);
    }
}

function toggleSenha(idInput) {
    const input = document.getElementById(idInput);
    if (input && input.type === 'password') {
        input.type = 'text';
    } else if (input) {
        input.type = 'password';
    }
}

function fazerLogout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('usuarioLogado');
        window.location.reload();
    }
}
