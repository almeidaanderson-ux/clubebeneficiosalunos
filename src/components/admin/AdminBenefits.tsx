import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Clock,
  Edit2,
  Filter,
  Percent,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { benefitService, BenefitFormData } from '../../services/benefitService';
import { STORAGE_KEYS, storageService } from '../../services/storageService';
import { Benefit } from '../../types';
import { addDaysToStringDate, formatDateBR, getTodayString } from '../../utils/dateUtils';
import { ConfirmModal } from '../common/ConfirmModal';

const CATEGORIES = [
  'Alimentação',
  'Educação',
  'Saúde & Farmácia',
  'Tecnologia',
  'Lazer & Cultura',
  'Esportes',
  'Serviços',
  'Geral',
];

interface AdminBenefitsProps {
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const AdminBenefits: React.FC<AdminBenefitsProps> = ({
  isModalOpenExternal,
  onCloseExternalModal,
}) => {
  const [benefitsList, setBenefitsList] = useState<Benefit[]>(() => benefitService.getAll());
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');

  useEffect(() => {
    const unsubscribe = storageService.onKeyChange((key) => {
      if (key === STORAGE_KEYS.BENEFITS || key === '*') {
        setBenefitsList(benefitService.getAll());
      }
    });
    return () => unsubscribe();
  }, []);

  // Modal de Formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);

  // Campos do formulário
  const [formTitulo, setFormTitulo] = useState('');
  const [formCategoria, setFormCategoria] = useState('Geral');
  const [formLocal, setFormLocal] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPercentualDesconto, setFormPercentualDesconto] = useState<number | ''>('');
  const [formValorOuCondicao, setFormValorOuCondicao] = useState('');
  const [formRegras, setFormRegras] = useState('');
  const [formComoUtilizar, setFormComoUtilizar] = useState('Apresente a Carteirinha Digital no momento do atendimento.');
  const [formCodigoCupom, setFormCodigoCupom] = useState('');
  const [formDataInicio, setFormDataInicio] = useState(getTodayString());
  const [formDataFim, setFormDataFim] = useState(addDaysToStringDate(getTodayString(), 365));
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formDestaque, setFormDestaque] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Exclusão
  const [benefitToDelete, setBenefitToDelete] = useState<Benefit | null>(null);

  React.useEffect(() => {
    if (isModalOpenExternal) {
      openCreateModal();
    }
  }, [isModalOpenExternal]);

  const refreshList = () => {
    setBenefitsList(benefitService.getAll());
  };

  const openCreateModal = () => {
    setEditingBenefit(null);
    setFormTitulo('');
    setFormCategoria('Geral');
    setFormLocal('');
    setFormDescricao('');
    setFormPercentualDesconto('');
    setFormValorOuCondicao('');
    setFormRegras('');
    setFormComoUtilizar('Apresente a Carteirinha Digital no momento do atendimento.');
    setFormCodigoCupom('');
    setFormDataInicio(getTodayString());
    setFormDataFim(addDaysToStringDate(getTodayString(), 365));
    setFormStatus('Ativo');
    setFormDestaque(false);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormTitulo(benefit.titulo);
    setFormCategoria(benefit.categoria || 'Geral');
    setFormLocal(benefit.local || '');
    setFormDescricao(benefit.descricao);
    setFormPercentualDesconto(benefit.percentualDesconto || '');
    setFormValorOuCondicao(benefit.valorOuCondicao || '');
    setFormRegras(benefit.regrasDeUso);
    setFormComoUtilizar(benefit.comoUtilizar || 'Apresente a Carteirinha Digital no momento do atendimento.');
    setFormCodigoCupom(benefit.codigoCupom || '');
    setFormDataInicio(benefit.dataInicio);
    setFormDataFim(benefit.dataFim || '');
    setFormStatus(benefit.status);
    setFormDestaque(benefit.destaque || false);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBenefit(null);
    if (onCloseExternalModal) onCloseExternalModal();
  };

  const handleSaveBenefit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const formData: BenefitFormData = {
      titulo: formTitulo,
      categoria: formCategoria,
      local: formLocal,
      descricao: formDescricao,
      percentualDesconto: formPercentualDesconto === '' ? undefined : Number(formPercentualDesconto),
      valorOuCondicao: formValorOuCondicao,
      regrasDeUso: formRegras,
      comoUtilizar: formComoUtilizar,
      codigoCupom: formCodigoCupom,
      dataInicio: formDataInicio,
      dataFim: formDataFim || undefined,
      status: formStatus,
      destaque: formDestaque,
    };

    if (editingBenefit) {
      const res = benefitService.update(editingBenefit.id, formData);
      if (!res.success) {
        setFormError(res.error || 'Erro ao atualizar benefício.');
        return;
      }
    } else {
      const res = benefitService.create(formData);
      if (!res.success) {
        setFormError(res.error || 'Erro ao cadastrar benefício.');
        return;
      }
    }

    refreshList();
    handleCloseForm();
  };

  const handleToggleStatus = (id: string) => {
    benefitService.toggleStatus(id);
    refreshList();
  };

  const handleDeleteConfirm = () => {
    if (!benefitToDelete) return;
    const { id } = benefitToDelete;
    benefitService.delete(id);
    setBenefitToDelete(null);
    refreshList();
  };

  const filteredBenefits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return benefitsList.filter((b) => {
      if (categoryFilter !== 'Todas' && (b.categoria || 'Geral') !== categoryFilter) return false;
      if (statusFilter !== 'Todos' && b.status !== statusFilter) return false;
      if (!term) return true;

      return (
        b.titulo.toLowerCase().includes(term) ||
        b.descricao.toLowerCase().includes(term) ||
        (b.categoria && b.categoria.toLowerCase().includes(term)) ||
        (b.local && b.local.toLowerCase().includes(term))
      );
    });
  }, [benefitsList, searchTerm, categoryFilter, statusFilter]);

  return (
    <div className="space-y-5 pb-12">
      {/* Header com Título e Botão Novo Benefício */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cadastrar & Gerenciar Benefícios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cadastre descontos, condições especiais e regras de utilização com a Carteirinha Digital.
          </p>
        </div>

        <button
          id="btn-admin-add-benefit"
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Novo Benefício
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="admin-search-benefit"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar benefício por título, categoria ou local..."
            className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            id="admin-filter-benefit-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer max-w-[200px] truncate"
          >
            <option value="Todas">Todas as Categorias</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            id="admin-filter-benefit-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Lista / Tabela Responsiva */}
      {benefitsList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Nenhum benefício cadastrado ainda</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cadastre as primeiras parcerias e vantagens comerciais do clube para que os membros possam usufruir.
          </p>
          <div className="pt-2">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeiro Benefício
            </button>
          </div>
        </div>
      ) : filteredBenefits.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
          Nenhum benefício encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Tabela Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Benefício</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Desconto / Condição</th>
                  <th className="py-3.5 px-4">Vigência</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBenefits.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{b.titulo}</span>
                            {b.destaque && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                                Destaque
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {b.descricao}
                          </span>
                          {b.local && (
                            <span className="text-[10px] text-blue-600 block">
                              Local: {b.local}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {b.categoria || 'Geral'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {b.percentualDesconto ? (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                          {b.percentualDesconto}% OFF
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800">
                          {b.valorOuCondicao || 'Condição Especial'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {b.dataFim ? (
                        <span>Até {formatDateBR(b.dataFim)}</span>
                      ) : (
                        <span className="text-slate-400">Tempo indeterminado</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(b.id)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          b.status === 'Ativo'
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {b.status}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Editar Benefício"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBenefitToDelete(b)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir Benefício"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards Mobile */}
          <div className="block md:hidden divide-y divide-slate-100">
            {filteredBenefits.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">{b.titulo}</span>
                    <span className="text-xs text-blue-600 font-semibold">
                      {b.categoria || 'Geral'} {b.local ? `• ${b.local}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(b.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {b.status}
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{b.descricao}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  {b.percentualDesconto ? (
                    <span className="font-bold text-emerald-700">
                      {b.percentualDesconto}% de Desconto
                    </span>
                  ) : (
                    <span className="font-bold text-blue-700">{b.valorOuCondicao}</span>
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => openEditModal(b)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100 cursor-pointer"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setBenefitToDelete(b)}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Excluir benefício"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Formulário Adicionar / Editar Benefício */}
      {isFormOpen && (
        <div
          id="benefit-form-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {editingBenefit ? 'Editar Benefício' : 'Cadastrar Novo Benefício'}
              </h3>
              <button
                onClick={handleCloseForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBenefit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Título do Benefício / Desconto *
                </label>
                <input
                  type="text"
                  required
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  placeholder="Ex: 20% de Desconto em Produtos e Serviços"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formCategoria}
                    onChange={(e) => setFormCategoria(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Local / Onde Utilizar (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formLocal}
                    onChange={(e) => setFormLocal(e.target.value)}
                    placeholder="Ex: Livraria Central / Campus"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descrição Detalhada *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Ex: Desconto aplicável na compra de qualquer livro técnico ou didático."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Percentual de Desconto (% - Opcional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formPercentualDesconto}
                    onChange={(e) =>
                      setFormPercentualDesconto(
                        e.target.value === '' ? '' : Math.max(0, Math.min(100, Number(e.target.value)))
                      )
                    }
                    placeholder="Ex: 20"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Valor ou Condição Especial (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formValorOuCondicao}
                    onChange={(e) => setFormValorOuCondicao(e.target.value)}
                    placeholder="Ex: Isenção de matrícula / Compre 1 Leve 2"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Regras de Utilização / Restrições *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formRegras}
                  onChange={(e) => setFormRegras(e.target.value)}
                  placeholder="Ex: Válido para membros ativos mediante apresentação da Carteirinha Digital."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Como Utilizar / Instruções ao Titular *
                </label>
                <input
                  type="text"
                  required
                  value={formComoUtilizar}
                  onChange={(e) => setFormComoUtilizar(e.target.value)}
                  placeholder="Ex: Apresente a Carteirinha Digital no momento do atendimento."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cupom Promocional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formCodigoCupom}
                    onChange={(e) => setFormCodigoCupom(e.target.value.toUpperCase())}
                    placeholder="Ex: CLUBE20"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status do Benefício
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Ativo' | 'Inativo')}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none bg-white font-semibold"
                  >
                    <option value="Ativo">Ativo (Liberado)</option>
                    <option value="Inativo">Inativo (Pausado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data de Início da Vigência *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDataInicio}
                    onChange={(e) => setFormDataInicio(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Data de Fim da Vigência
                  </label>
                  <input
                    type="date"
                    value={formDataFim}
                    onChange={(e) => setFormDataFim(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formDestaque}
                    onChange={(e) => setFormDestaque(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Destacar este benefício na tela inicial dos membros
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  {editingBenefit ? 'Salvar Alterações' : 'Cadastrar Benefício'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={Boolean(benefitToDelete)}
        title="Excluir Benefício"
        message={`Deseja realmente excluir o benefício "${benefitToDelete?.titulo}"?`}
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setBenefitToDelete(null)}
      />
    </div>
  );
};
