import { PaymentStatus, Student, StudentStatus, ValidityEvaluation } from '../types';

/**
 * Normaliza uma data para meia-noite no fuso local
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return new Date(dateStr);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Calcula a quantidade de dias restantes entre a data de referência (hoje) e a data de validade
 */
export function calculateDaysRemaining(validityDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validityDate = parseLocalDate(validityDateStr);
  const diffTime = validityDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formata data ISO ou YYYY-MM-DD para DD/MM/AAAA
 */
export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '--/--/----';
  try {
    const d = parseLocalDate(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Retorna data atual no formato YYYY-MM-DD
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Adiciona dias a uma data base e retorna YYYY-MM-DD
 */
export function addDaysToStringDate(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Deriva a data de validade da carteirinha diretamente a partir do número da matrícula.
 * 
 * Regra Nacional e Institucional (Lei Federal nº 12.933/2013 - Padrão Nacional CIE / DNE):
 * - Identifica o ano letivo da matrícula (ex: 2026, 2025, 2027).
 * - Se especificado 1º semestre (ex: 2026.1, 2026/1, 2026-1): validade até 31 de julho do ano (YYYY-07-31).
 * - Matrículas anuais ou de 2º semestre (ex: 2026001, 2026.2, 2026/2): validade até 31 de março do ano subsequente (YYYY+1-03-31).
 * - Caso não haja ano identificável na matrícula, utiliza o ciclo do ano corrente.
 */
export function deriveValidityFromMatricula(matricula?: string): string {
  const currentYear = new Date().getFullYear();
  if (!matricula || !matricula.trim()) {
    return `${currentYear + 1}-03-31`;
  }

  const clean = matricula.trim();

  // 1. Tentar detectar ano de 4 dígitos (ex: 2024, 2025, 2026, 2027)
  const matchYearAtStart = clean.match(/^(20\d{2})/);
  const matchYearAnywhere = clean.match(/\b(20\d{2})\b/) || clean.match(/(20\d{2})/);

  const year = matchYearAtStart
    ? parseInt(matchYearAtStart[1], 10)
    : matchYearAnywhere
    ? parseInt(matchYearAnywhere[1], 10)
    : currentYear;

  // 2. Verificar se há indicação explícita de 1º semestre (ex: 2026.1, 2026/1, 2026-1, ou prefixo 20261 com separador)
  const isSemester1 =
    clean.includes(`${year}.1`) ||
    clean.includes(`${year}/1`) ||
    clean.includes(`${year}-1`) ||
    clean.includes(`${year}_1`) ||
    clean.toLowerCase().includes(`${year}s1`) ||
    clean.toLowerCase().includes(`${year}sem1`);

  if (isSemester1) {
    // 1º semestre: válido até 31 de julho do ano letivo
    return `${year}-07-31`;
  }

  // Padrão legal nacional CIE / Lei 12.933/13: até 31 de março do ano subsequente
  return `${year + 1}-03-31`;
}

/**
 * Deriva o status/situação cadastral do membro com base nos pagamentos e na validade da matrícula:
 * - Pagamento 'Em dia' ou 'Isento' -> 'Ativo' (ou 'Vencido' se a validade da matrícula tiver expirado).
 * - Pagamento 'Atrasado' ou 'Pendente' -> 'Inadimplente'.
 */
export function deriveSituationFromPayments(
  situacaoPagamento?: PaymentStatus,
  dataValidade?: string
): { status: StudentStatus; isAuthorized: boolean; detailedMessage: string } {
  const payment: PaymentStatus = situacaoPagamento || 'Em dia';
  const validityDateStr = dataValidade || `${new Date().getFullYear() + 1}-03-31`;
  const days = calculateDaysRemaining(validityDateStr);
  const isExpired = days < 0;

  if (isExpired) {
    return {
      status: 'Vencido',
      isAuthorized: false,
      detailedMessage: 'O ciclo letivo vinculado à sua matrícula expirou. Regularize sua rematrícula para renovar o acesso.',
    };
  }

  if (payment === 'Atrasado' || payment === 'Pendente') {
    return {
      status: 'Inadimplente',
      isAuthorized: false,
      detailedMessage: 'Identificamos pendência no pagamento da sua mensalidade/anuidade. Regularize seus pagamentos para reativar o acesso aos benefícios.',
    };
  }

  return {
    status: 'Ativo',
    isAuthorized: true,
    detailedMessage: 'Cadastro regular com pagamentos em dia.',
  };
}

/**
 * Avalia as regras de negócio de validade e autorização do membro/carteirinha:
 * 1. A concessão ou bloqueio do acesso reage estritamente ao estado recebido da API (student.status),
 *    eliminando qualquer bloqueio por data digitada ou data manual.
 * 2. A data de validade é derivada da matrícula e serve para fins informativos e comprobatórios.
 */
export function evaluateStudentValidity(student: Student): ValidityEvaluation {
  // 1. Validade informativa derivada da matrícula (sem intervenção manual)
  const validityDateStr = deriveValidityFromMatricula(student.matricula);
  const days = calculateDaysRemaining(validityDateStr);
  const isExpiredByDate = days < 0;

  // 2. Situação de pagamento informada
  const situacaoPagamento: PaymentStatus = student.situacaoPagamento || 'Em dia';

  // 3. Autorização de acesso: reage estritamente ao estado recebido da API
  const status: StudentStatus = student.status || 'Ativo';
  const isAuthorized = status === 'Ativo';

  // Nível visual de status
  let statusLevel: ValidityEvaluation['statusLevel'] = 'normal';
  let label = 'Acesso regular • Pagamento em dia';

  if (status === 'Vencido') {
    statusLevel = 'expired';
    label = 'Vínculo expirado no sistema';
  } else if (status === 'Inadimplente' || situacaoPagamento === 'Atrasado' || situacaoPagamento === 'Pendente') {
    statusLevel = 'attention_urgent';
    label = 'Inadimplente (mensalidade pendente)';
  } else if (status === 'Bloqueado') {
    statusLevel = 'attention_urgent';
    label = 'Acesso bloqueado pela administração';
  } else if (status === 'Inativo') {
    statusLevel = 'expired';
    label = 'Cadastro de membro inativo';
  } else if (days <= 7) {
    statusLevel = 'attention_urgent';
    label = 'Atenção: ciclo da matrícula vence em breve';
  } else if (days <= 30) {
    statusLevel = 'attention_medium';
    label = 'Atenção: ciclo da matrícula próximo do vencimento';
  } else {
    statusLevel = 'normal';
    label = situacaoPagamento === 'Isento' ? 'Acesso regular • Isento' : 'Acesso regular • Pagamento em dia';
  }

  let detailedMessage = 'Seu acesso ao Clube de Benefícios está liberado.';
  if (!isAuthorized) {
    if (status === 'Inadimplente' || situacaoPagamento === 'Atrasado' || situacaoPagamento === 'Pendente') {
      detailedMessage = 'Identificamos pendência no pagamento da sua mensalidade/anuidade. Regularize seus pagamentos para reativar o acesso aos benefícios.';
    } else if (status === 'Vencido') {
      detailedMessage = 'O período letivo vinculado à sua matrícula expirou no cadastro. Renove o seu vínculo para reativar a carteirinha digital.';
    } else if (status === 'Bloqueado') {
      detailedMessage = 'Seu acesso foi preventivamente bloqueado pela administração do clube.';
    } else if (status === 'Inativo') {
      detailedMessage = 'Seu cadastro de membro encontra-se inativo no sistema.';
    }
  }

  return {
    isAuthorized,
    isExpired: isExpiredByDate,
    daysRemaining: days,
    statusLevel,
    label,
    detailedMessage,
    status,
    situacaoPagamento,
  };
}
