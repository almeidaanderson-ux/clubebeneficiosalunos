export type StudentStatus = 'Ativo' | 'Inativo' | 'Inadimplente' | 'Bloqueado' | 'Vencido';

export type PaymentStatus = 'Em dia' | 'Atrasado' | 'Pendente' | 'Isento';

export interface PaymentRecord {
  id: string;
  competencia: string; // Ex: "09/2026"
  vencimento: string; // YYYY-MM-DD
  valor: number; // Ex: 39.90
  status: 'Pago' | 'Pendente' | 'Atrasado';
  dataPagamento?: string; // YYYY-MM-DD
  formaPagamento?: string; // "PIX", "Boleto", "Cartão", etc.
}

export interface Student {
  id: string;
  nome: string;
  matricula: string;
  email: string;
  telefone: string;
  senha: string; // PIN ou senha local
  instituicao: string;
  curso: string;
  dataInicio: string; // YYYY-MM-DD
  dataValidade: string; // YYYY-MM-DD (derivada da matrícula)
  status: StudentStatus; // Situação cadastral (derivada dos pagamentos e da matrícula)
  situacaoPagamento: PaymentStatus; // Situação financeira/pagamento
  historicoPagamentos?: PaymentRecord[];
  fotoUrl?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Benefit {
  id: string;
  categoria?: string;
  local?: string;
  titulo: string;
  descricao: string;
  percentualDesconto?: number; // Ex: 15 para 15%
  valorOuCondicao?: string; // Ex: "Compre 1 e leve 2" ou "R$ 20,00 de desconto"
  regrasDeUso: string;
  comoUtilizar?: string;
  codigoCupom?: string;
  destaque?: boolean;
  dataInicio: string; // YYYY-MM-DD
  dataFim?: string; // YYYY-MM-DD opcional
  status: 'Ativo' | 'Inativo';
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface AdminUser {
  id: string;
  nome: string;
  email: string;
  senha: string;
  perfil: 'admin';
  status: 'Ativo' | 'Inativo';
}

export type UserRole = 'membro' | 'admin';

export interface AuthSession {
  role: UserRole;
  user: Student | AdminUser;
  tokenTimestamp: number;
}

export type ValidityStatusLevel = 'normal' | 'attention_medium' | 'attention_urgent' | 'expired';

export interface MemberAccessState {
  isAuthorized: boolean;
  status: StudentStatus;
  situacaoPagamento: PaymentStatus;
  statusTitle: string;
  badgeColor: string;
  detailedExplanation: string;
}

export interface ValidityEvaluation {
  isAuthorized: boolean;
  isExpired: boolean;
  daysRemaining: number;
  statusLevel: ValidityStatusLevel;
  label: string;
  detailedMessage: string;
  status: StudentStatus;
  situacaoPagamento?: PaymentStatus;
}
