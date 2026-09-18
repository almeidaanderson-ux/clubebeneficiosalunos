import { Benefit } from '../types';
import { getTodayString, parseLocalDate } from '../utils/dateUtils';
import { STORAGE_KEYS, storageService } from './storageService';

export interface BenefitFormData {
  categoria?: string;
  local?: string;
  titulo: string;
  descricao: string;
  percentualDesconto?: number;
  valorOuCondicao?: string;
  regrasDeUso: string;
  comoUtilizar?: string;
  codigoCupom?: string;
  destaque?: boolean;
  dataInicio: string;
  dataFim?: string;
  status: 'Ativo' | 'Inativo';
}

export const benefitService = {
  getAll(): Benefit[] {
    return storageService.getItem<Benefit[]>(STORAGE_KEYS.BENEFITS, []);
  },

  /**
   * Retorna todos os benefícios ativos e dentro da vigência
   */
  getActiveBenefits(): Benefit[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.getAll().filter((b) => {
      if (b.status !== 'Ativo') return false;

      if (b.dataInicio) {
        const start = parseLocalDate(b.dataInicio);
        if (start.getTime() > today.getTime()) return false;
      }

      if (b.dataFim) {
        const end = parseLocalDate(b.dataFim);
        if (end.getTime() < today.getTime()) return false;
      }

      return true;
    });
  },

  getById(id: string): Benefit | null {
    const list = this.getAll();
    return list.find((b) => b.id === id) || null;
  },

  create(data: BenefitFormData): { success: boolean; error?: string; benefit?: Benefit } {
    const list = this.getAll();

    if (!data.titulo?.trim()) {
      return { success: false, error: 'O título do benefício é obrigatório.' };
    }
    if (!data.regrasDeUso?.trim()) {
      return { success: false, error: 'As regras de utilização são obrigatórias.' };
    }
    if (!data.dataInicio?.trim()) {
      return { success: false, error: 'A data de início da vigência é obrigatória.' };
    }
    if (data.dataFim && data.dataInicio && data.dataFim < data.dataInicio) {
      return { success: false, error: 'A data de término não pode ser anterior à data de início.' };
    }

    const today = getTodayString();
    const newBenefit: Benefit = {
      id: `ben-${Date.now()}`,
      categoria: data.categoria?.trim() || 'Geral',
      local: data.local?.trim() || undefined,
      titulo: data.titulo.trim(),
      descricao: data.descricao?.trim() || '',
      percentualDesconto: data.percentualDesconto ? Number(data.percentualDesconto) : undefined,
      valorOuCondicao: data.valorOuCondicao?.trim() || undefined,
      regrasDeUso: data.regrasDeUso.trim(),
      comoUtilizar: data.comoUtilizar?.trim() || 'Apresente sua Carteirinha Digital no momento do atendimento.',
      codigoCupom: data.codigoCupom?.trim() || undefined,
      destaque: Boolean(data.destaque),
      dataInicio: data.dataInicio,
      dataFim: data.dataFim || undefined,
      status: data.status || 'Ativo',
      dataCriacao: today,
      dataAtualizacao: today,
    };

    list.unshift(newBenefit);
    storageService.setItem<Benefit[]>(STORAGE_KEYS.BENEFITS, list);
    return { success: true, benefit: newBenefit };
  },

  update(id: string, data: Partial<BenefitFormData>): { success: boolean; error?: string; benefit?: Benefit } {
    const list = this.getAll();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) {
      return { success: false, error: 'Benefício não encontrado.' };
    }

    const current = list[index];

    const dataInicio = data.dataInicio || current.dataInicio;
    const dataFim = data.dataFim !== undefined ? data.dataFim : current.dataFim;
    if (dataFim && dataInicio && dataFim < dataInicio) {
      return { success: false, error: 'A data de término não pode ser anterior à data de início.' };
    }

    const updatedBenefit: Benefit = {
      ...current,
      categoria: data.categoria !== undefined ? data.categoria.trim() : (current.categoria || 'Geral'),
      local: data.local !== undefined ? data.local.trim() : current.local,
      titulo: data.titulo !== undefined ? data.titulo.trim() : current.titulo,
      descricao: data.descricao !== undefined ? data.descricao.trim() : current.descricao,
      percentualDesconto:
        data.percentualDesconto !== undefined
          ? data.percentualDesconto
            ? Number(data.percentualDesconto)
            : undefined
          : current.percentualDesconto,
      valorOuCondicao:
        data.valorOuCondicao !== undefined ? data.valorOuCondicao.trim() : current.valorOuCondicao,
      regrasDeUso: data.regrasDeUso !== undefined ? data.regrasDeUso.trim() : current.regrasDeUso,
      comoUtilizar: data.comoUtilizar !== undefined ? data.comoUtilizar.trim() : current.comoUtilizar,
      codigoCupom: data.codigoCupom !== undefined ? data.codigoCupom.trim() : current.codigoCupom,
      destaque: data.destaque !== undefined ? data.destaque : current.destaque,
      dataInicio,
      dataFim: dataFim || undefined,
      status: data.status || current.status,
      dataAtualizacao: getTodayString(),
    };

    list[index] = updatedBenefit;
    storageService.setItem<Benefit[]>(STORAGE_KEYS.BENEFITS, list);
    return { success: true, benefit: updatedBenefit };
  },

  toggleStatus(id: string): { success: boolean; newStatus?: 'Ativo' | 'Inativo' } {
    const benefit = this.getById(id);
    if (!benefit) return { success: false };
    const newStatus = benefit.status === 'Ativo' ? 'Inativo' : 'Ativo';
    this.update(id, { status: newStatus });
    return { success: true, newStatus };
  },

  toggleFeatured(id: string): { success: boolean; newFeatured?: boolean } {
    const benefit = this.getById(id);
    if (!benefit) return { success: false };
    const newFeatured = !benefit.destaque;
    this.update(id, { destaque: newFeatured });
    return { success: true, newFeatured };
  },

  delete(id: string): boolean {
    const list = this.getAll();
    const cleanId = String(id).trim();
    const filtered = list.filter((b) => String(b.id).trim() !== cleanId);
    if (filtered.length === list.length) return false;
    storageService.setItem<Benefit[]>(STORAGE_KEYS.BENEFITS, filtered);
    return true;
  },

  replaceAll(benefits: Benefit[]): void {
    storageService.setItem<Benefit[]>(STORAGE_KEYS.BENEFITS, benefits);
  },
};
