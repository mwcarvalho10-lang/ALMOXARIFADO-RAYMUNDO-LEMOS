import { InventoryItem, StockMovement, EquipmentLoan, SchoolKit } from '@/types/inventory';
import { 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_STOCK_MOVEMENTS, 
  INITIAL_EQUIPMENT_LOANS, 
  INITIAL_SCHOOL_KITS 
} from './mock-data';

const STORAGE_KEYS = {
  ITEMS: 'almoxarifado_escolar_items_v2',
  MOVEMENTS: 'almoxarifado_escolar_movements_v2',
  LOANS: 'almoxarifado_escolar_loans_v2',
  KITS: 'almoxarifado_escolar_kits_v2',
  SCHOOL_NAME: 'almoxarifado_escolar_name_v2',
  DARK_MODE: 'almoxarifado_escolar_dark_mode_v2',
};

export function getStoredItems(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (!raw) {
      saveStoredItems(INITIAL_INVENTORY_ITEMS);
      return INITIAL_INVENTORY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVENTORY_ITEMS;
  } catch (err) {
    console.error('Erro ao carregar itens do localStorage:', err);
    return INITIAL_INVENTORY_ITEMS;
  }
}

export function saveStoredItems(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (err) {
    console.error('Erro ao salvar itens no localStorage:', err);
  }
}

export function getStoredMovements(): StockMovement[] {
  if (typeof window === 'undefined') return INITIAL_STOCK_MOVEMENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    if (!raw) {
      saveStoredMovements(INITIAL_STOCK_MOVEMENTS);
      return INITIAL_STOCK_MOVEMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_STOCK_MOVEMENTS;
  } catch (err) {
    console.error('Erro ao carregar movimentações do localStorage:', err);
    return INITIAL_STOCK_MOVEMENTS;
  }
}

export function saveStoredMovements(movements: StockMovement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  } catch (err) {
    console.error('Erro ao salvar movimentações no localStorage:', err);
  }
}

export function getStoredLoans(): EquipmentLoan[] {
  if (typeof window === 'undefined') return INITIAL_EQUIPMENT_LOANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOANS);
    if (!raw) {
      saveStoredLoans(INITIAL_EQUIPMENT_LOANS);
      return INITIAL_EQUIPMENT_LOANS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EQUIPMENT_LOANS;
  } catch (err) {
    console.error('Erro ao carregar empréstimos:', err);
    return INITIAL_EQUIPMENT_LOANS;
  }
}

export function saveStoredLoans(loans: EquipmentLoan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  } catch (err) {
    console.error('Erro ao salvar empréstimos:', err);
  }
}

export function getStoredKits(): SchoolKit[] {
  if (typeof window === 'undefined') return INITIAL_SCHOOL_KITS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KITS);
    if (!raw) {
      saveStoredKits(INITIAL_SCHOOL_KITS);
      return INITIAL_SCHOOL_KITS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SCHOOL_KITS;
  } catch (err) {
    console.error('Erro ao carregar kits:', err);
    return INITIAL_SCHOOL_KITS;
  }
}

export function saveStoredKits(kits: SchoolKit[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify(kits));
  } catch (err) {
    console.error('Erro ao salvar kits:', err);
  }
}

export function getSchoolName(): string {
  if (typeof window === 'undefined') return 'Escola Municipal Prof. Paulo Freire';
  try {
    return localStorage.getItem(STORAGE_KEYS.SCHOOL_NAME) || 'Escola Municipal Prof. Paulo Freire';
  } catch {
    return 'Escola Municipal Prof. Paulo Freire';
  }
}

export function setSchoolName(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_NAME, name);
  } catch (err) {
    console.error('Erro ao salvar nome da escola:', err);
  }
}

export function getStoredDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEYS.DARK_MODE) === 'true';
  } catch {
    return false;
  }
}

export function setStoredDarkMode(isDark: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark ? 'true' : 'false');
  } catch (err) {
    console.error('Erro ao salvar dark mode:', err);
  }
}

export function resetToDefaults(): { 
  items: InventoryItem[]; 
  movements: StockMovement[];
  loans: EquipmentLoan[];
  kits: SchoolKit[];
} {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.MOVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.KITS);
    localStorage.removeItem(STORAGE_KEYS.DARK_MODE);
  }
  return {
    items: INITIAL_INVENTORY_ITEMS,
    movements: INITIAL_STOCK_MOVEMENTS,
    loans: INITIAL_EQUIPMENT_LOANS,
    kits: INITIAL_SCHOOL_KITS,
  };
}
