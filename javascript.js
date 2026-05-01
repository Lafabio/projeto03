let usuarioLogado = null;
let semanas = [];
let semanaAtual = -1;
let planejamentos = {};
let horarioProfessor = {};
let dadosContextoIA = { semana: null, dia: null, aula: null };

const telaLogin = document.getElementById('telaLogin');
const appPrincipal = document.getElementById('appPrincipal');
const loginForm = document.getElementById('loginForm');
const cadastroForm = document.getElementById('cadastroForm');
const recuperacaoForm = document.getElementById('recuperacaoForm');
const novaSenhaForm = document.getElementById('novaSenhaForm');
const btnAdmin = document.getElementById('btnAdmin');

const SUPER_USUARIO = {
    email: "prog.lafa@gmail.com",
    senha: "Lilica2026",
    nome: "Coordenação Pedagógica",
    tipo: "superuser"
};

const DISCIPLINAS = [
    { id: "biologia", nome: "Biologia", icone: "🧬" },
    { id: "biohackeria", nome: "Biohackeria", icone: "🔬" },
    { id: "projetos_livres", nome: "Projetos Livres", icone: "💡" },
    { id: "robotica", nome: "Robótica", icone: "🤖" },
    { id: "apps_games", nome: "Apps e Games", icone: "🎮" },
    { id: "iniciacao_cientifica", nome: "Iniciação Científica", icone: "🔍" },
    { id: "outra", nome: "Outra", icone: "📝" }
];

const TURMAS = ['101', '102', '201', '202', '301', '302'];

const HORARIOS = [
    "07:15 - 08:00",
    "08:00 - 08:45",
    "08:45 - 09:30",
    "09:30 - 10:15",
    "10:30 - 11:15",
    "11:15 - 12:00",
    "12:00 - 12:45"
];

const DIAS_SEMANA_COMPLETO = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];
const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];

// ========== FUNÇÕES DE LOGIN/CADASTRO/RECUPERAÇÃO ==========
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

// ========== FUNÇÃO PARA TOGGLE DE SENHA ==========
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

// ========== INICIALIZAÇÃO ==========
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

// ========== INTEGRAÇÃO COM FREE PUBLIC APIS ==========

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

