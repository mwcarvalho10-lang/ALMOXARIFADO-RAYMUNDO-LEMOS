'use client';

import React, { useState } from 'react';
import { 
  Boxes, 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  AlertTriangle, 
  ShoppingCart, 
  Plus, 
  Minus, 
  School, 
  Edit2, 
  Check,
  Search,
  Moon,
  Sun,
  Camera,
  Tag,
  MapPin,
  Clock,
  Leaf,
  ClipboardCheck
} from 'lucide-react';
import { InventoryItem, EquipmentLoan } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface NavbarProps {
  currentTab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos';
  setCurrentTab: (tab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos') => void;
  items: InventoryItem[];
  loans: EquipmentLoan[];
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  onOpenNewItemModal: () => void;
  onOpenMovementModal: (type: 'entrada' | 'saida') => void;
  onOpenCommandPalette: () => void;
  onOpenScanner: () => void;
  onOpenLabels: () => void;
  onOpenMap: () => void;
  onOpenKits: () => void;
  onOpenAudit: () => void;
  onOpenSustainability: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  items,
  loans,
  schoolName,
  onUpdateSchoolName,
  onOpenNewItemModal,
  onOpenMovementModal,
  onOpenCommandPalette,
  onOpenScanner,
  onOpenLabels,
  onOpenMap,
  onOpenKits,
  onOpenAudit,
  onOpenSustainability,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(schoolName);

  const criticalCount = items.filter((item) => item.quantity <= item.minQuantity).length;
  const overdueLoansCount = loans.filter((l) => l.status === 'atrasado').length;

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateSchoolName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#fbfdfb] dark:bg-[#0c1711] border-b border-[#d8eadc] dark:border-[#1d3527] shadow-xs transition-colors backdrop-blur-md">
      {/* Top Banner / School Info in Soft Pastel Green */}
      <div className="bg-[#e7f4eb] dark:bg-[#112318] text-[#194c2d] dark:text-[#a8e2bc] border-b border-[#d2ebdb] dark:border-[#1c3a27] text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#d2edd9] dark:bg-[#193a26] text-[#18552f] dark:text-[#9de4b7] flex items-center justify-center shrink-0">
              <School className="w-3.5 h-3.5" />
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="bg-white dark:bg-[#1a3524] text-[#194c2d] dark:text-[#e4f6ec] text-xs px-2 py-0.5 rounded-lg border border-[#348a57] focus:outline-hidden"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-[#207242] dark:text-[#83e0a6] hover:text-[#144d2b] p-0.5"
                  title="Salvar nome"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#144829] dark:text-[#d3f4e1] tracking-tight">{schoolName}</span>
                <button
                  onClick={() => {
                    setTempName(schoolName);
                    setIsEditingName(true);
                  }}
                  className="text-[#477356] dark:text-[#7fb896] hover:text-[#18532f] p-0.5 transition-colors"
                  title="Alterar identificação da unidade escolar"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <span className="text-[#96bfa5] hidden sm:inline">•</span>
            <span className="text-[#3c6b4e] dark:text-[#83b497] hidden sm:inline text-[11px] font-medium">
              Almoxarifado & Controle Patrimonial Sustentável
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#245336]">
            {/* Command palette pill trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 bg-[#f4faf6] dark:bg-[#162e20] hover:bg-[#dff2e5] dark:hover:bg-[#1f3f2c] text-[#1f5634] dark:text-[#a8e2bc] px-2.5 py-0.5 rounded-full border border-[#cbe4d4] dark:border-[#244b34] text-[11px] font-semibold transition-colors shadow-2xs"
            >
              <Search className="w-3 h-3 text-[#2f754b]" />
              <span>Busca Rápida</span>
              <kbd className="text-[9px] bg-[#e0f1e6] dark:bg-[#0f2116] px-1 py-0.2 rounded text-[#2a5e3d] dark:text-[#8acfa5] font-mono font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => {
                playBeep('click');
                onToggleDarkMode();
              }}
              className="p-1.5 rounded-full bg-[#f4faf6] dark:bg-[#162e20] hover:bg-[#dff2e5] dark:hover:bg-[#1f3f2c] text-[#285f3d] dark:text-[#a8e2bc] border border-[#cbe4d4] dark:border-[#244b34] transition-colors"
              title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Critical alert badge in pastel */}
            {criticalCount > 0 ? (
              <button
                onClick={() => setCurrentTab('alertas')}
                className="flex items-center gap-1.5 bg-[#feeceb] dark:bg-[#2b1615] text-[#9b2c28] dark:text-[#fca5a5] border border-[#f9c7c4] dark:border-[#4d1f1d] px-2.5 py-0.5 rounded-full hover:bg-[#fcdcd9] transition-colors font-bold text-[11px]"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <span>{criticalCount} {criticalCount === 1 ? 'crítico' : 'críticos'}</span>
              </button>
            ) : (
              <span className="text-[#1f663a] dark:text-[#8ee2ae] bg-[#daf0e2] dark:bg-[#153422] border border-[#c3e6cf] dark:border-[#204930] px-2 py-0.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Estoque Equilibrado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3aa36b] to-[#1f7043] flex items-center justify-center text-white shadow-md shadow-[#3aa36b]/20">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#143d24] dark:text-[#e4f6ec] tracking-tight">
                  Almoxarifado Escolar
                </h1>
                <span className="hidden md:inline-block bg-[#e1f3e7] dark:bg-[#193a26] text-[#1b5c35] dark:text-[#a0e2ba] border border-[#cde8d5] dark:border-[#234d32] text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                  Depósito Central
                </span>
              </div>
              <p className="text-xs text-[#527d63] dark:text-[#8ab89c] hidden sm:block">
                Papelaria • Jogos • Capital • Limpeza
              </p>
            </div>
          </div>

          {/* Quick Tools & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Tools modal openers in pastel sage */}
            <button
              onClick={onOpenScanner}
              className="p-2 text-[#245336] dark:text-[#9edcb7] bg-[#edf6f0] dark:bg-[#14281d] hover:bg-[#d8eedf] dark:hover:bg-[#1b3727] border border-[#cbe4d3] dark:border-[#224430] rounded-xl transition-colors hidden sm:inline-flex"
              title="Scanner de Código de Barras / Câmera"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLabels}
              className="p-2 text-[#245336] dark:text-[#9edcb7] bg-[#edf6f0] dark:bg-[#14281d] hover:bg-[#d8eedf] dark:hover:bg-[#1b3727] border border-[#cbe4d3] dark:border-[#224430] rounded-xl transition-colors hidden sm:inline-flex"
              title="Gerador de Etiquetas Adesivas (Padrão Folha A4)"
            >
              <Tag className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenMap}
              className="p-2 text-[#245336] dark:text-[#9edcb7] bg-[#edf6f0] dark:bg-[#14281d] hover:bg-[#d8eedf] dark:hover:bg-[#1b3727] border border-[#cbe4d3] dark:border-[#224430] rounded-xl transition-colors hidden md:inline-flex"
              title="Planta 2D do Depósito"
            >
              <MapPin className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenKits}
              className="p-2 text-[#245336] dark:text-[#9edcb7] bg-[#edf6f0] dark:bg-[#14281d] hover:bg-[#d8eedf] dark:hover:bg-[#1b3727] border border-[#cbe4d3] dark:border-[#224430] rounded-xl transition-colors hidden md:inline-flex"
              title="Kits Escolares Prontos"
            >
              <Package className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAudit}
              className="p-2 text-[#245336] dark:text-[#9edcb7] bg-[#edf6f0] dark:bg-[#14281d] hover:bg-[#d8eedf] dark:hover:bg-[#1b3727] border border-[#cbe4d3] dark:border-[#224430] rounded-xl transition-colors hidden lg:inline-flex"
              title="Inventário Cego de Auditoria"
            >
              <ClipboardCheck className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSustainability}
              className="p-2 text-[#245336] dark:text-[#9edcb7] bg-[#edf6f0] dark:bg-[#14281d] hover:bg-[#d8eedf] dark:hover:bg-[#1b3727] border border-[#cbe4d3] dark:border-[#224430] rounded-xl transition-colors hidden lg:inline-flex"
              title="Painel de Sustentabilidade (Depósito Verde)"
            >
              <Leaf className="w-4 h-4 text-emerald-600" />
            </button>

            {/* Quick Entrada & Saída in Pastel Tones */}
            <button
              onClick={() => onOpenMovementModal('entrada')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl text-[#14532d] bg-[#ddf2e3] hover:bg-[#cfeada] border border-[#b8e2c4] transition-colors shadow-2xs"
              title="Registrar recebimento de materiais"
            >
              <Plus className="w-4 h-4 text-[#166534]" />
              <span className="hidden xs:inline">Registrar</span> Entrada
            </button>

            <button
              onClick={() => onOpenMovementModal('saida')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl text-[#8e2926] bg-[#feeee8] hover:bg-[#fbdcd5] border border-[#f8c9c4] transition-colors shadow-2xs"
              title="Registrar retirada de materiais por professores ou funcionários"
            >
              <Minus className="w-4 h-4 text-[#a3322f]" />
              <span className="hidden xs:inline">Registrar</span> Saída
            </button>

            <button
              onClick={onOpenNewItemModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-[#348a57] hover:bg-[#2b7549] shadow-sm shadow-[#348a57]/25 transition-all"
              title="Cadastrar novo item no depósito"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo</span> Material
            </button>
          </div>
        </div>

        {/* Tab Navigation in Soft Sage Green */}
        <nav className="flex space-x-1 sm:space-x-1.5 border-t border-[#dcebe0] dark:border-[#1d3828] pt-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm transition-all whitespace-nowrap rounded-t-xl ${
              currentTab === 'dashboard'
                ? 'border-b-2 border-[#348a57] text-[#144b28] dark:text-[#a8e6be] bg-[#edf7f1] dark:bg-[#153121] font-bold shadow-2xs'
                : 'text-[#486e57] dark:text-[#8ea998] hover:text-[#174e2c] dark:hover:text-[#c4e8d2] hover:bg-[#f2f8f4]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Visão Geral
          </button>

          <button
            onClick={() => setCurrentTab('estoque')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm transition-all whitespace-nowrap rounded-t-xl ${
              currentTab === 'estoque'
                ? 'border-b-2 border-[#348a57] text-[#144b28] dark:text-[#a8e6be] bg-[#edf7f1] dark:bg-[#153121] font-bold shadow-2xs'
                : 'text-[#486e57] dark:text-[#8ea998] hover:text-[#174e2c] dark:hover:text-[#c4e8d2] hover:bg-[#f2f8f4]'
            }`}
          >
            <Package className="w-4 h-4" />
            Estoque & Seções
            <span className="bg-[#dcf0e2] dark:bg-[#1a3a27] text-[#16542f] dark:text-[#a3e2bc] border border-[#c5e6ce] dark:border-[#234e33] text-xs px-2 py-0.2 rounded-full font-mono font-bold">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('movimentacoes')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm transition-all whitespace-nowrap rounded-t-xl ${
              currentTab === 'movimentacoes'
                ? 'border-b-2 border-[#348a57] text-[#144b28] dark:text-[#a8e6be] bg-[#edf7f1] dark:bg-[#153121] font-bold shadow-2xs'
                : 'text-[#486e57] dark:text-[#8ea998] hover:text-[#174e2c] dark:hover:text-[#c4e8d2] hover:bg-[#f2f8f4]'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            Entradas & Saídas
          </button>

          <button
            onClick={() => setCurrentTab('emprestimos')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm transition-all whitespace-nowrap rounded-t-xl ${
              currentTab === 'emprestimos'
                ? 'border-b-2 border-[#348a57] text-[#144b28] dark:text-[#a8e6be] bg-[#edf7f1] dark:bg-[#153121] font-bold shadow-2xs'
                : 'text-[#486e57] dark:text-[#8ea998] hover:text-[#174e2c] dark:hover:text-[#c4e8d2] hover:bg-[#f2f8f4]'
            }`}
          >
            <Clock className="w-4 h-4" />
            Empréstimos & Prazos
            {overdueLoansCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {overdueLoansCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('alertas')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm transition-all whitespace-nowrap rounded-t-xl ${
              currentTab === 'alertas'
                ? 'border-b-2 border-rose-500 text-rose-800 dark:text-rose-300 bg-rose-50/70 dark:bg-rose-950/40 font-bold shadow-2xs'
                : 'text-[#486e57] dark:text-[#8ea998] hover:text-[#174e2c] dark:hover:text-[#c4e8d2] hover:bg-[#f2f8f4]'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            Alertas de Reposição
            {criticalCount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-1.5 py-0.2 rounded-full font-bold">
                {criticalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('compras')}
            className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm transition-all whitespace-nowrap rounded-t-xl ${
              currentTab === 'compras'
                ? 'border-b-2 border-[#348a57] text-[#144b28] dark:text-[#a8e6be] bg-[#edf7f1] dark:bg-[#153121] font-bold shadow-2xs'
                : 'text-[#486e57] dark:text-[#8ea998] hover:text-[#174e2c] dark:hover:text-[#c4e8d2] hover:bg-[#f2f8f4]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Lista Semestral de Compras
          </button>
        </nav>
      </div>
    </header>
  );
};
