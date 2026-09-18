import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  CreditCard,
  Percent,
  Search,
  Sparkles,
  Tag,
  User,
} from 'lucide-react';
import { benefitService } from '../../services/benefitService';
import { Benefit, Student } from '../../types';
import { evaluateStudentValidity, formatDateBR } from '../../utils/dateUtils';
import { BenefitDetailModal } from './BenefitDetailModal';
import { StudentNavTab } from './StudentBottomNav';

interface StudentHomeProps {
  student: Student;
  onNavigate: (tab: StudentNavTab) => void;
}

const CATEGORIES = [
  'Todas',
  'Alimentação',
  'Educação',
  'Saúde & Farmácia',
  'Tecnologia',
  'Lazer & Cultura',
  'Esportes',
  'Serviços',
  'Geral',
];

export const StudentHome: React.FC<StudentHomeProps> = ({ student, onNavigate }) => {
  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const validity = evaluateStudentValidity(student);
  const allBenefits = benefitService.getActiveBenefits();

  const filteredBenefits = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return allBenefits.filter((b) => {
      if (selectedCategory !== 'Todas' && (b.categoria || 'Geral') !== selectedCategory) {
        return false;
      }
      if (!term) return true;

      return (
        b.titulo.toLowerCase().includes(term) ||
        b.descricao.toLowerCase().includes(term) ||
        (b.categoria && b.categoria.toLowerCase().includes(term)) ||
        (b.local && b.local.toLowerCase().includes(term))
      );
    });
  }, [allBenefits, searchTerm, selectedCategory]);

  // Obter primeiro nome para saudação cordial
  const firstName = student.nome.split(' ')[0] || student.nome;

  return (
    <div className="space-y-6 pb-12">
      {/* Card de Saudação e Status de Validade */}
      <section
        id="student-hero-banner"
        className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden"
      >
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-6 top-6 text-white/10 hidden sm:block pointer-events-none">
          <Award className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <span>{student.instituicao}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Olá, {firstName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-md">
            Aproveite seus benefícios e vantagens exclusivas apresentando sua Carteirinha Digital.
          </p>

          {/* Box de Validade do Acesso */}
          <div className="mt-5 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {validity.statusLevel === 'normal' ? (
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-200">
                    Situação da Carteirinha
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {validity.label}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-blue-200">Validade (Matrícula)</div>
                <div className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-blue-200" />
                  {formatDateBR(student.dataValidade)}
                </div>
              </div>
            </div>

            {/* Indicador de dias restantes e situação dos pagamentos */}
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-blue-100">
                {validity.daysRemaining > 0 ? (
                  <>
                    Restam <strong>{validity.daysRemaining} dias</strong> de vigência da matrícula
                  </>
                ) : (
                  <strong className="text-rose-300">Ciclo da matrícula expirado</strong>
                )}
              </span>

              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white">
                  Pagamento: {student.situacaoPagamento || 'Em dia'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    validity.statusLevel === 'normal'
                      ? 'bg-emerald-500 text-white'
                      : validity.statusLevel === 'attention_urgent'
                      ? 'bg-rose-500 text-white'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  {student.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Atalhos Rápidos */}
      <section id="student-quick-shortcuts">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Acesso Rápido
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            id="shortcut-cartao"
            type="button"
            onClick={() => onNavigate('cartao')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Minha Carteirinha</span>
              <span className="text-xs text-slate-500">Exibir QR Code & Matrícula</span>
            </div>
          </button>

          <button
            id="shortcut-perfil"
            type="button"
            onClick={() => onNavigate('perfil')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-3.5 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">Meu Perfil</span>
              <span className="text-xs text-slate-500">Dados do Membro e Cadastro</span>
            </div>
          </button>
        </div>
      </section>

      {/* Seção Principal: Benefícios Disponíveis */}
      <section id="student-benefits-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Benefícios & Descontos Disponíveis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Apresente a Carteirinha Digital para obter os descontos cadastrados.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto">
            {filteredBenefits.length} benefício{filteredBenefits.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Barra de Pesquisa */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="student-search-benefits"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por benefício, categoria ou local..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none text-slate-900 shadow-2xs"
          />
        </div>

        {/* Filtro por Categorias em Carrossel/Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lista de Cards de Benefícios */}
        {allBenefits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">Nenhum benefício cadastrado no momento</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              Novas vantagens e parcerias serão adicionadas em breve pela administração do clube.
            </p>
          </div>
        ) : filteredBenefits.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
            Nenhum benefício encontrado para esta pesquisa ou categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBenefits.map((benefit) => (
              <div
                key={benefit.id}
                onClick={() => setSelectedBenefit(benefit)}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {benefit.categoria || 'Geral'}
                    </span>
                    {benefit.destaque && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Destaque
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {benefit.titulo}
                    </h3>
                    {benefit.local && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        Local: {benefit.local}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {benefit.descricao}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {benefit.percentualDesconto ? (
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {benefit.percentualDesconto}% OFF
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold truncate max-w-[150px]">
                      {benefit.valorOuCondicao || 'Condição Especial'}
                    </span>
                  )}

                  <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">
                    Ver detalhes →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalhes do Benefício */}
      <BenefitDetailModal
        benefit={selectedBenefit}
        onClose={() => setSelectedBenefit(null)}
        onOpenCard={() => onNavigate('cartao')}
      />
    </div>
  );
};
