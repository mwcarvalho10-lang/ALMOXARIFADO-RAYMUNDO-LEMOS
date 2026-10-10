export type Category = 'papelaria' | 'jogos' | 'capital' | 'limpeza' | 'outros';

export interface CategoryInfo {
  id: Category;
  label: string;
  shortLabel: string;
  description: string;
  iconName: string;
  colorClass: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORIES: Record<Category, CategoryInfo> = {
  papelaria: {
    id: 'papelaria',
    label: 'Papelaria & Material Escolar',
    shortLabel: 'Papelaria',
    description: 'Folhas sulfites, cartolinas, canetas, tintas, EVA, lápis, colas e itens de artesanato.',
    iconName: 'FileText',
    colorClass: 'text-amber-800 bg-[#FFF7ED] border-[#FED7AA] dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
    badgeBg: 'bg-[#FEF3C7] dark:bg-amber-950/50',
    badgeText: 'text-amber-900 dark:text-amber-300',
  },
  jogos: {
    id: 'jogos',
    label: 'Jogos & Material Lúdico/Esportivo',
    shortLabel: 'Jogos & Lúdico',
    description: 'Jogos de tabuleiro, quebra-cabeças, blocos lógicos, bolas, cordas e material esportivo.',
    iconName: 'Gamepad2',
    colorClass: 'text-purple-800 bg-[#F5F3FF] border-[#DDD6FE] dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60',
    badgeBg: 'bg-[#EDE9FE] dark:bg-purple-950/50',
    badgeText: 'text-purple-900 dark:text-purple-300',
  },
  capital: {
    id: 'capital',
    label: 'Itens de Capital & Patrimônio',
    shortLabel: 'Itens de Capital',
    description: 'Bens duráveis e equipamentos permanentes (projetores, caixas de som, notebooks, móveis) com tombamento.',
    iconName: 'Cpu',
    colorClass: 'text-sky-800 bg-[#F0F9FF] border-[#BAE6FD] dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60',
    badgeBg: 'bg-[#E0F2FE] dark:bg-sky-950/50',
    badgeText: 'text-sky-900 dark:text-sky-300',
  },
  limpeza: {
    id: 'limpeza',
    label: 'Itens de Limpeza & Higiene',
    shortLabel: 'Limpeza & Higiene',
    description: 'Desinfetantes, sabonetes, papel toalha, sacos de lixo, vassouras e produtos sanitários.',
    iconName: 'Sparkles',
    colorClass: 'text-emerald-800 bg-[#F0FDF4] border-[#BBF7D0] dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
    badgeBg: 'bg-[#DCFCE7] dark:bg-emerald-950/50',
    badgeText: 'text-emerald-900 dark:text-emerald-300',
  },
  outros: {
    id: 'outros',
    label: 'Outros & Manutenção Geral',
    shortLabel: 'Outros / Geral',
    description: 'Materiais de primeiros socorros, ferramentas de manutenção, pilhas, fitas adesivas e eventos.',
    iconName: 'Package',
    colorClass: 'text-stone-700 bg-[#F5F5F4] border-[#E7E5E4] dark:bg-stone-900/50 dark:text-stone-300 dark:border-stone-800',
    badgeBg: 'bg-[#E7E5E4] dark:bg-stone-800',
    badgeText: 'text-stone-800 dark:text-stone-200',
  },
};

export type ItemCondition = 'novo' | 'bom' | 'regular' | 'necessita_reparo';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: Category;
  quantity: number;
  minQuantity: number; // Limite de alerta de estoque crítico
  targetSemesterStock: number; // Meta semestral de consumo/necessidade
  unit: string; // un, cx, pct, resma, rolo, L, kg
  location: string; // Ex: Armário 2 - Gaveta 3
  patrimonyNumber?: string; // Número de tombamento (apenas para itens de capital)
  serialNumber?: string;
  condition?: ItemCondition;
  estimatedUnitCost: number; // R$ custo médio para estimativa de compra
  brand?: string;
  lastSupplier?: string;
  lastRestockDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'entrada' | 'saida' | 'ajuste';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  category: Category;
  type: MovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  date: string;
  responsible: string; // Nome do solicitante / professor / funcionário
  role?: string; // Professor(a), Coordenação, Limpeza, Direção, etc.
  destinationOrReason: string; // Ex: "Turma 2º Ano B - Projeto de Artes", "Reposição NF 1042", "Refeitório"
  invoiceNumber?: string;
  notes?: string;
  signatureDataUrl?: string; // Assinatura digital touch salva
}

export interface SemesterPurchaseItem {
  itemId: string;
  name: string;
  code: string;
  category: Category;
  unit: string;
  currentStock: number;
  targetSemesterStock: number;
  suggestedQuantity: number;
  orderedQuantity: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  priority: 'critica' | 'alta' | 'media' | 'baixa';
  supplierHint?: string;
  selected: boolean;
  notes?: string;
}

export interface EquipmentLoan {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  patrimonyNumber?: string;
  borrowerName: string;
  borrowerRole: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ativo' | 'devolvido' | 'atrasado';
  purpose: string;
  signatureDataUrl?: string;
  notes?: string;
}

export interface SchoolKitItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface SchoolKit {
  id: string;
  name: string;
  description: string;
  badge: string;
  targetAudience: string;
  items: SchoolKitItem[];
}

export interface WarehouseZone {
  id: string;
  name: string;
  code: string;
  category: Category;
  description: string;
  shelves: string[];
}
