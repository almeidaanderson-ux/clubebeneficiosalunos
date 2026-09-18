import React, { useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  CreditCard,
  HelpCircle,
  LogOut,
  Mail,
  Phone,
  Server,
  ShieldAlert,
  User,
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';
import { formatDateBR } from '../../utils/dateUtils';
import { StudentCard } from './StudentCard';

interface BlockedAccessProps {
  student: Student;
  onLogout: () => void;
}

export const BlockedAccess: React.FC<BlockedAccessProps> = ({ student, onLogout }) => {
  const [showCardModal, setShowCardModal] = useState(false);

  // A tela de bloqueio reage estritamente ao estado recebido da API
  // e não a datas digitadas ou cálculos manuais de validade.
  const accessState = studentService.getAccessState(student);

  return (
    <div className="max-w-lg mx-auto py-8 px-4 sm:px-0">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50 text-center">
        {/* Ícone de Alerta */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Indicador do Estado Recebido da API */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Server className="w-3.5 h-3.5 text-blue-500" />
            Estado Recebido da API
          </span>
        </div>

        {/* Status Badge derivado da API */}
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 shadow-2xs ${accessState.badgeColor}`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          {accessState.status.toUpperCase()}
        </span>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {accessState.statusTitle}
        </h1>

        {/* Mensagem oficial de indisponibilidade baseada no estado da API */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2">
          <p className="font-semibold text-amber-900">
            “Seu acesso aos benefícios está temporariamente indisponível. Para regularizar sua situação, entre em contato com a administração do clube.”
          </p>
          <p className="text-xs text-amber-800/90">{accessState.detailedExplanation}</p>
        </div>

        {/* Resumo do Membro e Dados da API */}
        <div className="mt-6 bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Titular:</span>
            <span className="font-bold text-slate-800">{student.nome}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Matrícula / ID:</span>
            <span className="font-mono font-bold text-slate-800">{student.matricula}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Organização:</span>
            <span className="font-semibold text-slate-800">{student.instituicao}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Estado da Conta (API):</span>
            <span className="font-bold text-rose-600">
              {student.status}
            </span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Situação dos Pagamentos:</span>
            <span className="font-bold text-amber-700">
              {student.situacaoPagamento || 'Pendente'}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500 font-medium">Vigência da Matrícula (Comprobatório):</span>
            <span className="font-semibold text-slate-700 font-mono">
              {formatDateBR(student.dataValidade)}
            </span>
          </div>
        </div>

        {/* Contatos da Central de Atendimento */}
        <div className="mt-6 text-left bg-blue-50/60 rounded-2xl p-4 border border-blue-100 text-xs text-slate-600 space-y-1.5">
          <div className="font-bold text-blue-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Canais de Atendimento:
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>atendimento@clubedebeneficios.com.br</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>(11) 3000-4000 • Atendimento de Segunda a Sexta das 8h às 20h</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            id="btn-blocked-view-card"
            type="button"
            onClick={() => setShowCardModal(true)}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-slate-600" />
            Ver Meu Cartão
          </button>

          <button
            id="btn-blocked-logout"
            type="button"
            onClick={onLogout}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sair da Conta
          </button>
        </div>
      </div>

      {/* Modal para visualizar o Cartão (caso precise comprovar matrícula mesmo com benefícios suspensos) */}
      {showCardModal && (
        <div
          id="blocked-card-modal"
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-6 text-white relative">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-sm font-bold text-slate-300 mb-4 text-center">
              Cartão Digital para Apresentação
            </h3>
            <StudentCard student={student} />
            <button
              onClick={() => setShowCardModal(false)}
              className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
