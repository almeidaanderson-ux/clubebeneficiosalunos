import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Maximize2,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Student } from '../../types';
import { evaluateStudentValidity, formatDateBR } from '../../utils/dateUtils';

interface StudentCardProps {
  student: Student;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const validity = evaluateStudentValidity(student);

  // Render do componente visual da carteirinha
  const renderCardContent = (inModal = false) => (
    <div
      id="digital-student-card"
      className={`relative w-full max-w-sm sm:max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl transition-all ${
        validity.isAuthorized
          ? 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 text-white'
          : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-slate-200'
      } border border-white/20 p-4 sm:p-6 sm:p-7 flex flex-col justify-between ${
        inModal ? 'scale-100' : ''
      }`}
    >
      {/* Padrão visual de fundo / Textura sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Topo da Carteirinha */}
      <div className="relative z-10 flex items-start justify-between gap-2 sm:gap-3 pb-3.5 sm:pb-4 border-b border-white/15">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs shrink-0">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-blue-200">
              Carteirinha Digital
            </div>
            <div className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate">
              {student.instituicao}
            </div>
          </div>
        </div>

        {/* Selo de Validade / Holográfico */}
        <div className="flex flex-col items-end shrink-0">
          <span
            className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-xs ${
              validity.isAuthorized
                ? 'bg-emerald-500 text-white'
                : student.situacaoPagamento === 'Atrasado'
                ? 'bg-amber-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {validity.isAuthorized ? (
              <>
                <CheckCircle2 className="w-3 h-3" /> ATIVO • EM DIA
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" /> {student.status.toUpperCase()}
              </>
            )}
          </span>
          <span className="text-[8px] sm:text-[9px] text-blue-200 mt-1 font-mono tracking-wider">
            VIGÊNCIA MATRÍCULA
          </span>
        </div>
      </div>

      {/* Corpo com Foto e Dados */}
      <div className="relative z-10 my-4 sm:my-5 flex items-center gap-3 sm:gap-5">
        <div className="relative shrink-0">
          {student.fotoUrl ? (
            <img
              src={student.fotoUrl}
              alt={student.nome}
              className="w-16 h-20 sm:w-24 sm:h-28 rounded-2xl object-cover border-2 border-white/30 shadow-md bg-white/10"
            />
          ) : (
            <div className="w-16 h-20 sm:w-24 sm:h-28 rounded-2xl bg-white/10 border-2 border-white/30 flex items-center justify-center text-white/70">
              <User className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm sm:text-lg font-bold text-white leading-tight truncate">
            {student.nome}
          </div>
          <div className="text-[11px] sm:text-xs text-blue-200 font-medium mt-0.5 truncate">
            {student.curso}
          </div>

          <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
            <div className="bg-white/10 rounded-xl p-1.5 sm:p-2 border border-white/10 min-w-0">
              <span className="block text-[8px] sm:text-[9px] uppercase font-bold text-blue-200 truncate">
                Matrícula
              </span>
              <span className="font-mono font-bold text-[11px] sm:text-sm text-white block truncate">
                {student.matricula}
              </span>
            </div>

            <div className="bg-white/10 rounded-xl p-1.5 sm:p-2 border border-white/10 min-w-0">
              <span className="block text-[8px] sm:text-[9px] uppercase font-bold text-blue-200 truncate">
                Validade
              </span>
              <span className="font-mono font-bold text-[11px] sm:text-sm text-white block truncate">
                {formatDateBR(student.dataValidade)}
              </span>
            </div>
          </div>

          {/* Situação dos Pagamentos */}
          <div className="mt-1.5 bg-white/10 rounded-xl px-2 py-1 border border-white/10 flex items-center justify-between text-[10px] text-blue-100">
            <span className="font-medium text-blue-200">Situação:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  validity.isAuthorized ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              {student.situacaoPagamento || 'Em dia'}
            </span>
          </div>
        </div>
      </div>

      {/* Espaço Preparado para Futuro QR Code */}
      <div className="relative z-10 pt-3 sm:pt-4 border-t border-white/15 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Moldura óptica para validação por QR Code */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-dashed border-white/40 flex items-center justify-center text-white/80 shrink-0">
            <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-[9px] sm:text-[10px] text-blue-200 leading-snug min-w-0">
            <span className="font-semibold text-white block truncate">Apresente este cartão no caixa</span>
            <span className="truncate block">Espaço para validação futura por QR Code</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[8px] sm:text-[9px] font-semibold uppercase text-blue-200 block">
            Clube de Benefícios
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-white flex items-center gap-1 justify-end">
            <Sparkles className="w-3 h-3 text-amber-300" /> Oficial
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho explicativo */}
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Carteirinha Digital
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apresente esta identificação digital no momento do atendimento para usufruir dos seus benefícios e descontos.
        </p>
      </div>

      {/* Card da Carteirinha */}
      <div className="py-2">
        {renderCardContent(false)}
      </div>

      {/* Ações e Instruções de Uso */}
      <div className="max-w-sm sm:max-w-md mx-auto space-y-4">
        <button
          id="btn-show-fullscreen-card"
          type="button"
          onClick={() => setIsFullScreen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
          Mostrar cartão em tela cheia
        </button>

        {/* Dicas de Utilização */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-2.5 text-xs text-slate-600">
          <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Como comprovar seu benefício
          </div>
          <ul className="space-y-1.5 list-disc list-inside text-slate-600">
            <li>Exiba a tela deste cartão no momento do fechamento da conta ou comanda.</li>
            <li>O estabelecimento verificará a <strong>foto, nome, matrícula</strong> e a <strong>data de validade</strong>.</li>
            <li>Em caso de dúvida, o estabelecimento poderá solicitar documento complementar com foto (RG/CNH).</li>
          </ul>
        </div>
      </div>

      {/* Modal em Tela Cheia */}
      {isFullScreen && (
        <div
          id="fullscreen-card-modal"
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <button
            id="close-fullscreen-card"
            onClick={() => setIsFullScreen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Fechar tela cheia"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full max-w-lg">
            <div className="text-center text-white/70 text-xs mb-3 font-medium">
              Toque no botão fechar ou pressione ESC para retornar
            </div>
            {renderCardContent(true)}
          </div>
        </div>
      )}
    </div>
  );
};
