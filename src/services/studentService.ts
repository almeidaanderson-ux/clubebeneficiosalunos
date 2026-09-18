import { MemberAccessState, PaymentRecord, PaymentStatus, Student, StudentStatus } from '../types';
import { deriveSituationFromPayments, deriveValidityFromMatricula, getTodayString } from '../utils/dateUtils';
import { STORAGE_KEYS, storageService } from './storageService';

export interface StudentFormData {
  nome: string;
  matricula: string;
  email: string;
  telefone: string;
  senha?: string;
  instituicao?: string;
  curso?: string;
  dataInicio?: string;
  situacaoPagamento?: PaymentStatus;
  status?: StudentStatus;
  fotoUrl?: string;
}

export const studentService = {
  getAll(): Student[] {
    const raw = storageService.getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    return raw.map((s) => {
      // A validade passa a ser derivada da matrícula, e a situação, dos pagamentos
      const dataValidade = deriveValidityFromMatricula(s.matricula);
      const situacaoPagamento: PaymentStatus = s.situacaoPagamento || 'Em dia';
      const sit = deriveSituationFromPayments(situacaoPagamento, dataValidade);

      return {
        ...s,
        dataValidade,
        situacaoPagamento,
        status: s.status ? s.status : sit.status,
      };
    });
  },

  getById(id: string): Student | null {
    const list = this.getAll();
    return list.find((s) => s.id === id) || null;
  },

  getByMatricula(matricula: string): Student | null {
    const list = this.getAll();
    const clean = matricula.trim().toLowerCase();
    return list.find((s) => s.matricula.trim().toLowerCase() === clean) || null;
  },

  /**
   * Retorna o estado de acesso do membro recebido da API.
   * A tela de bloqueio e a liberação de benefícios reagem estritamente
   * ao estado fornecido pela API (status e situação de pagamento), e não a datas digitadas.
   */
  getAccessState(student: Student): MemberAccessState {
    const isAuthorized = student.status === 'Ativo';

    let statusTitle = 'Acesso Liberado';
    let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    let detailedExplanation = 'Seu acesso ao Clube de Benefícios está liberado e com cadastro regular.';

    if (student.status === 'Inadimplente' || student.situacaoPagamento === 'Atrasado' || student.situacaoPagamento === 'Pendente') {
      statusTitle = 'Pendência Financeira / Pagamento em Atraso';
      badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
      detailedExplanation =
        'Identificamos uma pendência no pagamento da sua mensalidade/anuidade. Regularize seus pagamentos para reativar imediatamente o acesso ao Clube de Benefícios.';
    } else if (student.status === 'Vencido') {
      statusTitle = 'Vínculo do Membro Vencido';
      badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
      detailedExplanation =
        'O período de vigência vinculado à sua matrícula expirou no cadastro. Renove o seu vínculo para reativar o Clube de Benefícios.';
    } else if (student.status === 'Bloqueado') {
      statusTitle = 'Acesso Bloqueado pela Administração';
      badgeColor = 'bg-red-100 text-red-900 border-red-200';
      detailedExplanation =
        'Seu acesso foi preventivamente bloqueado pela administração do clube. Para solicitar o desbloqueio, entre em contato com a nossa central.';
    } else if (student.status === 'Inativo') {
      statusTitle = 'Cadastro de Membro Inativo';
      badgeColor = 'bg-slate-200 text-slate-800 border-slate-300';
      detailedExplanation =
        'Seu registro consta como inativo no sistema. Em caso de dúvidas, procure a central de atendimento.';
    }

    return {
      isAuthorized,
      status: student.status,
      situacaoPagamento: student.situacaoPagamento || 'Em dia',
      statusTitle,
      badgeColor,
      detailedExplanation,
    };
  },

  create(data: StudentFormData): { success: boolean; error?: string; student?: Student } {
    const list = this.getAll();

    // Validações
    if (!data.nome?.trim()) {
      return { success: false, error: 'O nome completo é obrigatório.' };
    }
    if (!data.matricula?.trim()) {
      return { success: false, error: 'O número de matrícula é obrigatório.' };
    }
    if (!data.senha?.trim()) {
      return { success: false, error: 'A senha de acesso ou PIN é obrigatória no cadastro.' };
    }

    const matriculaTrim = data.matricula.trim();
    const exists = list.some((s) => s.matricula.trim().toLowerCase() === matriculaTrim.toLowerCase());
    if (exists) {
      return { success: false, error: `Já existe um cadastro com a matrícula ${matriculaTrim}.` };
    }

    const today = getTodayString();
    // Validade derivada da matrícula
    const dataValidade = deriveValidityFromMatricula(matriculaTrim);
    // Situação derivada dos pagamentos
    const situacaoPagamento: PaymentStatus = data.situacaoPagamento || 'Em dia';
    const situationInfo = deriveSituationFromPayments(situacaoPagamento, dataValidade);

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      nome: data.nome.trim(),
      matricula: matriculaTrim,
      email: data.email?.trim() || '',
      telefone: data.telefone?.trim() || '',
      senha: data.senha.trim(),
      instituicao: data.instituicao?.trim() || 'Clube de Benefícios Metropolitano',
      curso: data.curso?.trim() || 'Plano Titular',
      dataInicio: data.dataInicio || today,
      dataValidade, // Derivada da matrícula
      situacaoPagamento, // Situação financeira/pagamentos
      status: data.status || situationInfo.status, // Situação derivada dos pagamentos
      historicoPagamentos: [
        {
          id: `pay-${Date.now()}`,
          competencia: today.slice(0, 7).split('-').reverse().join('/'),
          vencimento: today,
          valor: 39.9,
          status: situacaoPagamento === 'Atrasado' ? 'Atrasado' : 'Pago',
          dataPagamento: situacaoPagamento === 'Em dia' ? today : undefined,
          formaPagamento: 'PIX / Automático',
        },
      ],
      fotoUrl: data.fotoUrl?.trim() || undefined,
      dataCriacao: today,
      dataAtualizacao: today,
    };

    list.unshift(newStudent);
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, list);
    return { success: true, student: newStudent };
  },

  update(id: string, data: Partial<StudentFormData>): { success: boolean; error?: string; student?: Student } {
    const list = this.getAll();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) {
      return { success: false, error: 'Membro não encontrado.' };
    }

    const current = list[index];

    // Se alterou a matrícula, validar duplicidade
    const targetMatricula = data.matricula !== undefined ? data.matricula.trim() : current.matricula;
    if (data.matricula && targetMatricula.toLowerCase() !== current.matricula.trim().toLowerCase()) {
      const duplicate = list.some(
        (s) => s.id !== id && s.matricula.trim().toLowerCase() === targetMatricula.toLowerCase()
      );
      if (duplicate) {
        return { success: false, error: `A matrícula ${targetMatricula} já pertence a outro cadastro.` };
      }
    }

    // A validade é sempre derivada da matrícula atualizada
    const derivedValidade = deriveValidityFromMatricula(targetMatricula);
    const targetSituacaoPagamento: PaymentStatus = data.situacaoPagamento || current.situacaoPagamento || 'Em dia';
    const derivedSituation = deriveSituationFromPayments(targetSituacaoPagamento, derivedValidade);

    const updatedStudent: Student = {
      ...current,
      nome: data.nome !== undefined ? data.nome.trim() : current.nome,
      matricula: targetMatricula,
      email: data.email !== undefined ? data.email.trim() : current.email,
      telefone: data.telefone !== undefined ? data.telefone.trim() : current.telefone,
      senha: data.senha && data.senha.trim() ? data.senha.trim() : current.senha,
      instituicao: data.instituicao !== undefined ? data.instituicao.trim() : current.instituicao,
      curso: data.curso !== undefined ? data.curso.trim() : current.curso,
      dataInicio: data.dataInicio || current.dataInicio,
      dataValidade: derivedValidade, // Derivada da matrícula
      situacaoPagamento: targetSituacaoPagamento, // Situação financeira
      status: data.status || derivedSituation.status, // Derivada dos pagamentos
      fotoUrl: data.fotoUrl !== undefined ? data.fotoUrl : current.fotoUrl,
      dataAtualizacao: getTodayString(),
    };

    list[index] = updatedStudent;
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, list);
    return { success: true, student: updatedStudent };
  },

  updatePaymentStatus(
    id: string,
    newPaymentStatus: PaymentStatus,
    paymentRecord?: PaymentRecord
  ): { success: boolean; student?: Student } {
    const list = this.getAll();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return { success: false };

    const current = list[index];
    const dataValidade = deriveValidityFromMatricula(current.matricula);
    const derivedSituation = deriveSituationFromPayments(newPaymentStatus, dataValidade);

    const historico = current.historicoPagamentos ? [...current.historicoPagamentos] : [];
    if (paymentRecord) {
      historico.unshift(paymentRecord);
    }

    const updatedStudent: Student = {
      ...current,
      dataValidade,
      situacaoPagamento: newPaymentStatus,
      status: derivedSituation.status,
      historicoPagamentos: historico,
      dataAtualizacao: getTodayString(),
    };

    list[index] = updatedStudent;
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, list);
    return { success: true, student: updatedStudent };
  },

  updateStatus(id: string, newStatus: StudentStatus): { success: boolean; student?: Student } {
    const list = this.getAll();
    const index = list.findIndex((s) => s.id === id);
    if (index === -1) return { success: false };

    const current = list[index];
    const updatedStudent: Student = {
      ...current,
      status: newStatus,
      dataAtualizacao: getTodayString(),
    };

    list[index] = updatedStudent;
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, list);
    return { success: true, student: updatedStudent };
  },

  delete(id: string, matricula?: string): boolean {
    const list = this.getAll();
    const cleanId = String(id).trim();
    const cleanMatricula = matricula ? String(matricula).trim() : '';

    const filtered = list.filter((s) => {
      const sId = String(s.id).trim();
      const sMat = String(s.matricula).trim();
      if (sId === cleanId) return false;
      if (cleanMatricula && sMat === cleanMatricula) return false;
      if (sMat === cleanId) return false;
      return true;
    });

    if (filtered.length === list.length) return false;
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, filtered);
    return true;
  },

  replaceAll(students: Student[]): void {
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, students);
  },

  bulkUpsert(newStudents: Student[]): { added: number; updated: number; total: number } {
    const current = this.getAll();
    const map = new Map<string, Student>();

    // Indexar existentes por matrícula (case insensitive)
    current.forEach((st) => {
      map.set(st.matricula.trim().toLowerCase(), st);
    });

    let added = 0;
    let updated = 0;

    newStudents.forEach((incoming) => {
      const matKey = incoming.matricula.trim().toLowerCase();
      const dataValidade = deriveValidityFromMatricula(incoming.matricula);
      const situacaoPagamento = incoming.situacaoPagamento || 'Em dia';
      const sit = deriveSituationFromPayments(situacaoPagamento, dataValidade);

      if (map.has(matKey)) {
        const existing = map.get(matKey)!;
        map.set(matKey, {
          ...existing,
          ...incoming,
          id: existing.id,
          matricula: incoming.matricula.trim(),
          dataValidade,
          situacaoPagamento,
          status: sit.status,
          dataAtualizacao: getTodayString(),
        });
        updated++;
      } else {
        map.set(matKey, {
          ...incoming,
          dataValidade,
          situacaoPagamento,
          status: incoming.status || sit.status,
        });
        added++;
      }
    });

    const finalStudents = Array.from(map.values());
    storageService.setItem<Student[]>(STORAGE_KEYS.STUDENTS, finalStudents);

    return { added, updated, total: finalStudents.length };
  },
};