// ========== FUNÇÕES DE ADMINISTRAÇÃO (SUPERUSUÁRIO) ==========
function abrirPainelAdmin() {
    if (!usuarioLogado || usuarioLogado.tipo !== "superuser") {
        alert('Acesso restrito à coordenação');
        return;
    }
    
    const modalHTML = `
        <div id="modalAdmin" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 25px; border-radius: 10px; max-width: 900px; width: 90%; max-height: 85vh; overflow-y: auto;">
                <h3 style="color: #0047B6; margin-bottom: 15px;">⚙️ Painel de Administração - Coordenação</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <h4 style="color: #2A6ED4; margin-bottom: 10px;">📊 Estatísticas do Sistema</h4>
                        <div id="statsAdmin" style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
                            <p>Carregando estatísticas...</p>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: #2A6ED4; margin-bottom: 10px;">👥 Usuários Cadastrados</h4>
                        <div id="listaUsuarios" style="background: #f8f9fa; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0; max-height: 200px; overflow-y: auto;">
                            <p>Carregando usuários...</p>
                        </div>
                    </div>
                </div>
                
                <div style="margin: 20px 0;">
                    <h4 style="color: #2A6ED4; margin-bottom: 10px;">🛠️ Ações Administrativas</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <button onclick="exportarTodosDados()" style="background: #28a745; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; flex: 1;">
                            📥 Exportar Todos os Dados
                        </button>
                        <button onclick="limparDadosAntigos()" style="background: #ffc107; color: #212529; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; flex: 1;">
                            🗑️ Limpar Dados Antigos
                        </button>
                        <button onclick="alterarSenhaSuperuser()" style="background: #dc3545; color: white; border: none; padding: 10px 15px; border-radius: 6px; cursor: pointer; flex: 1;">
                            🔐 Alterar Senha da Coordenação
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                    <h4 style="color: #2A6ED4; margin-bottom: 10px;">👤 Gerenciar Usuário</h4>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="text" id="usuarioBuscar" placeholder="Digite o usuário" style="flex: 2; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <button onclick="buscarUsuario()" style="background: #0047B6; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; flex: 1;">
                            Buscar
                        </button>
                    </div>
                    <div id="detalhesUsuario" style="display: none; background: #f0f8ff; padding: 15px; border-radius: 6px; border: 1px solid #cce5ff;">
                        <div id="infoUsuario"></div>
                        <div style="margin-top: 10px;">
                            <button onclick="resetarSenhaUsuario()" style="background: #17a2b8; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                🔄 Resetar Senha
                            </button>
                            <button onclick="removerUsuario()" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                                🗑️ Remover Usuário
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button onclick="fecharModalAdmin()" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    carregarDadosAdmin();
}

function carregarDadosAdmin() {
    let totalUsuarios = 0;
    let professoresAtivos = 0;
    const usuarios = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('usuario_')) {
            try {
                const usuario = JSON.parse(localStorage.getItem(key));
                totalUsuarios++;
                
                if (usuario.tipo !== "superuser") {
                    professoresAtivos++;
                    
                    const temPlanejamentos = localStorage.getItem('planejamentos_' + usuario.usuario);
                    const temHorario = localStorage.getItem('horarioProfessor_' + usuario.usuario);
                    
                    usuarios.push({
                        usuario: usuario.usuario,
                        nome: usuario.nome,
                        email: usuario.email,
                        dataCadastro: usuario.dataCadastro,
                        ativo: temHorario ? "Sim" : "Não",
                        planejamentos: temPlanejamentos ? "Sim" : "Não"
                    });
                }
            } catch (e) { console.error(e); }
        }
    }

    const statsDiv = document.getElementById('statsAdmin');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <p><strong>Total de usuários:</strong> ${totalUsuarios}</p>
            <p><strong>Professores ativos:</strong> ${professoresAtivos}</p>
            <p><strong>Usuários com horário:</strong> ${usuarios.filter(u => u.ativo === "Sim").length}</p>
            <p><strong>Usuários com planejamentos:</strong> ${usuarios.filter(u => u.planejamentos === "Sim").length}</p>
            <p><strong>Uso do armazenamento:</strong> ${(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB</p>
        `;
    }

    const listaDiv = document.getElementById('listaUsuarios');
    if (listaDiv) {
        let html = '<div style="font-size: 13px;">';
        if (usuarios.length === 0) {
            html += '<p>Nenhum professor cadastrado</p>';
        } else {
            usuarios.forEach(user => {
                html += `
                    <div style="padding: 5px 0; border-bottom: 1px solid #e0e0e0;">
                        <div><strong>${user.nome}</strong> (${user.usuario})</div>
                        <div style="font-size: 11px; color: #666;">${user.email} • Horário: ${user.ativo}</div>
                    </div>
                `;
            });
        }
        html += '</div>';
        listaDiv.innerHTML = html;
    }
}

function buscarUsuario() {
    const usuarioBuscar = document.getElementById('usuarioBuscar').value.trim();
    if (!usuarioBuscar) {
        alert('Digite um usuário para buscar');
        return;
    }
    
    const dadosUsuario = localStorage.getItem('usuario_' + usuarioBuscar);
    if (!dadosUsuario) {
        alert('Usuário não encontrado');
        document.getElementById('detalhesUsuario').style.display = 'none';
        return;
    }

    const usuario = JSON.parse(dadosUsuario);

    if (usuario.tipo === "superuser") {
        alert('Não é possível gerenciar a conta da coordenação por aqui');
        document.getElementById('detalhesUsuario').style.display = 'none';
        return;
    }

    const temHorario = localStorage.getItem('horarioProfessor_' + usuario.usuario);
    const temPlanejamentos = localStorage.getItem('planejamentos_' + usuario.usuario);
    const dataCadastro = usuario.dataCadastro ? new Date(usuario.dataCadastro).toLocaleDateString('pt-BR') : 'Não informada';

    document.getElementById('infoUsuario').innerHTML = `
        <h5 style="margin: 0 0 10px 0; color: #0047B6;">${usuario.nome}</h5>
        <p style="margin: 0 0 5px 0;"><strong>Usuário:</strong> ${usuario.usuario}</p>
        <p style="margin: 0 0 5px 0;"><strong>Email:</strong> ${usuario.email}</p>
        <p style="margin: 0 0 5px 0;"><strong>Data de cadastro:</strong> ${dataCadastro}</p>
        <p style="margin: 0 0 5px 0;"><strong>Horário configurado:</strong> ${temHorario ? 'Sim' : 'Não'}</p>
        <p style="margin: 0 0 5px 0;"><strong>Tem planejamentos:</strong> ${temPlanejamentos ? 'Sim' : 'Não'}</p>
    `;

    document.getElementById('detalhesUsuario').style.display = 'block';
}

