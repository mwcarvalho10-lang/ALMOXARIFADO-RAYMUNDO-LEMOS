import { InventoryItem, StockMovement, EquipmentLoan, SchoolKit, Category } from '@/types/inventory';
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
  BACKUP_HISTORY: 'almoxarifado_escolar_backups_v2',
};

const VALID_CATEGORIES: Category[] = ['papelaria', 'jogos', 'capital', 'limpeza', 'outros'];

function sanitizeItem(raw: any, index: number): InventoryItem {
  const category: Category = VALID_CATEGORIES.includes(raw.category) ? raw.category : 'outros';
  const quantity = typeof raw.quantity === 'number' && !isNaN(raw.quantity) ? Math.max(0, raw.quantity) : 0;
  const minQuantity = typeof raw.minQuantity === 'number' && !isNaN(raw.minQuantity) ? Math.max(0, raw.minQuantity) : 5;
  const targetSemesterStock = typeof raw.targetSemesterStock === 'number' && !isNaN(raw.targetSemesterStock) 
    ? Math.max(minQuantity * 2, raw.targetSemesterStock) 
    : Math.max(10, minQuantity * 2);

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `item-${Date.now()}-${index}`,
    code: typeof raw.code === 'string' && raw.code ? raw.code : `MAT-${String(index + 1).padStart(3, '0')}`,
    name: typeof raw.name === 'string' && raw.name ? raw.name.trim() : `Material Escolar #${index + 1}`,
    category,
    quantity,
    minQuantity,
    targetSemesterStock,
    unit: typeof raw.unit === 'string' && raw.unit ? raw.unit : 'un',
    location: typeof raw.location === 'string' ? raw.location : 'Depósito Central',
    estimatedUnitCost: typeof raw.estimatedUnitCost === 'number' && !isNaN(raw.estimatedUnitCost) ? Math.max(0, raw.estimatedUnitCost) : 0,
    lastSupplier: typeof raw.lastSupplier === 'string' ? raw.lastSupplier : undefined,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    isFavorite: Boolean(raw.isFavorite),
    patrimonyNumber: typeof raw.patrimonyNumber === 'string' ? raw.patrimonyNumber : undefined,
    brand: typeof raw.brand === 'string' ? raw.brand : undefined,
    fundingSource: typeof raw.fundingSource === 'string' ? raw.fundingSource : undefined,
    expirationDate: typeof raw.expirationDate === 'string' ? raw.expirationDate : undefined,
    isToxicFree: Boolean(raw.isToxicFree),
    gradeCycle: typeof raw.gradeCycle === 'string' ? raw.gradeCycle : 'todos',
    shelfLifeDays: typeof raw.shelfLifeDays === 'number' ? raw.shelfLifeDays : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

export function getStoredItems(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
    if (raw === null) {
      saveStoredItems(INITIAL_INVENTORY_ITEMS);
      return INITIAL_INVENTORY_ITEMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      saveStoredItems(INITIAL_INVENTORY_ITEMS);
      return INITIAL_INVENTORY_ITEMS;
    }
    return parsed.map((it, idx) => sanitizeItem(it, idx));
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
  }
  return {
    items: INITIAL_INVENTORY_ITEMS,
    movements: INITIAL_STOCK_MOVEMENTS,
    loans: INITIAL_EQUIPMENT_LOANS,
    kits: INITIAL_SCHOOL_KITS,
  };
}

export function clearAllData(): {
  items: InventoryItem[];
  movements: StockMovement[];
  loans: EquipmentLoan[];
  kits: SchoolKit[];
} {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.KITS, JSON.stringify([]));
  }
  return {
    items: [],
    movements: [],
    loans: [],
    kits: [],
  };
}

