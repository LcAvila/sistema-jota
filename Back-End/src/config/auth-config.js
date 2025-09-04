// Configuração de autenticação
// Para reativar a autenticação, mude AUTH_ENABLED para true

const AUTH_CONFIG = {
  // Desabilita toda a autenticação quando false
  AUTH_ENABLED: false,
  
  // Configurações do usuário mock quando autenticação está desabilitada
  MOCK_USER: {
    id: 1,
    email: 'bypass@local',
    role: 'supervisor',
    storeId: 1
  },
  
  // Mensagem de aviso quando autenticação está desabilitada
  BYPASS_MESSAGE: '⚠️ AUTENTICAÇÃO DESABILITADA - Modo desenvolvimento ativo'
};

// Função para verificar se a autenticação está habilitada
function isAuthEnabled() {
  return AUTH_CONFIG.AUTH_ENABLED;
}

// Função para obter o usuário mock
function getMockUser() {
  return AUTH_CONFIG.MOCK_USER;
}

module.exports = {
  AUTH_CONFIG,
  isAuthEnabled,
  getMockUser
};
