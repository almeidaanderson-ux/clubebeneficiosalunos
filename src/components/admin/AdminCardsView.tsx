import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  Maximize2,
  Plus,
  Printer,
  QrCode,
  Receipt,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  UserX,
  X,
} from 'lucide-react';
import { STORAGE_KEYS, storageService } from '../../services/storageService';
import { studentService } from '../../services/studentService';
import { PaymentStatus, Student, StudentStatus } from '../../types';
import {
  calculateDaysRemaining,
  deriveValidityFromMatricula,
  evaluateStudentValidity,
  formatDateBR,
  getTodayString,
} from '../../utils/dateUtils';
import { StudentCard } from '../student/StudentCard';

export const AdminCardsView: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(() => studentService.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  // Modal para cadastrar novo membro
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newMatricula, setNewMatricula] = useState('');
  const [newCurso, setNewCurso] = useState('Plano Titular');
  const [newInstituicao, setNewInstituicao] = useState('Clube de Benefícios Metropolitano');
  const [newEmail, setNewEmail] = useState('');
  const [newTelefone, setNewTelefone] = useState('');
  const [newSenha, setNewSenha] = useState('1234');
  const [newSituacaoPagamento, setNewSituacaoPagamento] = useState<PaymentStatus>('Em dia');
  const [formError, setFormError] = useState('');

  // Membro atualmente selecionado para visualização da carteirinha
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    const list = studentService.getAll();
    return list.find((s) => s.status === 'Ativo') || list[0] || null;
  });

  // Modal de Simulação de Validação do Estabelecimento
  const [validationMatricula, setValidationMatricula] = useState('');
  const [validationResult, setValidationResult] = useState<{
    tested: boolean;
    student?: Student;
    validity?: ReturnType<typeof evaluateStudentValidity>;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = storageService.onKeyChange((key) => {
      if (key === STORAGE_KEYS.STUDENTS || key === '*') {
        const list = studentService.getAll();
        setStudents(list);
        setSelectedStudent((prev) => {
          if (!prev) return list[0] || null;
          return list.find((s) => s.id === prev.id) || list[0] || null;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Validade calculada dinamicamente no formulário de novo membro
  const previewDerivedValidade = useMemo(() => {
    return deriveValidityFromMatricula(newMatricula);
  }, [newMatricula]);

  // Filtragem da lista de carteirinhas
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        student.nome.toLowerCase().includes(term) ||
        student.matricula.toLowerCase().includes(term) ||
        student.curso.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const validity = evaluateStudentValidity(student);

      if (statusFilter === 'EmDia') {
        return validity.isAuthorized;
      }
      if (statusFilter === 'Inadimplentes') {
        return student.situacaoPagamento === 'Atrasado' || student.status === 'Inadimplente';
      }
      if (statusFilter === 'Vencidas') {
        return validity.isExpired || student.status === 'Vencido';
      }

      return true;
    });
  }, [students, searchTerm, statusFilter]);

  // Estatísticas das carteirinhas emitidas
  const stats = useMemo(() => {
    let emDia = 0;
    let inadimplentes = 0;
    let matriculaVencida = 0;

    students.forEach((s) => {
      const validity = evaluateStudentValidity(s);
      if (validity.isAuthorized) {
        emDia++;
      } else if (s.situacaoPagamento === 'Atrasado' || s.status === 'Inadimplente') {
        inadimplentes++;
      } else if (validity.isExpired || s.status === 'Vencido') {
        matriculaVencida++;
      }
    });

    return {
      total: students.length,
      emDia,
      inadimplentes,
      matriculaVencida,
    };
  }, [students]);

  const handleValidateMatricula = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = validationMatricula.trim().toLowerCase();
    if (!clean) return;

    const found = students.find(
      (s) => s.matricula.toLowerCase() === clean || s.nome.toLowerCase().includes(clean)
    );

    if (found) {
      setValidationResult({
        tested: true,
        student: found,
        validity: evaluateStudentValidity(found),
      });
      setSelectedStudent(found);
    } else {
      setValidationResult({
        tested: true,
      });
    }
  };

  const handleQuickValidateStudent = (student: Student) => {
    setValidationMatricula(student.matricula);
    setValidationResult({
      tested: true,
      student,
      validity: evaluateStudentValidity(student),
    });
    setSelectedStudent(student);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newNome.trim()) {
      setFormError('Informe o nome completo do titular.');
      return;
    }
    if (!newMatricula.trim()) {
      setFormError('Informe o número de matrícula.');
      return;
    }

    const res = studentService.create({
      nome: newNome,
      matricula: newMatricula,
      curso: newCurso,
      instituicao: newInstituicao,
      email: newEmail,
      telefone: newTelefone,
      senha: newSenha || '1234',
      situacaoPagamento: newSituacaoPagamento,
    });

    if (!res.success) {
      setFormError(res.error || 'Erro ao cadastrar titular.');
      return;
    }

    setShowAddModal(false);
    setNewNome('');
    setNewMatricula('');
    setNewEmail('');
    setNewTelefone('');
    setNewSenha('1234');
    setNewSituacaoPagamento('Em dia');

    const updatedList = studentService.getAll();
    setStudents(updatedList);
    if (res.student) {
      setSelectedStudent(res.student);
    }
  };

  const handleUpdatePaymentStatus = (paymentStatus: PaymentStatus) => {
    if (!selectedStudent) return;
    const today = getTodayString();
    const res = studentService.updatePaymentStatus(selectedStudent.id, paymentStatus, {
      id: `pay-${Date.now()}`,
      competencia: today.slice(0, 7).split('-').reverse().join('/'),
      vencimento: today,
      valor: 39.9,
      status: paymentStatus === 'Atrasado' ? 'Atrasado' : 'Pago',
      dataPagamento: paymentStatus === 'Em dia' ? today : undefined,
      formaPagamento: paymentStatus === 'Isento' ? 'Isenção Cadastral' : 'Atualização Administrativa',
    });

    if (res.success && res.student) {
      setSelectedStudent(res.student);
      setStudents(studentService.getAll());
    }
  };

  const handleUpdateStudentStatus = (newStatus: StudentStatus) => {
    if (!selectedStudent) return;
    const res = studentService.updateStatus(selectedStudent.id, newStatus);
    if (res.success && res.student) {
      setSelectedStudent(res.student);
      setStudents(studentService.getAll());
    }
  };

  const handleDeleteStudent = (student: Student) => {
    if (window.confirm(`Deseja remover o cadastro do membro ${student.nome}?`)) {
      studentService.delete(student.id, student.matricula);
      const updatedList = studentService.getAll();
      setStudents(updatedList);
      if (selectedStudent?.id === student.id) {
        setSelectedStudent(updatedList[0] || null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Carteirinhas Digitais & Situação de Acesso
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Validade por Matrícula • Situação por Pagamento
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            A validade da carteirinha é calculada a partir do ciclo da matrícula e a situação de acesso é gerida pelo status dos pagamentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-member"
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Cadastrar Novo Membro
          </button>

          <button
            id="btn-print-card"
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            title="Imprimir carteirinha"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Membros Registrados</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Total no clube</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Pagamentos em Dia (Ativos)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.emDia}</div>
          <span className="text-[11px] text-emerald-700 font-medium">Acesso liberado</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Inadimplentes (Mensalidade)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.inadimplentes}</div>
          <span className="text-[11px] text-amber-700">Pagamento em atraso</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Validade Expirada (Matrícula)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.matriculaVencida}</div>
          <span className="text-[11px] text-rose-600 font-medium">Ciclo letivo encerrado</span>
        </div>
      </div>

      {/* Grid Central: Validador & Lista & Visualizador */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Lado Esquerdo (7 colunas): Ferramenta de Validação e Lista */}
        <div className="lg:col-span-7 space-y-6">
          {/* Caixa de Validação Rápida */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Validador de Autenticidade & Situação
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300">
                  Consulte se a matrícula do titular possui validade vigente e pagamentos em dia para liberar o benefício.
                </p>
              </div>
            </div>

            <form onSubmit={handleValidateMatricula} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Digite a matrícula ou nome do titular..."
                  value={validationMatricula}
                  onChange={(e) => setValidationMatricula(e.target.value)}
                  className="w-full pl-3.5 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Consultar</span>
              </button>
            </form>

            {/* Resultado da Validação */}
            {validationResult && validationResult.tested && (
              <div className="mt-4 pt-4 border-t border-white/15">
                {validationResult.student && validationResult.validity ? (
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      validationResult.validity.isAuthorized
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-100'
                        : 'bg-rose-950/70 border-rose-500/50 text-rose-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                            validationResult.validity.isAuthorized ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        >
                          {validationResult.validity.isAuthorized ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <ShieldAlert className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">
                              {validationResult.student.nome}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                validationResult.validity.isAuthorized
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-rose-500 text-white'
                              }`}
                            >
                              {validationResult.validity.isAuthorized
                                ? 'LIBERADO (PAGAMENTO EM DIA)'
                                : `RECUSADO (${validationResult.student.status.toUpperCase()})`}
                            </span>
                          </div>
                          <div className="text-xs text-white/80 mt-0.5">
                            Matrícula: <strong className="font-mono">{validationResult.student.matricula}</strong> • Validade derivada: <strong>{formatDateBR(validationResult.student.dataValidade)}</strong>
                          </div>
                          <div className="text-[11px] text-white/70 mt-0.5">
                            Situação do pagamento: <strong className="capitalize">{validationResult.student.situacaoPagamento || 'Em dia'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-white/10 text-[11px] flex flex-wrap items-center justify-between gap-2">
                      <span>{validationResult.validity.detailedMessage}</span>
                      <span className="font-mono text-white/60">
                        ID: #{validationResult.student.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Nenhum membro encontrado com este termo de busca. Verifique a matrícula informada.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabela / Lista de Membros */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Membros Cadastrados ({filteredStudents.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Selecione um membro para pré-visualizar a carteirinha e gerenciar sua situação.
                </p>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="EmDia">Pagamentos em Dia (Ativos)</option>
                  <option value="Inadimplentes">Inadimplentes (Mensalidade)</option>
                  <option value="Vencidas">Validade Expirada (Matrícula)</option>
                </select>
              </div>
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome, matrícula ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Lista Rápida */}
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {filteredStudents.map((st) => {
                const validity = evaluateStudentValidity(st);
                const isSelected = selectedStudent?.id === st.id;

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`py-3 px-3 rounded-2xl flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {st.fotoUrl ? (
                        <img
                          src={st.fotoUrl}
                          alt={st.nome}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {st.nome}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${
                              validity.isAuthorized
                                ? 'bg-emerald-100 text-emerald-800'
                                : st.situacaoPagamento === 'Atrasado'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {validity.isAuthorized ? 'EM DIA' : st.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          Matrícula: <strong className="font-mono text-slate-700">{st.matricula}</strong> • Validade:{' '}
                          <span className="font-semibold text-slate-700">{formatDateBR(st.dataValidade)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickValidateStudent(st);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 shadow-2xs transition-colors cursor-pointer"
                        title="Simular validação da carteirinha"
                      >
                        Validar
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStudent(st);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remover cadastro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight
                        className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}
                      />
                    </div>
                  </div>
                );
              })}

              {students.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Nenhum membro cadastrado ainda</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Clique em "Cadastrar Novo Membro" acima para emitir uma carteirinha e testar a derivação automática da validade pela matrícula e a situação pelos pagamentos.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Cadastrar Primeiro Membro
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Nenhum membro encontrado para o filtro selecionado.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Lado Direito (5 colunas): Visualizador e Gestão de Pagamento & Situação */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pré-visualização Oficial da Carteirinha
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Exibição do Titular
              </span>
            </div>

            {selectedStudent ? (
              <div className="space-y-4">
                {/* Carteirinha Digital Exata */}
                <div className="py-1">
                  <StudentCard student={selectedStudent} />
                </div>

                {/* Detalhes de Validade & Matrícula */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Validade (Derivada da Matrícula):</span>
                    <strong className="text-slate-900 font-mono">
                      {formatDateBR(selectedStudent.dataValidade)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Situação dos Pagamentos:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedStudent.situacaoPagamento === 'Em dia'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedStudent.situacaoPagamento === 'Isento'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedStudent.situacaoPagamento || 'Em dia'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Situação Cadastral Resultante:</span>
                    <strong
                      className={`font-semibold ${
                        selectedStudent.status === 'Ativo' ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {selectedStudent.status}
                    </strong>
                  </div>
                </div>

                {/* Controle de Gestão de Pagamentos / Situação */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      Gerenciar Pagamento & Situação
                    </span>
                    <span className="text-[10px] text-blue-700 font-medium">Ação do Administrador</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    A situação do membro é derivada do status do pagamento. Altere abaixo para atualizar imediatamente o acesso:
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUpdatePaymentStatus('Em dia')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex flex-col items-center gap-1 ${
                        selectedStudent.situacaoPagamento === 'Em dia'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Em Dia (Ativo)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdatePaymentStatus('Atrasado')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex flex-col items-center gap-1 ${
                        selectedStudent.situacaoPagamento === 'Atrasado'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
                      }`}
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Atrasado</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdatePaymentStatus('Isento')}
                      className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex flex-col items-center gap-1 ${
                        selectedStudent.situacaoPagamento === 'Isento'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-blue-800'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Isento</span>
                    </button>
                  </div>
                </div>

                {/* Controle de Status de Acesso Direto (API) */}
                <div className="p-3.5 rounded-2xl bg-slate-100/70 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
                      Status do Membro na API
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-semibold">
                      Atual: {selectedStudent.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(['Ativo', 'Inadimplente', 'Bloqueado', 'Inativo', 'Vencido'] as StudentStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStudentStatus(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          selectedStudent.status === st
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickValidateStudent(selectedStudent)}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Testar Validação Deste Membro
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                {students.length === 0
                  ? 'Nenhuma carteirinha para exibir no momento.'
                  : 'Selecione um membro para pré-visualizar a carteirinha digital.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Cadastrar Novo Membro */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Membro</h3>
                  <p className="text-xs text-slate-500">Validade calculada automaticamente pela matrícula</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Número de Matrícula *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 2026001 ou 2026.1"
                    value={newMatricula}
                    onChange={(e) => setNewMatricula(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Validade da Carteirinha
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-semibold flex items-center justify-between">
                    <span>{formatDateBR(previewDerivedValidade)}</span>
                    <span className="text-[10px] font-sans font-normal text-blue-600">(Automática)</span>
                  </div>
                </div>
              </div>

              {/* Informação sobre a regra de derivação */}
              <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-snug">
                <strong>Regra Nacional (Lei 12.933/13):</strong> A validade é calculada a partir do ano/ciclo da matrícula (ex: ano 2026 expira em 31/03/2027; semestre 1 expira em 31/07). Sem necessidade de ajuste manual.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Plano / Categoria</label>
                  <input
                    type="text"
                    placeholder="Ex: Titular Universitário"
                    value={newCurso}
                    onChange={(e) => setNewCurso(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Instituição</label>
                  <input
                    type="text"
                    placeholder="Ex: Clube Metropolitano"
                    value={newInstituicao}
                    onChange={(e) => setNewInstituicao(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="aluno@exemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={newTelefone}
                    onChange={(e) => setNewTelefone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Senha / PIN de Acesso</label>
                  <input
                    type="text"
                    placeholder="Ex: 1234"
                    value={newSenha}
                    onChange={(e) => setNewSenha(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Situação Inicial dos Pagamentos
                  </label>
                  <select
                    value={newSituacaoPagamento}
                    onChange={(e) => setNewSituacaoPagamento(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Em dia">Em dia (Acesso Liberado)</option>
                    <option value="Atrasado">Atrasado (Inadimplente)</option>
                    <option value="Isento">Isento (Bolsista / Parceria)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  Salvar e Emitir Carteirinha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
