/**
 * storageService
 * Gerenciamento centralizado de dados em memória durante a sessão ativa.
 * Nenhuma informação é persistida em localStorage ou cookies do navegador.
 */

export const STORAGE_KEYS = {
  STUDENTS: 'clube_beneficios_membros',
  BENEFITS: 'clube_beneficios_beneficios',
  ADMINS: 'clube_beneficios_admins',
  SESSION: 'clube_beneficios_session',
};

const memoryStore = new Map<string, string>();

type StorageChangeListener = (key: string) => void;
const changeListeners: Set<StorageChangeListener> = new Set();

// Limpeza de segurança: remove quaisquer dados antigos que tenham ficado no localStorage
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('clube_beneficios_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Silencioso em caso de restrições de sandbox
  }
}

function notifyKeyChange(key: string) {
  changeListeners.forEach((listener) => {
    try {
      listener(key);
    } catch (err) {
      console.error('[storageService] Erro no listener de alteração de chave:', err);
    }
  });
}

export const storageService = {
  isAvailable(): boolean {
    return true;
  },

  onKeyChange(listener: StorageChangeListener): () => void {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },

  getItem<T>(key: string, defaultValue: T): T {
    try {
      const val = memoryStore.get(key);
      if (val === undefined) {
        return defaultValue;
      }
      return JSON.parse(val) as T;
    } catch {
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      memoryStore.set(key, serialized);
      notifyKeyChange(key);
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): void {
    memoryStore.delete(key);
    notifyKeyChange(key);
  },

  clear(): void {
    memoryStore.clear();
    notifyKeyChange('*');
  },
};
