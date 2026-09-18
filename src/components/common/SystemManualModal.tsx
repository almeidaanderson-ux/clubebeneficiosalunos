import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Lock,
  Printer,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  Tag,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

interface SystemManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemManualModal: React.FC<SystemManualModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('pdf-viewer');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    try {
      setDownloadStatus('loading');
      // Busca o binário PDF como Blob para garantir integridade total dos bytes
      const response = await fetch('/manual-do-sistema.pdf', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Manual_Clube_de_Beneficios.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    } catch (error) {
      console.warn('Erro ao baixar via Blob, redirecionando para link direto:', error);
      setDownloadStatus('error');
      // Fallback
      window.open('/manual-do-sistema.pdf', '_blank', 'noopener,noreferrer');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    }
  };

  const handleOpenInNewTab = () => {
    window.open('/manual-do-sistema.pdf', '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="system-manual-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Cabeçalho do Modal */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 flex items-center justify-between gap-4 shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  DOCUMENTO OFICIAL
                </span>
                <span className="text-xs text-blue-200 hidden sm:inline">Versão 1.0.0 (MVP) • 15 Páginas • 11 Telas</span>
              </div>
              <h2 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                Manual do Sistema & Especificação de Todas as 11 Telas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-pdf-tab"
              type="button"
              onClick={handleOpenInNewTab}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              title="Abrir arquivo PDF diretamente em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Aba</span>
            </button>

            <button
              id="btn-download-pdf-manual"
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloadStatus === 'loading'}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                downloadStatus === 'loading'
                  ? 'bg-amber-600'
                  : downloadStatus === 'success'
                  ? 'bg-emerald-700'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
              title="Baixar arquivo PDF completo (15 Páginas com todas as 11 telas)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">
                {downloadStatus === 'loading'
                  ? 'Baixando...'
                  : downloadStatus === 'success'
                  ? 'Concluído!'
                  : 'Baixar PDF'}
              </span>
            </button>

            <button
              id="btn-print-manual"
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all cursor-pointer"
              title="Imprimir ou Salvar via Navegador"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Imprimir</span>
            </button>

            <button
              id="btn-close-system-manual"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
              aria-label="Fechar Manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corpo com Navegação Lateral e Conteúdo */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Menu Lateral de Seções */}
          <div className="w-full md:w-64 bg-slate-50 p-3 sm:p-4 overflow-y-auto shrink-0 flex md:flex-col gap-1 border-b md:border-b-0 border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hidden md:block">
              Índice do Manual
            </span>

            <button
              onClick={() => setActiveSection('pdf-viewer')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                activeSection === 'pdf-viewer'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <FileText className="w-3.5 h-3.5 shrink-0" /> Documento PDF (15 Págs)
              </span>
              <ChevronRight className="w-3.5 h-3.5 hidden md:block opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('intro')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                activeSection === 'intro'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <BookOpen className="w-3.5 h-3.5 shrink-0" /> 1. Visão Geral
              </span>
              <ChevronRight className="w-3.5 h-3.5 hidden md:block opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('validity')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                activeSection === 'validity'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> 2. Regra de Validade
              </span>
              <ChevronRight className="w-3.5 h-3.5 hidden md:block opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('student-screens')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                activeSection === 'student-screens'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Smartphone className="w-3.5 h-3.5 shrink-0" /> 3. Telas do Membro
              </span>
              <ChevronRight className="w-3.5 h-3.5 hidden md:block opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('admin-screens')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                activeSection === 'admin-screens'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <Layers className="w-3.5 h-3.5 shrink-0" /> 4. Telas do Administrador
              </span>
              <ChevronRight className="w-3.5 h-3.5 hidden md:block opacity-60" />
            </button>

            <button
              onClick={() => setActiveSection('homologation')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                activeSection === 'homologation'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 5. Roteiro de Testes
              </span>
              <ChevronRight className="w-3.5 h-3.5 hidden md:block opacity-60" />
            </button>

            {/* Caixa de download rápido na barra lateral */}
            <div className="mt-auto pt-4 hidden md:block">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200/70 text-xs">
                <div className="font-bold text-blue-900 flex items-center gap-1.5 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" /> Arquivo PDF
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed mb-2.5">
                  Documento formatado com capa, sumário e páginas numeradas pronto para distribuição.
                </p>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar manual.pdf
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal da Seção Ativa */}
          <div className="flex-1 p-5 sm:p-8 overflow-y-auto space-y-6 text-slate-800">
            {/* SEÇÃO 0: VISUALIZADOR EMBUTIDO DO ARQUIVO PDF */}
            {activeSection === 'pdf-viewer' && (
              <div className="space-y-4 animate-in fade-in duration-150 flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/40">
                        PDF 100% VALIDADO • 15 PÁGINAS
                      </span>
                      <span className="text-xs text-slate-500">Todas as 11 Telas Ilustradas com Ficha Técnica • A4</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Visualizador do Manual Oficial
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Você pode visualizar o documento diretamente abaixo, abri-lo em tela cheia numa nova aba ou fazer o download no seu dispositivo.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir em Nova Aba</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadPDF}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar PDF</span>
                    </button>
                  </div>
                </div>

                {/* Objeto / Iframe para Renderizar o PDF diretamente */}
                <div className="w-full flex-1 min-h-[520px] rounded-2xl border border-slate-200 overflow-hidden bg-slate-900/5 relative shadow-inner">
                  <object
                    data="/manual-do-sistema.pdf#toolbar=1&navpanes=1"
                    type="application/pdf"
                    className="w-full h-full min-h-[520px]"
                  >
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-3 bg-white">
                      <FileText className="w-12 h-12 text-blue-600" />
                      <h4 className="text-base font-bold text-slate-900">
                        Visualização Direta do PDF
                      </h4>
                      <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                        Caso seu navegador restrinja visualizadores de PDF em janelas modais, utilize o botão abaixo para abrir o documento diretamente ou navegue pelas seções interativas pelo menu à esquerda.
                      </p>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleOpenInNewTab}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" /> Abrir PDF em Nova Aba
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadPDF}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
                        >
                          <Download className="w-4 h-4" /> Baixar Arquivo
                        </button>
                      </div>
                    </div>
                  </object>
                </div>
              </div>
            )}

            {/* SEÇÃO 1: INTRODUÇÃO & ARQUITETURA */}
            {activeSection === 'intro' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
                    <Database className="w-3.5 h-3.5" /> Arquitetura Local do MVP
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Visão Geral do Clube de Benefícios
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    O aplicativo foi projetado e implementado como uma plataforma web responsiva e autônoma,
                    permitindo o gerenciamento de benefícios e que os membros
                    consultem vantagens, acessem regras de desconto e apresentem sua carteirinha digital.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                      <Lock className="w-4 h-4 text-emerald-600" /> Armazenamento Seguro em Memória
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Todo o gerenciamento de dados é mantido de forma segura na memória da sessão ativa do navegador.
                      Não há persistência residual em cookies ou armazenamento local não criptografado, garantindo privacidade estrita aos usuários.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-600" /> Validação em Tempo Real
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      A data de vigência de cada membro é confrontada em tempo real com o calendário local. Membros regulares
                      navegam com liberdade; membros expirados ou com pendência financeira têm acesso bloqueado com instrução respeitosa.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Tabela de Estrutura de Dados do Sistema</h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                    <table className="w-full text-left divide-y divide-slate-200">
                      <thead className="bg-slate-100 text-slate-700 font-bold">
                        <tr>
                          <th className="p-3">Entidade</th>
                          <th className="p-3">Chave de Dados</th>
                          <th className="p-3">Principais Campos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        <tr>
                          <td className="p-3 font-semibold text-blue-700">Membros & Carteirinhas</td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">clube_beneficios_membros</td>
                          <td className="p-3 text-slate-600">Matrícula (única), Nome, Plano, Data Início, Data Validade, Status, Senha.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-blue-700">Benefícios</td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">clube_beneficios_beneficios</td>
                          <td className="p-3 text-slate-600">Categoria, Local/Unidade, Desconto %, Regras de uso, Como Utilizar, Data Início e Fim.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-blue-700">Admins</td>
                          <td className="p-3 font-mono text-slate-600 text-[11px]">clube_beneficios_admins</td>
                          <td className="p-3 text-slate-600">admin@clube.com.br, Senha administrativa, Perfil 'admin'.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 2: REGRA DE VALIDADE */}
            {activeSection === 'validity' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> Regra Central do Negócio
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Controle e Avaliação de Validade
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    A autorização de acesso é calculada através da função utilitária centralizada{' '}
                    <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono">evaluateStudentValidity(student)</code>.
                    Ela determina se o membro tem direito a consultar os benefícios e utilizar o cartão digital.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shrink-0">
                      Ativo
                    </span>
                    <div className="text-xs text-emerald-950 leading-relaxed">
                      <span className="font-bold block mb-0.5">Vigência Regular (&gt; 30 dias para expirar):</span>
                      Acesso completo a todas as áreas, busca de benefícios, detalhes e cartão digital com selo verde.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white shrink-0">
                      Atenção
                    </span>
                    <div className="text-xs text-amber-950 leading-relaxed">
                      <span className="font-bold block mb-0.5">Vencimento Próximo (1 a 30 dias restantes):</span>
                      Acesso liberado, porém com banner amigável de advertência no topo solicitando a renovação junto ao clube.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shrink-0">
                      Vencido
                    </span>
                    <div className="text-xs text-rose-950 leading-relaxed">
                      <span className="font-bold block mb-0.5">Vigência Expirada (&lt; data atual):</span>
                      Acesso bloqueado automaticamente. Exibe a tela de orientação e os contatos da central de atendimento.
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-700 text-white shrink-0">
                      Inadimplente / Bloqueado
                    </span>
                    <div className="text-xs text-rose-950 leading-relaxed">
                      <span className="font-bold block mb-0.5">Suspensão Cadastral Administrativa:</span>
                      Acesso negado de imediato, orientando o membro a procurar o setor financeiro ou coordenação.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 3: TELAS DO MEMBRO */}
            {activeSection === 'student-screens' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
                    <Smartphone className="w-3.5 h-3.5" /> Experiência do Membro
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Especificação de Todas as Telas do Membro
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    O aplicativo foi estruturado com conceito mobile-first: oferece uma barra de navegação inferior permanente
                    nos smartphones e abas organizadas no cabeçalho em tablets e desktops.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Tela 1: Login */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Tela de Login</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                        Pública
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Alternador entre "Sou Membro" e "Administração". Formulário com matrícula institucional e senha de acesso individual.
                    </p>
                  </div>

                  {/* Card Tela 2: Início */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Tela Inicial (Início)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        Membro
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Card de boas-vindas personalizado, indicador visual de validade com contagem de dias,
                      atalho rápido para a carteirinha e vitrine com benefícios em destaque.
                    </p>
                  </div>

                  {/* Card Tela 3: Benefícios */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Catálogo de Benefícios</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        Membro
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Campo de busca em tempo real e filtros por categoria. Cards com local/unidade,
                      tag de categoria, regras de uso e destaque visual do percentual de desconto.
                    </p>
                  </div>

                  {/* Card Tela 4: Modal Detalhes do Benefício */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Detalhes do Benefício</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        Modal
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Janela modal com categoria, local de atendimento, instruções detalhadas de como utilizar com a Carteirinha Digital e regras específicas de uso.
                    </p>
                  </div>

                  {/* Card Tela 5: Cartão Digital */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Meu Cartão Digital</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        Membro
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Carteirinha digital estilizada com foto, matrícula, plano, vigência e simulação de QR Code.
                      Conta com botão para modo Tela Cheia, facilitando a apresentação no caixa do estabelecimento conveniado.
                    </p>
                  </div>

                  {/* Card Tela 6: Bloqueio */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-rose-900">Acesso Restrito / Bloqueado</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 font-semibold">
                        Bloqueio
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Exibida automaticamente quando a vigência do membro vence ou status for restrito. Apresenta texto
                      cordial, resumo do cadastro e canais diretos de atendimento do clube para regularização.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 4: TELAS DO ADMINISTRADOR */}
            {activeSection === 'admin-screens' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 mb-2">
                    <Layers className="w-3.5 h-3.5" /> Gestão Geral
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Especificação de Todas as Telas do Administrador
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    O painel administrativo reúne ferramentas completas para cadastro, edição, exclusão e monitoramento
                    do ecossistema do clube de benefícios.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Cadastrar Benefício */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-indigo-600" /> 1. Cadastrar Benefício
                      </h4>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                        Gestão & Regras
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cadastro completo e edição de benefícios: título, categoria, local ou unidade de atendimento, percentual de desconto ou condição especial, obrigatoriedade de regras de uso, instruções de como utilizar, código de cupom e período de vigência.
                    </p>
                  </div>

                  {/* Carteirinha Digital */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" /> 2. Carteirinha Digital
                      </h4>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Validação & Emissão
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Visualização e emissão da Carteirinha Digital com foto, plano, matrícula, validação de status em tempo real, QR Code dinâmico de autenticidade e regras de vigência.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 5: ROTEIRO DE HOMOLOGAÇÃO */}
            {activeSection === 'homologation' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Homologação do Sistema
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                    Roteiro de Homologação em 5 Passos
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                    Siga este passo a passo para testar todos os cenários de negócio, regras de vigência e permissões do sistema:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-xs text-blue-700 mb-1">
                      1. Acesso Administrativo e Inicialização
                    </div>
                    <p className="text-xs text-slate-600">
                      Acesse a aba Administração com <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin@clube.com.br</code> e senha <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">admin123</code>.
                      O painel permite cadastrar, consultar e gerenciar novos benefícios e membros.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-xs text-emerald-700 mb-1">
                      2. Cadastro e Emissão de Benefício
                    </div>
                    <p className="text-xs text-slate-600">
                      Na área administrativa de Benefícios, cadastre parcerias definindo categoria, regras de utilização, percentual de desconto ou condição especial e período de vigência.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-xs text-indigo-700 mb-1">
                      3. Autenticação e Consulta de Membros
                    </div>
                    <p className="text-xs text-slate-600">
                      Os membros autenticam-se com sua matrícula e senha individual. Na área do membro, têm acesso à carteirinha digital e ao catálogo de benefícios disponíveis.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-xs text-amber-700 mb-1">
                      4. Controle de Vigência em Tempo Real
                    </div>
                    <p className="text-xs text-slate-600">
                      A vigência é verificada dinamicamente: membros com mais de 30 dias de validade exibem status regular; membros com 30 dias ou menos recebem aviso de renovação.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <div className="font-bold text-xs text-rose-700 mb-1">
                      5. Bloqueio de Acesso Expirado
                    </div>
                    <p className="text-xs text-slate-600">
                      Membros com validade vencida ou status bloqueado são automaticamente direcionados à tela de acesso restrito com orientações claras para regularização.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Documento técnico e funcional completo • Gerado com base no código-fonte do MVP
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" /> Baixar Arquivo PDF (.pdf)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
