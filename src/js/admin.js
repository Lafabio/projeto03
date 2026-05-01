// ==================== ADMINISTRAÇÃO (SUPERUSUÁRIO) ====================

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
