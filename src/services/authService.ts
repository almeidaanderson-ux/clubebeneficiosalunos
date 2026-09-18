import { AdminUser, AuthSession, Student } from '../types';
import { STORAGE_KEYS, storageService } from './storageService';
import { studentService } from './studentService';

export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-1',
    nome: 'Administração Geral do Clube',
    email: 'admin@clube.com.br',
    senha: 'admin123',
    perfil: 'admin',
    status: 'Ativo',
  },
];

export const authService = {
  loginStudent(matricula: string, senha: string): { success: boolean; error?: string; session?: AuthSession } {
    if (!matricula?.trim() || !senha?.trim()) {
      return { success: false, error: 'Por favor, preencha sua matrícula e senha de acesso.' };
    }

    const student = studentService.getByMatricula(matricula);

    if (!student) {
      return { success: false, error: 'Matrícula não localizada. Verifique os dígitos e tente novamente.' };
    }

    if (student.senha !== senha.trim()) {
      return { success: false, error: 'Senha incorreta para esta matrícula.' };
    }

    const session: AuthSession = {
      role: 'membro',
      user: student,
      tokenTimestamp: Date.now(),
    };

    storageService.setItem<AuthSession>(STORAGE_KEYS.SESSION, session);
    return { success: true, session };
  },

  loginAdmin(email: string, senha: string): { success: boolean; error?: string; session?: AuthSession } {
    if (!email?.trim() || !senha?.trim()) {
      return { success: false, error: 'Por favor, informe seu e-mail e senha de administrador.' };
    }

    const emailClean = email.trim().toLowerCase();
    const senhaClean = senha.trim();

    let admins = storageService.getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, []);

    if (admins.length === 0) {
      admins = [...INITIAL_ADMINS];
      storageService.setItem<AdminUser[]>(STORAGE_KEYS.ADMINS, admins);
    }

    let admin = admins.find(
      (a) => a.email.trim().toLowerCase() === emailClean
    );

    if (!admin && emailClean === 'admin@clube.com.br') {
      admin = {
        id: 'admin-1',
        nome: 'Administração Geral do Clube',
        email: 'admin@clube.com.br',
        senha: 'admin123',
        perfil: 'admin',
        status: 'Ativo',
      };
      admins.push(admin);
      storageService.setItem<AdminUser[]>(STORAGE_KEYS.ADMINS, admins);
    }

    if (!admin) {
      return { success: false, error: 'E-mail administrativo não cadastrado.' };
    }

    const isPasswordValid = admin.senha === senhaClean;

    if (!isPasswordValid) {
      return { success: false, error: 'Senha de administrador incorreta.' };
    }

    if (admin.status !== 'Ativo') {
      return { success: false, error: 'Este usuário administrativo está inativo no momento.' };
    }

    const session: AuthSession = {
      role: 'admin',
      user: admin,
      tokenTimestamp: Date.now(),
    };

    storageService.setItem<AuthSession>(STORAGE_KEYS.SESSION, session);
    return { success: true, session };
  },

  getCurrentSession(): AuthSession | null {
    const session = storageService.getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
    if (!session || !session.user) return null;

    // Normalizar role caso não seja admin
    if ((session.role as string) !== 'admin') {
      session.role = 'membro';
      storageService.setItem<AuthSession>(STORAGE_KEYS.SESSION, session);
    }

    // Sincronizar dados mais recentes do membro ou admin
    if (session.role === 'membro') {
      const currentStudent = studentService.getById((session.user as Student).id);
      if (!currentStudent) {
        this.logout();
        return null;
      }
      session.user = currentStudent;
    } else if (session.role === 'admin') {
      const admins = storageService.getItem<AdminUser[]>(STORAGE_KEYS.ADMINS, []);
      const currentAdmin = admins.find((a) => a.id === (session.user as AdminUser).id);
      if (!currentAdmin || currentAdmin.status !== 'Ativo') {
        this.logout();
        return null;
      }
      session.user = currentAdmin;
    }

    return session;
  },

  logout(): void {
    storageService.removeItem(STORAGE_KEYS.SESSION);
  },
};
