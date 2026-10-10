'use client';

import React, { useState, useEffect } from 'react';
import { IslandSidebar } from '@/components/IslandSidebar';
import { IslandHeader } from '@/components/IslandHeader';
import { DashboardOverview } from '@/components/DashboardOverview';
import { InventoryTable } from '@/components/InventoryTable';
import { MovementsHistory } from '@/components/MovementsHistory';
import { AlertsView } from '@/components/AlertsView';
import { SemesterPurchasePlanner } from '@/components/SemesterPurchasePlanner';
import { EquipmentLoansView } from '@/components/EquipmentLoansView';
import { ItemModal } from '@/components/ItemModal';
import { MovementModal } from '@/components/MovementModal';
import { PrintReceiptModal } from '@/components/PrintReceiptModal';
import { CommandPalette } from '@/components/CommandPalette';
import { BarcodeScannerModal } from '@/components/BarcodeScannerModal';
import { BarcodeLabelGenerator } from '@/components/BarcodeLabelGenerator';
import { WarehouseMapModal } from '@/components/WarehouseMapModal';
import { SchoolKitsModal } from '@/components/SchoolKitsModal';
import { BlindInventoryModal } from '@/components/BlindInventoryModal';
import { SustainabilityModal } from '@/components/SustainabilityModal';
import { 
  getStoredItems, 
  saveStoredItems, 
  getStoredMovements, 
  saveStoredMovements, 
  getStoredLoans,
  saveStoredLoans, 
  getSchoolName, 
  setSchoolName,
  getStoredDarkMode,
  setStoredDarkMode,
  resetToDefaults
} from '@/lib/storage';
import { InventoryItem, StockMovement, EquipmentLoan, Category, MovementType } from '@/types/inventory';
import { CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { playBeep } from '@/lib/audio';

const emptySubscribe = () => () => {};

export default function Home() {
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [items, setItems] = useState<InventoryItem[]>(() => getStoredItems());
  const [movements, setMovements] = useState<StockMovement[]>(() => getStoredMovements());
  const [loans, setLoans] = useState<EquipmentLoan[]>(() => getStoredLoans());
  const [schoolName, setSchoolState] = useState<string>(() => getSchoolName());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getStoredDarkMode());

  // Island layout mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'todas'>('todas');

  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementModalType, setMovementModalType] = useState<MovementType>('saida');
  const [movementPreselectedId, setMovementPreselectedId] = useState<string | null>(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptMovement, setReceiptMovement] = useState<StockMovement | null>(null);

  // Enterprise Tools Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLabelsOpen, setIsLabelsOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isKitsOpen, setIsKitsOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isSustainabilityOpen, setIsSustainabilityOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'warn' } | null>(null);

  // Sync dark mode class on html/body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    setStoredDarkMode(next);
  };

  const showToast = (title: string, description: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ title, description, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Item management handlers
  const handleSaveItem = (savedItem: InventoryItem) => {
    let updatedItems: InventoryItem[];
    const exists = items.some((i) => i.id === savedItem.id);

    if (exists) {
      updatedItems = items.map((i) => (i.id === savedItem.id ? savedItem : i));
      showToast('Material Atualizado!', `${savedItem.name} foi atualizado com sucesso no depósito.`);
    } else {
      updatedItems = [savedItem, ...items];
      showToast('Novo Material Cadastrado!', `${savedItem.name} adicionado à seção ${savedItem.category}.`);
    }

    setItems(updatedItems);
    saveStoredItems(updatedItems);
  };

  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = items.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    if (confirm(`Deseja realmente remover o material "${itemToDelete.name}" do depósito?`)) {
      const updated = items.filter((i) => i.id !== itemId);
      setItems(updated);
      saveStoredItems(updated);
      showToast('Material Removido', `O item ${itemToDelete.name} foi retirado do cadastro.`, 'warn');
    }
  };

  // Movement handler
  const handleSaveMovement = (movement: StockMovement, openPrintReceipt: boolean) => {
    // 1. Update movement history
    const updatedMovements = [movement, ...movements];
    setMovements(updatedMovements);
    saveStoredMovements(updatedMovements);

    // 2. Update item stock quantity
    const targetItem = items.find((i) => i.id === movement.itemId);
    if (targetItem) {
      const updatedItem: InventoryItem = {
        ...targetItem,
        quantity: movement.newQuantity,
        lastRestockDate: movement.type === 'entrada' ? new Date().toISOString().slice(0, 10) : targetItem.lastRestockDate,
        updatedAt: new Date().toISOString(),
      };
      const updatedItems = items.map((i) => (i.id === updatedItem.id ? updatedItem : i));
      setItems(updatedItems);
      saveStoredItems(updatedItems);

      // Check if low stock alert triggered
      if (movement.type === 'saida' && updatedItem.quantity <= updatedItem.minQuantity) {
        playBeep('alert');
        showToast(
          'Alerta de Reposição Acionado!',
          `O estoque de "${updatedItem.name}" caiu para ${updatedItem.quantity} ${updatedItem.unit} (mínimo: ${updatedItem.minQuantity}).`,
          'warn'
        );
      } else {
        playBeep('success');
        showToast(
          movement.type === 'entrada' ? 'Entrada Registrada!' : 'Saída Registrada!',
          `${movement.quantity} ${targetItem.unit} de ${movement.itemName} para ${movement.responsible}.`
        );
      }
    }

    // 3. Open printable receipt if requested
    if (openPrintReceipt) {
      setReceiptMovement(movement);
      setIsReceiptModalOpen(true);
    }
  };

  // Kit dispatching handler (batch movements)
  const handleDispatchKit = (newMovements: StockMovement[], kitName: string) => {
    const updatedMovements = [...newMovements, ...movements];
    setMovements(updatedMovements);
    saveStoredMovements(updatedMovements);

    const updatedItems = items.map((it) => {
      const matched = newMovements.find((m) => m.itemId === it.id);
      if (matched) {
        return {
          ...it,
          quantity: matched.newQuantity,
          updatedAt: new Date().toISOString(),
        };
      }
      return it;
    });

    setItems(updatedItems);
    saveStoredItems(updatedItems);
    showToast('Kit Escolar Dispensado!', `${kitName} entregue com sucesso e saldo atualizado.`);
  };

  // Loans handlers
  const handleSaveLoan = (loan: EquipmentLoan) => {
    const updated = [loan, ...loans];
    setLoans(updated);
    saveStoredLoans(updated);
    showToast('Empréstimo Registrado!', `${loan.itemName} emprestado para ${loan.borrowerName}.`);
  };

  const handleReturnLoan = (loanId: string) => {
    const updated = loans.map((l) =>
      l.id === loanId ? { ...l, status: 'devolvido' as const, returnDate: new Date().toISOString() } : l
    );
    setLoans(updated);
    saveStoredLoans(updated);
    showToast('Devolução Concluída!', 'Equipamento devolvido ao almoxarifado com sucesso.');
  };

  // Blind inventory audit adjustment handler
  const handleApplyInventoryAdjustments = (
    adjustments: Array<{ itemId: string; newQuantity: number; reason: string }>
  ) => {
    const now = new Date().toISOString();
    const auditMovements: StockMovement[] = [];

    const updatedItems = items.map((it) => {
      const adj = adjustments.find((a) => a.itemId === it.id);
      if (adj) {
        const diff = adj.newQuantity - it.quantity;
        auditMovements.push({
          id: `mov-audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          itemId: it.id,
          itemName: it.name,
          itemCode: it.code,
          category: it.category,
          type: 'ajuste',
          quantity: Math.abs(diff),
          previousQuantity: it.quantity,
          newQuantity: adj.newQuantity,
          date: now,
          responsible: 'Auditoria de Estoque',
          role: 'Comissão de Inventário',
          destinationOrReason: adj.reason,
        });

        return {
          ...it,
          quantity: adj.newQuantity,
          updatedAt: now,
        };
      }
      return it;
    });

    const updatedMovements = [...auditMovements, ...movements];
    setItems(updatedItems);
    setMovements(updatedMovements);
    saveStoredItems(updatedItems);
    saveStoredMovements(updatedMovements);

    showToast('Inventário Atualizado!', `${adjustments.length} saldos ajustados conforme conferência física.`);
  };

  // Quick action openers
  const handleOpenMovementModal = (type: 'entrada' | 'saida', itemId?: string) => {
    setMovementModalType(type);
    setMovementPreselectedId(itemId || null);
    setIsMovementModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleUpdateSchoolName = (newName: string) => {
    setSchoolState(newName);
    setSchoolName(newName);
    showToast('Identificação Atualizada', `Nome da escola alterado para "${newName}".`);
  };

  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar os materiais e histórico padrão de demonstração?')) {
      const { items: defItems, movements: defMovs, loans: defLoans } = resetToDefaults();
      setItems(defItems);
      setMovements(defMovs);
      setLoans(defLoans);
      showToast('Dados Restaurados', 'O depósito foi redefinido para a lista inicial padrão escolar.');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F8] dark:bg-[#121618] text-stone-600 dark:text-stone-400">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium">Carregando Almoxarifado Escolar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-[#121618] text-stone-100' : 'bg-[#F7F9F8] text-stone-800'}`}>
      {/* Island Sidebar Layout Wrapper */}
      <div className="flex flex-col lg:flex-row min-h-screen p-3 sm:p-4 lg:p-5 gap-3.5 sm:gap-4 lg:gap-5 max-w-[1680px] mx-auto">
        {/* Floating Island Sidebar */}
        <IslandSidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          items={items}
          loans={loans}
          schoolName={schoolName}
          onUpdateSchoolName={handleUpdateSchoolName}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenLabels={() => setIsLabelsOpen(true)}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenKits={() => setIsKitsOpen(true)}
          onOpenAudit={() => setIsAuditOpen(true)}
          onOpenSustainability={() => setIsSustainabilityOpen(true)}
          onResetDefaults={handleResetDefaults}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Island Column */}
        <div className="flex-1 flex flex-col min-w-0 gap-3.5 sm:gap-4">
          {/* Top Floating Island Header */}
          <IslandHeader
            currentTab={currentTab}
            schoolName={schoolName}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenNewItem={handleOpenNewItem}
            onOpenMovement={(type) => handleOpenMovementModal(type)}
          />

          {/* Dynamic Content Views */}
          <main className="flex-1 min-w-0">
            {currentTab === 'dashboard' && (
              <DashboardOverview
                items={items}
                movements={movements}
                onSelectCategory={(cat) => {
                  setSelectedCategory(cat);
                  setCurrentTab('estoque');
                }}
                onNavigateToTab={(tab) => setCurrentTab(tab as any)}
                onQuickMovement={(itemId, type) => handleOpenMovementModal(type, itemId)}
              />
            )}

            {currentTab === 'estoque' && (
              <InventoryTable
                items={items}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onOpenNewItem={handleOpenNewItem}
                onEditItem={handleOpenEditItem}
                onDeleteItem={handleDeleteItem}
                onRecordMovement={(itemId, type) => handleOpenMovementModal(type, itemId)}
                onOpenScanner={() => setIsScannerOpen(true)}
                onOpenLabels={() => setIsLabelsOpen(true)}
              />
            )}

            {currentTab === 'movimentacoes' && (
              <MovementsHistory
                movements={movements}
                onOpenReceipt={(mov) => {
                  setReceiptMovement(mov);
                  setIsReceiptModalOpen(true);
                }}
                onOpenNewMovement={(type) => handleOpenMovementModal(type)}
              />
            )}

            {currentTab === 'emprestimos' && (
              <EquipmentLoansView
                loans={loans}
                items={items}
                onSaveLoan={handleSaveLoan}
                onReturnLoan={handleReturnLoan}
              />
            )}

            {currentTab === 'alertas' && (
              <AlertsView
                items={items}
                onQuickRestock={(itemId) => handleOpenMovementModal('entrada', itemId)}
                onNavigateToPurchases={() => setCurrentTab('compras')}
              />
            )}

            {currentTab === 'compras' && (
              <SemesterPurchasePlanner
                items={items}
                schoolName={schoolName}
              />
            )}
          </main>

          {/* Quiet Minimal School Footer Island */}
          <footer className="print:hidden bg-white dark:bg-[#1A2024] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 shadow-2xs transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700 dark:text-stone-300">{schoolName}</span>
              <span>· Almoxarifado Escolar & Patrimônio</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400">
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Atalhos (⌘K)
              </button>
              <span>·</span>
              <button
                onClick={() => setIsSustainabilityOpen(true)}
                className="hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Depósito Sustentável
              </button>
              <span>·</span>
              <span>Ano Letivo 2026</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`p-3.5 rounded-2xl shadow-lg border flex items-start gap-2.5 max-w-sm ${
            toastMessage.type === 'warn'
              ? 'bg-[#FFF5F5] dark:bg-rose-950 border-[#FED7D7] dark:border-rose-900 text-[#991B1B] dark:text-rose-200'
              : 'bg-[#EAF4EE] dark:bg-emerald-950 border-[#CFE7D8] dark:border-emerald-900 text-[#1E4620] dark:text-emerald-200'
          }`}>
            {toastMessage.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-xs">{toastMessage.title}</h4>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5 leading-snug">{toastMessage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal (Create / Edit) */}
      <ItemModal
        key={itemToEdit ? `edit-${itemToEdit.id}` : 'new-item'}
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
        existingItems={items}
      />

      {/* Movement Modal (Entrada / Saída) */}
      <MovementModal
        key={`mov-${movementModalType}-${movementPreselectedId || 'none'}-${isMovementModalOpen}`}
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        onSaveMovement={handleSaveMovement}
        items={items}
        preselectedItemId={movementPreselectedId}
        defaultType={movementModalType}
      />

      {/* Print Receipt Modal (Termo de Retirada / Cautela) */}
      <PrintReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        movement={receiptMovement}
        schoolName={schoolName}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        items={items}
        onSelectItem={(item) => {
          setSelectedCategory(item.category);
          setCurrentTab('estoque');
        }}
        onOpenMovement={(type) => handleOpenMovementModal(type)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenLabels={() => setIsLabelsOpen(true)}
        onOpenMap={() => setIsMapOpen(true)}
        onOpenKits={() => setIsKitsOpen(true)}
        onOpenLoans={() => setCurrentTab('emprestimos')}
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenPurchases={() => setCurrentTab('compras')}
        onOpenSustainability={() => setIsSustainabilityOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Barcode / Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        items={items}
        onQuickMovement={(id, type) => handleOpenMovementModal(type, id)}
      />

      {/* Barcode / QR Label Generator Modal */}
      <BarcodeLabelGenerator
        isOpen={isLabelsOpen}
        onClose={() => setIsLabelsOpen(false)}
        items={items}
        schoolName={schoolName}
      />

      {/* 2D Warehouse Interactive Map Modal */}
      <WarehouseMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        items={items}
        onSelectItem={(item) => {
          setSelectedCategory(item.category);
          setCurrentTab('estoque');
        }}
      />

      {/* Thematic School Kits Modal */}
      <SchoolKitsModal
        isOpen={isKitsOpen}
        onClose={() => setIsKitsOpen(false)}
        items={items}
        onDispatchKit={handleDispatchKit}
      />

      {/* Blind Inventory Audit Modal */}
      <BlindInventoryModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        items={items}
        onApplyInventoryAdjustments={handleApplyInventoryAdjustments}
      />

      {/* Sustainability Panel Modal */}
      <SustainabilityModal
        isOpen={isSustainabilityOpen}
        onClose={() => setIsSustainabilityOpen(false)}
        movementsCount={movements.length}
        itemsCount={items.length}
      />
    </div>
  );
}
