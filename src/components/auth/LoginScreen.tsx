import React, { useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  GraduationCap,
  KeyRound,
  Lock,
  Mail,
  Sparkles,
  User,
  FileText,
  Download,
  ExternalLink,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { AuthSession } from '../../types';
import { SystemManualModal } from '../common/SystemManualModal';

interface LoginScreenProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'membro' | 'admin'>('membro');
  const [matricula, setMatricula] = useState('');
  const [senhaMembro, setSenhaMembro] = useState('');
  const [emailAdmin, setEmailAdmin] = useState('');
  const [senhaAdmin, setSenhaAdmin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await authService.loginStudent(matricula, senhaMembro);
      setIsLoading(false);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMessage(result.error || 'Não foi possível realizar o login.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Erro ao autenticar. Verifique sua conexão e tente novamente.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authService.loginAdmin(emailAdmin, senhaAdmin);
      setIsLoading(false);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMessage(result.error || 'Não foi possível realizar o login.');
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-blue-50/40 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logotipo e Apresentação */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-blue-100">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Clube de Benefícios
          </h1>
          <p className="mt-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Benefícios exclusivos para membros
          </p>
          <p className="mt-2 text-xs text-slate-500 max-w-xs">
            Descontos especiais em alimentação, esportes, tecnologia, farmácias e muito mais.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-8 border border-slate-200/70">
          {/* Seletor de Perfil (Membro vs Administrador) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200/60">
            <button
              id="login-tab-membro"
              type="button"
              onClick={() => {
                setActiveTab('membro');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'membro'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Sou Membro
            </button>
            <button
              id="login-tab-admin"
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
              }}
              className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Administração
            </button>
          </div>

          {/* Feedback de Erro */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'membro' ? (
            /* Formulário do Membro */
            <form id="form-login-membro" onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-matricula" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Número de Matrícula
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    id="login-matricula"
                    type="text"
                    required
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value)}
                    placeholder="Sua matrícula institucional"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-senha-membro" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha ou PIN
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-senha-membro"
                    type="password"
                    required
                    value={senhaMembro}
                    onChange={(e) => setSenhaMembro(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                id="btn-entrar-membro"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Verificando dados...' : 'Entrar no Clube de Benefícios'}
              </button>
            </form>
          ) : (
            /* Formulário do Administrador */
            <form id="form-login-admin" onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email-admin" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-mail Institucional
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-admin"
                    type="email"
                    required
                    value={emailAdmin}
                    onChange={(e) => setEmailAdmin(e.target.value)}
                    placeholder="admin@clube.com.br"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-senha-admin" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Senha Administrativa
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    id="login-senha-admin"
                    type="password"
                    required
                    value={senhaAdmin}
                    onChange={(e) => setSenhaAdmin(e.target.value)}
                    placeholder="Sua senha de administrador"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                id="btn-entrar-admin"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Acessando painel...' : 'Entrar como Administrador'}
              </button>
            </form>
          )}

          {/* Botão de Destaque para o Manual do Sistema em PDF */}
          <div className="pt-5 mt-6 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManualModalOpen(true)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-2 border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
              title="Abrir o Manual do Sistema interativo com Visualizador de PDF e Telas"
            >
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Manual do Sistema & Telas (PDF)</span>
            </button>

            <a
              href="/manual-do-sistema.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200"
              title="Abrir PDF em nova aba do navegador"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href="/manual-do-sistema.pdf"
              download="Manual_Clube_de_Beneficios.pdf"
              className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-emerald-200"
              title="Baixar arquivo PDF"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Modal Interativo com Especificação das Telas e PDF */}
        <SystemManualModal
          isOpen={isManualModalOpen}
          onClose={() => setIsManualModalOpen(false)}
        />
      </div>
    </div>
  );
};