function resetarSenhaUsuario() {
    const usuarioBuscar = document.getElementById('usuarioBuscar').value.trim();
    if (!usuarioBuscar) {
        alert('Nenhum usuário selecionado');
        return;
    }
    
    const novaSenha = prompt('Digite a nova senha para o usuário (mínimo 6 caracteres):');
    if (!novaSenha || novaSenha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    const confirmar = confirm(`Deseja realmente resetar a senha do usuário "${usuarioBuscar}"?\n\nNova senha: ${novaSenha}`);
    if (confirmar) {
        localStorage.setItem('senha_' + usuarioBuscar, novaSenha);
        alert(`Senha resetada com sucesso para o usuário "${usuarioBuscar}"`);
    }
}

function removerUsuario() {
    const usuarioBuscar = document.getElementById('usuarioBuscar').value.trim();
    if (!usuarioBuscar) {
        alert('Nenhum usuário selecionado');
        return;
    }
    
    if (usuarioBuscar === 'coordenacao') {
        alert('Não é possível remover a conta da coordenação');
        return;
    }

    const confirmar = confirm(`ATENÇÃO: Isso removerá TODOS os dados do usuário "${usuarioBuscar}"\n\n- Conta do usuário\n- Horários configurados\n- Todos os planejamentos\n\nEsta ação não pode ser desfeita. Deseja continuar?`);
    if (!confirmar) return;

    localStorage.removeItem('usuario_' + usuarioBuscar);
    localStorage.removeItem('senha_' + usuarioBuscar);
    localStorage.removeItem('horarioProfessor_' + usuarioBuscar);
    localStorage.removeItem('planejamentos_' + usuarioBuscar);
    localStorage.removeItem('dataInicioLetivo_' + usuarioBuscar);

    alert(`Usuário "${usuarioBuscar}" removido com sucesso!`);
    document.getElementById('detalhesUsuario').style.display = 'none';
    carregarDadosAdmin();
}

function exportarTodosDados() {
    const dados = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) dados[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_planejador_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert('Backup completo exportado com sucesso!');
}

function limparDadosAntigos() {
    const confirmar = confirm('Isso removerá dados de usuários inativos. Continuar?');
    if (!confirmar) return;
    
    let removidos = 0;
    const agora = Date.now();
    const umMesAtras = agora - (30 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && key.startsWith('usuario_')) {
            try {
                const usuario = JSON.parse(localStorage.getItem(key));
                
                if (usuario.tipo === "superuser") continue;
                
                const temHorario = localStorage.getItem('horarioProfessor_' + usuario.usuario);
                const dataCadastro = usuario.dataCadastro ? new Date(usuario.dataCadastro).getTime() : 0;
                
                if (!temHorario && dataCadastro < umMesAtras) {
                    localStorage.removeItem(key);
                    localStorage.removeItem('senha_' + usuario.usuario);
                    localStorage.removeItem('horarioProfessor_' + usuario.usuario);
                    localStorage.removeItem('planejamentos_' + usuario.usuario);
                    localStorage.removeItem('dataInicioLetivo_' + usuario.usuario);
                    removidos++;
                }
            } catch(e) {}
        }
    }

    alert(`${removidos} usuários inativos foram removidos.`);
    carregarDadosAdmin();
}

function alterarSenhaSuperuser() {
    const senhaAtual = prompt('Digite a senha atual da coordenação:');
    if (senhaAtual !== SUPER_USUARIO.senha) {
        alert('Senha atual incorreta');
        return;
    }
    
    const novaSenha = prompt('Digite a nova senha (mínimo 8 caracteres):');
    if (!novaSenha || novaSenha.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres');
        return;
    }

    const confirmarSenha = prompt('Confirme a nova senha:');
    if (novaSenha !== confirmarSenha) {
        alert('As senhas não coincidem');
        return;
    }

    SUPER_USUARIO.senha = novaSenha;
    alert('Senha da coordenação alterada com sucesso!');
}

function fecharModalAdmin() {
    const modal = document.getElementById('modalAdmin');
    if (modal) modal.remove();
}

// ========== FUNÇÕES DE HORÁRIO ==========
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

// ========== FUNÇÕES DE PLANEJAMENTO ==========
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

// ========== INTEGRAÇÃO COM IA (GEMINI) ==========

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

// ========== FUNÇÕES DE SALVAMENTO ==========
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

// ========== EXPORTAÇÃO ==========
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

// ========== INICIALIZAÇÃO GLOBAL ==========
document.addEventListener('DOMContentLoaded', function() {
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