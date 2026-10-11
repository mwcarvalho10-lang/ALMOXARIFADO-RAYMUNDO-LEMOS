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
import { SchoolQuickRequisitionModal } from '@/components/SchoolQuickRequisitionModal';
import { SchoolConsumptionCalculatorModal } from '@/components/SchoolConsumptionCalculatorModal';
import { SchoolDataBackupModal } from '@/components/SchoolDataBackupModal';
import { SchoolHelpGuideModal } from '@/components/SchoolHelpGuideModal';
import { 
  getStoredItems, 
  saveStoredItems, 
  getStoredMovements, 
  saveStoredMovements, 
  getStoredLoans,
  saveStoredLoans, 
  getSchoolName, 
  setSchoolName,
  resetToDefaults
} from '@/lib/storage';
import { InventoryItem, StockMovement, EquipmentLoan, Category, MovementType } from '@/types/inventory';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { playBeep } from '@/lib/audio';

const emptySubscribe = () => () => {};

function createMovementId(prefix = 'mov'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

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
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);

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

  // Pedagogical Tools Modals
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isHelpGuideModalOpen, setIsHelpGuideModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; type: 'success' | 'warn' } | null>(null);

  // Quick action openers
  const handleOpenMovementModal = (type: 'entrada' | 'saida', itemId?: string) => {
    setMovementModalType(type);
    setMovementPreselectedId(itemId || null);
    setIsMovementModalOpen(true);
  };

  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  // Ensure clean pastel light theme on document root
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Global Keyboard Shortcuts (N = Novo Material, E = Entrada, S = Saída, ⌘K = Busca)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement || 
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenNewItem();
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleOpenMovementModal('entrada');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleOpenMovementModal('saida');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Toggle favorite star
  const handleToggleFavorite = (itemId: string) => {
    const updated = items.map((i) => i.id === itemId ? { ...i, isFavorite: !i.isFavorite } : i);
    setItems(updated);
    saveStoredItems(updated);
    playBeep('click');
  };

  // Quick inline stock adjustment
  const handleQuickAdjust = (itemId: string, delta: number) => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return;

    const newQty = Math.max(0, targetItem.quantity + delta);
    if (newQty === targetItem.quantity) return;

    const type: MovementType = delta > 0 ? 'entrada' : 'saida';
    const movement: StockMovement = {
      id: createMovementId('mov-quick'),
      itemId: targetItem.id,
      itemName: targetItem.name,
      itemCode: targetItem.code,
      category: targetItem.category,
      type,
      quantity: Math.abs(delta),
      previousQuantity: targetItem.quantity,
      newQuantity: newQty,
      date: new Date().toISOString(),
      responsible: 'Almoxarife (Ajuste Rápido)',
      role: 'Almoxarifado',
      destinationOrReason: delta > 0 ? 'Entrada pontual de bancada' : 'Baixa pontual de bancada',
    };

    handleSaveMovement(movement, false);
  };

  // Movement handler
  const handleSaveMovement = (movement: StockMovement, openPrintReceipt: boolean) => {
    const updatedMovements = [movement, ...movements];
    setMovements(updatedMovements);
    saveStoredMovements(updatedMovements);

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

  // Quick Teacher Requisition Dispatch
  const handleDispatchRequisition = (newMovements: StockMovement[], teacherName: string, classroom: string) => {
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
    showToast('Requisição Docente Dispensada!', `${newMovements.length} materiais para ${teacherName} (${classroom}).`);
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
          id: createMovementId('mov-audit'),
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

  // Restore data from JSON backup
  const handleRestoreData = (newItems: InventoryItem[], newMovements: StockMovement[], newLoans: EquipmentLoan[]) => {
    setItems(newItems);
    setMovements(newMovements);
    setLoans(newLoans);
    saveStoredItems(newItems);
    saveStoredMovements(newMovements);
    saveStoredLoans(newLoans);
    showToast('Backup Restaurado!', `${newItems.length} materiais carregados com sucesso.`);
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
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBF9] text-stone-600">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#2D6A4F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium">Carregando Almoxarifado Escolar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBF9] text-stone-800">
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
          onOpenRequisition={() => setIsRequisitionModalOpen(true)}
          onOpenCalculator={() => setIsCalculatorModalOpen(true)}
          onOpenBackup={() => setIsBackupModalOpen(true)}
          onOpenHelpGuide={() => setIsHelpGuideModalOpen(true)}
          onResetDefaults={handleResetDefaults}
          isPresentationMode={isPresentationMode}
          onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
          mobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Island Column */}
        <div className="flex-1 flex flex-col min-w-0 gap-3.5 sm:gap-4">
          {/* Top Floating Island Header */}
          <IslandHeader
            currentTab={currentTab}
            schoolName={schoolName}
            isPresentationMode={isPresentationMode}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenNewItem={handleOpenNewItem}
            onOpenMovement={(type) => handleOpenMovementModal(type)}
            onOpenRequisition={() => setIsRequisitionModalOpen(true)}
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
                onOpenCalculator={() => setIsCalculatorModalOpen(true)}
                isPresentationMode={isPresentationMode}
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
                onToggleFavorite={handleToggleFavorite}
                onQuickAdjust={handleQuickAdjust}
                isPresentationMode={isPresentationMode}
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
          <footer className="print:hidden bg-white rounded-2xl border border-stone-200/80 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 shadow-2xs transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700">{schoolName}</span>
              <span>· Almoxarifado & Controle Patrimonial</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400">
              <button
                onClick={() => setIsHelpGuideModalOpen(true)}
                className="hover:text-emerald-700 transition-colors"
              >
                Guia Docente
              </button>
              <span>·</span>
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="hover:text-emerald-700 transition-colors"
              >
                Backup & APM
              </button>
              <span>·</span>
              <button
                onClick={() => setIsSustainabilityOpen(true)}
                className="hover:text-emerald-700 transition-colors"
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
              ? 'bg-[#FFF5F5] border-[#FED7D7] text-[#991B1B]'
              : 'bg-[#EAF4EE] border-[#CFE7D8] text-[#1E4620]'
          }`}>
            {toastMessage.type === 'warn' ? (
              <AlertTriangle className="w-4 h-4 text-[#991B1B] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#1E4620] shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-bold text-xs">{toastMessage.title}</h4>
              <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">{toastMessage.description}</p>
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

      {/* 40 Melhorias: Quick Teacher Requisition Modal */}
      <SchoolQuickRequisitionModal
        isOpen={isRequisitionModalOpen}
        onClose={() => setIsRequisitionModalOpen(false)}
        items={items}
        onDispatchRequisition={handleDispatchRequisition}
      />

      {/* 40 Melhorias: School Consumption Calculator Modal */}
      <SchoolConsumptionCalculatorModal
        isOpen={isCalculatorModalOpen}
        onClose={() => setIsCalculatorModalOpen(false)}
        items={items}
        onNavigateToPurchases={() => setCurrentTab('compras')}
      />

      {/* 40 Melhorias: Data Backup & Accountability Modal */}
      <SchoolDataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        items={items}
        movements={movements}
        loans={loans}
        schoolName={schoolName}
        onRestoreData={handleRestoreData}
      />

      {/* Pedagogical Help Guide Modal */}
      <SchoolHelpGuideModal
        isOpen={isHelpGuideModalOpen}
        onClose={() => setIsHelpGuideModalOpen(false)}
      />
    </div>
  );
}
