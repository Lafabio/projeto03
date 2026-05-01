# Planejador de Aulas

Sistema web para planejamento de aulas com integração de IA.

## Estrutura do Projeto

```
/workspace
├── index.html              # Página principal
├── README.md               # Este arquivo
├── assets/                 # Recursos estáticos (imagens, etc.)
└── src/
    ├── css/
    │   └── style.css       # Estilos da aplicação
    └── js/
        ├── constants.js    # Constantes globais
        ├── state.js        # Estado da aplicação
        ├── auth.js         # Autenticação (login, cadastro, recuperação)
        ├── init.js         # Inicialização e eventos
        ├── apis.js         # Integração com APIs públicas
        ├── admin.js        # Painel administrativo (superusuário)
        ├── schedule.js     # Configuração de horário
        ├── planning.js     # Planejamento de aulas
        ├── ai.js           # Integração com IA (Gemini)
        ├── storage.js      # Salvamento e exportação
        └── main.js         # Ponto de entrada da aplicação
```

## Módulos

### constants.js
- Definição de constantes globais (disciplinas, turmas, horários)
- Configuração do superusuário

### state.js
- Gerenciamento do estado global da aplicação
- Referências aos elementos do DOM

### auth.js
- Funções de login, cadastro e recuperação de senha
- Controle de sessão do usuário

### init.js
- Inicialização da aplicação
- Setup de event listeners
- Atualização da interface

### apis.js
- Integração com Free Public APIs
- Sugestão de APIs para uso em aulas

### admin.js
- Painel administrativo para superusuário
- Gerenciamento de usuários
- Backup e limpeza de dados

### schedule.js
- Configuração do horário semanal do professor
- Renderização da grade horária

### planning.js
- Geração de semanas letivas
- Renderização da grade de aulas
- Gestão de planejamentos

### ai.js
- Integração com Google Gemini API
- Geração automática de planos de aula

### storage.js
- Salvamento no localStorage
- Exportação para DOC/Word

### main.js
- Ponto de entrada da aplicação
- Inicialização ao carregar o DOM

## Como Usar

1. Abra o arquivo `index.html` em um navegador
2. Faça login ou crie uma conta
3. Configure seu horário em "Meu Horário"
4. Defina a data de início do ano letivo
5. Clique em uma semana para planejar suas aulas
6. Use "🤖 Gerar com IA" para criar planos automaticamente

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge)
- API Key do Google Gemini (para funcionalidades de IA)

## Licença

Projeto educacional SESI
