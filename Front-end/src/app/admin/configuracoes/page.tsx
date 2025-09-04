"use client";
import React, { useEffect, useState } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/store/toast";
import { 
  Settings, 
  Palette, 
  Shield, 
  Users, 
  CreditCard, 
  Database, 
  Bell, 
  Globe, 
  Save, 
  RefreshCw, 
  Download, 
  Upload,
  Trash2,
  Plus,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Store,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  Package,
  TrendingUp
} from "lucide-react";

const STORAGE_KEY = "admin_config";

export default function ConfiguracoesPage() {
  const { success, error: showError, info } = useToast();
  
  // Estados principais
  const [primary, setPrimary] = useState("#0f172a");
  const [accent, setAccent] = useState("#22c55e");
  const [bypass, setBypass] = useState<boolean>(false);
  const [vendedores, setVendedores] = useState<string[]>(["Lucas", "Maria", "João"]);
  const [formas, setFormas] = useState<string[]>(["Dinheiro", "Pix", "Cartão"]);
  const [novoVend, setNovoVend] = useState("");
  const [novaForma, setNovaForma] = useState("");
  
  // Novos estados para funcionalidades expandidas
  const [empresa, setEmpresa] = useState({
    nome: "JOTA Distribuidora",
    cnpj: "12.345.678/0001-90",
    endereco: "Tv. Marco Schinaider, 40 - Jacutinga, Mesquita - RJ",
    telefone: "(21) 99999-9999",
    email: "contato@jotadistribuidora.com.br",
    site: "www.jotadistribuidora.com.br"
  });
  
  const [notificacoes, setNotificacoes] = useState({
    emailVendas: true,
    emailEstoque: true,
    emailClientes: false,
    pushNotificacoes: true,
    relatoriosAutomaticos: true
  });
  
  const [sistema, setSistema] = useState({
    timezone: "America/Sao_Paulo",
    moeda: "BRL",
    idioma: "pt-BR",
    formatoData: "DD/MM/YYYY",
    backupAutomatico: true,
    logsRetencao: 90
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("empresa");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const cfg = JSON.parse(saved);
        if (cfg.primary) setPrimary(cfg.primary);
        if (cfg.accent) setAccent(cfg.accent);
        if (typeof cfg.bypass === 'boolean') setBypass(cfg.bypass);
        if (Array.isArray(cfg.vendedores)) setVendedores(cfg.vendedores);
        if (Array.isArray(cfg.formas)) setFormas(cfg.formas);
        if (cfg.empresa) setEmpresa(cfg.empresa);
        if (cfg.notificacoes) setNotificacoes(cfg.notificacoes);
        if (cfg.sistema) setSistema(cfg.sistema);
      } catch {}
    }
  }, []);

  useEffect(() => {
    const cfg = { primary, accent, bypass, vendedores, formas, empresa, notificacoes, sistema };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    // aplica cores na raiz do documento para refletir no app
    if (typeof document !== 'undefined') {
      const r = document.documentElement;
      r.style.setProperty('--primary', primary);
      r.style.setProperty('--accent', accent);
    }
  }, [primary, accent, bypass, vendedores, formas, empresa, notificacoes, sistema]);

  // Funções para vendedores
  function addVendedor() {
    const v = novoVend.trim();
    if (!v) { showError("Informe um nome de vendedor"); return; }
    if (vendedores.includes(v)) { info("Vendedor já cadastrado"); return; }
    setVendedores((arr) => [...arr, v]);
    setNovoVend("");
    success("Vendedor adicionado");
  }
  
  function rmVendedor(v: string) {
    setVendedores((arr) => arr.filter((x) => x !== v));
    info(`Vendedor removido: ${v}`);
  }

  // Funções para formas de pagamento
  function addForma() {
    const f = novaForma.trim();
    if (!f) { showError("Informe uma forma de pagamento"); return; }
    if (formas.includes(f)) { info("Forma de pagamento já existe"); return; }
    setFormas((arr) => [...arr, f]);
    setNovaForma("");
    success("Forma de pagamento adicionada");
  }
  
  function rmForma(f: string) {
    setFormas((arr) => arr.filter((x) => x !== f));
    info(`Forma removida: ${f}`);
  }

  // Funções para backup e exportação
  async function exportarConfiguracoes() {
    setLoading(true);
    try {
      const config = { primary, accent, bypass, vendedores, formas, empresa, notificacoes, sistema };
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `configuracoes-jota-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      success("Configurações exportadas com sucesso!");
    } catch (e) {
      showError("Erro ao exportar configurações");
    } finally {
      setLoading(false);
    }
  }

  async function importarConfiguracoes(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      if (config.primary) setPrimary(config.primary);
      if (config.accent) setAccent(config.accent);
      if (typeof config.bypass === 'boolean') setBypass(config.bypass);
      if (Array.isArray(config.vendedores)) setVendedores(config.vendedores);
      if (Array.isArray(config.formas)) setFormas(config.formas);
      if (config.empresa) setEmpresa(config.empresa);
      if (config.notificacoes) setNotificacoes(config.notificacoes);
      if (config.sistema) setSistema(config.sistema);
      
      success("Configurações importadas com sucesso!");
    } catch (e) {
      showError("Erro ao importar configurações. Verifique o arquivo.");
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  }

  function resetarConfiguracoes() {
    if (confirm("Tem certeza que deseja resetar todas as configurações para os valores padrão?")) {
      setPrimary("#0f172a");
      setAccent("#22c55e");
      setBypass(false);
      setVendedores(["Lucas", "Maria", "João"]);
      setFormas(["Dinheiro", "Pix", "Cartão"]);
      setEmpresa({
        nome: "JOTA Distribuidora",
        cnpj: "12.345.678/0001-90",
        endereco: "Tv. Marco Schinaider, 40 - Jacutinga, Mesquita - RJ",
        telefone: "(21) 99999-9999",
        email: "contato@jotadistribuidora.com.br",
        site: "www.jotadistribuidora.com.br"
      });
      setNotificacoes({
        emailVendas: true,
        emailEstoque: true,
        emailClientes: false,
        pushNotificacoes: true,
        relatoriosAutomaticos: true
      });
      setSistema({
        timezone: "America/Sao_Paulo",
        moeda: "BRL",
        idioma: "pt-BR",
        formatoData: "DD/MM/YYYY",
        backupAutomatico: true,
        logsRetencao: 90
      });
      success("Configurações resetadas para os valores padrão!");
    }
  }

  const tabs = [
    { id: "empresa", label: "Empresa", icon: Store },
    { id: "tema", label: "Tema", icon: Palette },
    { id: "vendedores", label: "Vendedores", icon: Users },
    { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "sistema", label: "Sistema", icon: Settings },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "backup", label: "Backup", icon: Database }
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-6">
      {/* Header */}
      <div className="mb-8">
        <Breadcrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Configurações" }]} />
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] flex items-center gap-3">
              <Settings className="w-8 h-8 text-[var(--brand)]" />
              Configurações do Sistema
            </h1>
            <p className="text-[var(--foreground)] opacity-70 mt-2">
              Gerencie todas as configurações da sua empresa
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={exportarConfiguracoes}
              disabled={loading}
              className="px-4 py-2 bg-[var(--chart-green)] text-white rounded-lg font-medium hover:bg-[var(--chart-green-dark)] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <label className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand)] hover:bg-opacity-80 transition-colors flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Importar
              <input
                type="file"
                accept=".json"
                onChange={importarConfiguracoes}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-card p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)] hover:bg-opacity-80'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="admin-card p-6">
        {activeTab === "empresa" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Store className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Informações da Empresa</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  value={empresa.nome}
                  onChange={(e) => setEmpresa(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">CNPJ</label>
                <input
                  type="text"
                  value={empresa.cnpj}
                  onChange={(e) => setEmpresa(prev => ({ ...prev, cnpj: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Endereço
                </label>
                <input
                  type="text"
                  value={empresa.endereco}
                  onChange={(e) => setEmpresa(prev => ({ ...prev, endereco: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone
                </label>
                <input
                  type="text"
                  value={empresa.telefone}
                  onChange={(e) => setEmpresa(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail
                </label>
                <input
                  type="email"
                  value={empresa.email}
                  onChange={(e) => setEmpresa(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Website
                </label>
                <input
                  type="text"
                  value={empresa.site}
                  onChange={(e) => setEmpresa(prev => ({ ...prev, site: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "tema" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Personalização do Tema</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Cor Primária</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] font-mono"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Cor de Destaque</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="w-12 h-12 rounded-lg border border-[var(--border)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accent}
                    onChange={(e) => setAccent(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)] font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--muted)] rounded-lg">
              <h3 className="font-medium text-[var(--foreground)] mb-2">Preview do Tema</h3>
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: primary }}></div>
                <div className="w-16 h-16 rounded-lg" style={{ backgroundColor: accent }}></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "vendedores" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Gerenciar Vendedores</h2>
            </div>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Adicionar Vendedor</label>
                <input
                  type="text"
                  value={novoVend}
                  onChange={(e) => setNovoVend(e.target.value)}
                  placeholder="Nome do vendedor"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <button
                onClick={addVendedor}
                className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand)] hover:bg-opacity-80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-3">Vendedores Cadastrados ({vendedores.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {vendedores.map((vendedor) => (
                  <div
                    key={vendedor}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className="font-medium text-[var(--foreground)]">{vendedor}</span>
                    <button
                      onClick={() => rmVendedor(vendedor)}
                      className="p-1 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "pagamentos" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Formas de Pagamento</h2>
            </div>
            
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Adicionar Forma de Pagamento</label>
                <input
                  type="text"
                  value={novaForma}
                  onChange={(e) => setNovaForma(e.target.value)}
                  placeholder="Ex: PIX, Cartão de Crédito, etc."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <button
                onClick={addForma}
                className="px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand)] hover:bg-opacity-80 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>
            
            <div>
              <h3 className="font-medium text-[var(--foreground)] mb-3">Formas de Pagamento Disponíveis ({formas.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {formas.map((forma) => (
                  <div
                    key={forma}
                    className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className="font-medium text-[var(--foreground)] flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {forma}
                    </span>
                    <button
                      onClick={() => rmForma(forma)}
                      className="p-1 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "notificacoes" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Configurações de Notificações</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">E-mail de Vendas</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Receber notificações por e-mail sobre novas vendas</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificacoes.emailVendas}
                  onChange={(e) => setNotificacoes(prev => ({ ...prev, emailVendas: e.target.checked }))}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">E-mail de Estoque</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Receber alertas quando produtos estiverem com estoque baixo</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificacoes.emailEstoque}
                  onChange={(e) => setNotificacoes(prev => ({ ...prev, emailEstoque: e.target.checked }))}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">E-mail de Clientes</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Receber notificações sobre atividades de clientes</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificacoes.emailClientes}
                  onChange={(e) => setNotificacoes(prev => ({ ...prev, emailClientes: e.target.checked }))}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">Notificações Push</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Receber notificações no navegador</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificacoes.pushNotificacoes}
                  onChange={(e) => setNotificacoes(prev => ({ ...prev, pushNotificacoes: e.target.checked }))}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">Relatórios Automáticos</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Enviar relatórios semanais por e-mail</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificacoes.relatoriosAutomaticos}
                  onChange={(e) => setNotificacoes(prev => ({ ...prev, relatoriosAutomaticos: e.target.checked }))}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "sistema" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Configurações do Sistema</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Fuso Horário
                </label>
                <select
                  value={sistema.timezone}
                  onChange={(e) => setSistema(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                >
                  <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                  <option value="America/New_York">Nova York (GMT-5)</option>
                  <option value="Europe/London">Londres (GMT+0)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Moeda
                </label>
                <select
                  value={sistema.moeda}
                  onChange={(e) => setSistema(prev => ({ ...prev, moeda: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Idioma</label>
                <select
                  value={sistema.idioma}
                  onChange={(e) => setSistema(prev => ({ ...prev, idioma: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Formato de Data</label>
                <select
                  value={sistema.formatoData}
                  onChange={(e) => setSistema(prev => ({ ...prev, formatoData: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Retenção de Logs (dias)</label>
                <input
                  type="number"
                  value={sistema.logsRetencao}
                  onChange={(e) => setSistema(prev => ({ ...prev, logsRetencao: parseInt(e.target.value) }))}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">Backup Automático</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Fazer backup automático diário</p>
                </div>
                <input
                  type="checkbox"
                  checked={sistema.backupAutomatico}
                  onChange={(e) => setSistema(prev => ({ ...prev, backupAutomatico: e.target.checked }))}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "seguranca" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Configurações de Segurança</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <div>
                  <h3 className="font-medium text-[var(--foreground)]">Bypass de Autenticação</h3>
                  <p className="text-sm text-[var(--foreground)] opacity-70">Ignorar login no frontend (apenas para desenvolvimento)</p>
                </div>
                <input
                  type="checkbox"
                  checked={bypass}
                  onChange={(e) => setBypass(e.target.checked)}
                  className="w-5 h-5 text-[var(--brand)] rounded focus:ring-[var(--brand)]"
                />
              </div>
              
              <div className="p-4 bg-[var(--warning)]/10 border border-[var(--warning)]/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />
                  <h3 className="font-medium text-[var(--warning)]">Aviso de Segurança</h3>
                </div>
                <p className="text-sm text-[var(--foreground)] opacity-70">
                  Em produção, mantenha o bypass desativado e use autenticação adequada com SSO ou credenciais seguras.
                </p>
              </div>
              
              <div className="p-4 bg-[var(--muted)] rounded-lg">
                <h3 className="font-medium text-[var(--foreground)] mb-2">Limpar Dados Locais</h3>
                <p className="text-sm text-[var(--foreground)] opacity-70 mb-3">
                  Use com cautela: irá exigir novo login e resetará dados locais (vendas, filtros, produtos).
                </p>
                <button
                  onClick={() => { localStorage.clear(); success("Storage limpo com sucesso"); }}
                  className="px-4 py-2 bg-[var(--destructive)] text-white rounded-lg font-medium hover:bg-[var(--destructive)] hover:bg-opacity-80 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar localStorage
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "backup" && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-[var(--brand)]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">Backup e Restauração</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <h3 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5 text-[var(--chart-green)]" />
                  Exportar Configurações
                </h3>
                <p className="text-sm text-[var(--foreground)] opacity-70 mb-4">
                  Baixe um arquivo JSON com todas as configurações do sistema.
                </p>
                <button
                  onClick={exportarConfiguracoes}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-[var(--chart-green)] text-white rounded-lg font-medium hover:bg-[var(--chart-green-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
              
              <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)]">
                <h3 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[var(--brand)]" />
                  Importar Configurações
                </h3>
                <p className="text-sm text-[var(--foreground)] opacity-70 mb-4">
                  Carregue um arquivo JSON para restaurar configurações.
                </p>
                <label className="w-full px-4 py-2 bg-[var(--brand)] text-white rounded-lg font-medium hover:bg-[var(--brand)] hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Importar
                  <input
                    type="file"
                    accept=".json"
                    onChange={importarConfiguracoes}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)]">
              <h3 className="font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[var(--warning)]" />
                Resetar Configurações
              </h3>
              <p className="text-sm text-[var(--foreground)] opacity-70 mb-4">
                Restaura todas as configurações para os valores padrão. Esta ação não pode ser desfeita.
              </p>
              <button
                onClick={resetarConfiguracoes}
                className="px-4 py-2 bg-[var(--warning)] text-white rounded-lg font-medium hover:bg-[var(--warning)] hover:bg-opacity-80 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Resetar para Padrão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
