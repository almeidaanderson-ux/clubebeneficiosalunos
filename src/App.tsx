import React, { useEffect, useState } from 'react';
import { AdminTab, AdminView } from './components/admin/AdminView';
import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/common/Header';
import { BlockedAccess } from './components/student/BlockedAccess';
import { StudentBottomNav, StudentNavTab } from './components/student/StudentBottomNav';
import { StudentCard } from './components/student/StudentCard';
import { StudentHome } from './components/student/StudentHome';
import { StudentProfile } from './components/student/StudentProfile';
import { authService } from './services/authService';
import { studentService } from './services/studentService';
import { AdminUser, AuthSession, Student } from './types';
import { evaluateStudentValidity } from './utils/dateUtils';

export default function App() {
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Navegação do Membro
  const [studentTab, setStudentTab] = useState<StudentNavTab>('inicio');

  // Navegação de Admin: Foco direto em Benefícios e Carteirinha Digital
  const [adminTab, setAdminTab] = useState<AdminTab>('beneficios');

  // Inicialização da sessão
  useEffect(() => {
    const session = authService.getCurrentSession();
    setCurrentSession(session);
    setLoading(false);
  }, []);

  const handleLoginSuccess = (session: AuthSession) => {
    setCurrentSession(session);
    if (session.role === 'membro') {
      setStudentTab('inicio');
    } else {
      setAdminTab('beneficios');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Carregando Clube de Benefícios...
          </span>
        </div>
      </div>
    );
  }

  // 1. Tela de Login se não estiver autenticado
  if (!currentSession) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Área do Membro
  if (currentSession.role === 'membro') {
    const student = studentService.getById(currentSession.user.id) || (currentSession.user as Student);
    // A tela de bloqueio deixa de reagir a datas digitadas e passa a reagir ao estado recebido da API
    const accessState = studentService.getAccessState(student);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 selection:bg-blue-600 selection:text-white">
        <div>
          {/* Header Superior com perfil e abas desktop */}
          <Header
            session={currentSession}
            onLogout={handleLogout}
            activeStudentTab={studentTab}
            onStudentTabChange={setStudentTab}
          />

          {/* Conteúdo Principal */}
          <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-28 md:pb-12">
            {!accessState.isAuthorized ? (
              // Tela de Bloqueio Respeitosa reagindo ao estado da API
              <BlockedAccess student={student} onLogout={handleLogout} />
            ) : (
              // Abas do Membro Ativo
              <>
                {studentTab === 'inicio' && (
                  <StudentHome
                    student={student}
                    onNavigate={(tab) => setStudentTab(tab)}
                  />
                )}

                {studentTab === 'cartao' && <StudentCard student={student} />}

                {studentTab === 'perfil' && (
                  <StudentProfile student={student} onLogout={handleLogout} />
                )}
              </>
            )}
          </main>
        </div>

        {/* Barra de Navegação Inferior (Mobile - apenas para membros com acesso liberado na API) */}
        {accessState.isAuthorized && (
          <StudentBottomNav
            activeTab={studentTab}
            onChangeTab={setStudentTab}
            onTabChange={setStudentTab}
          />
        )}

        {/* Rodapé institucional */}
        <footer className="hidden sm:block border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong>Clube de Benefícios</strong> • {student.instituicao}
            </span>
            <span>Versão 1.0.0 (MVP com armazenamento local no navegador)</span>
          </div>
        </footer>
      </div>
    );
  }

  // 3. Área do Administrador
  const adminUser = currentSession.user as AdminUser;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900 selection:bg-blue-600 selection:text-white">
      <div>
        {/* Header Superior do Admin com abas */}
        <Header
          session={currentSession}
          onLogout={handleLogout}
          activeAdminTab={adminTab}
          onAdminTabChange={setAdminTab}
        />

        {/* Conteúdo Principal do Admin */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <AdminView
            user={adminUser}
            activeTab={adminTab}
            onNavigateTab={(tab) => setAdminTab(tab)}
          />
        </main>
      </div>

      {/* Rodapé institucional */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Painel Administrativo • <strong>Clube de Benefícios</strong>
          </span>
          <span>Sessão Segura • Clube de Benefícios</span>
        </div>
      </footer>
    </div>
  );
}
