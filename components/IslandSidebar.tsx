'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  AlertTriangle, 
  ShoppingCart, 
  School, 
  Edit2, 
  Check, 
  Search, 
  Camera, 
  Tag, 
  MapPin, 
  Boxes, 
  ClipboardCheck, 
  Leaf, 
  RotateCcw,
  Clock,
  X,
  GraduationCap,
  Calculator,
  Database,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { InventoryItem, EquipmentLoan } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface IslandSidebarProps {
  currentTab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos';
  setCurrentTab: (tab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos') => void;
  items: InventoryItem[];
  loans: EquipmentLoan[];
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  onOpenCommandPalette: () => void;
  onOpenScanner: () => void;
  onOpenLabels: () => void;
  onOpenMap: () => void;
  onOpenKits: () => void;
  onOpenAudit: () => void;
  onOpenSustainability: () => void;
  onOpenRequisition: () => void;
  onOpenCalculator: () => void;
  onOpenBackup: () => void;
  onOpenHelpGuide: () => void;
  onResetDefaults: () => void;
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const IslandSidebar: React.FC<IslandSidebarProps> = ({
  currentTab,
  setCurrentTab,
  items,
  loans,
  schoolName,
  onUpdateSchoolName,
  onOpenCommandPalette,
  onOpenScanner,
  onOpenLabels,
  onOpenMap,
  onOpenKits,
  onOpenAudit,
  onOpenSustainability,
  onOpenRequisition,
  onOpenCalculator,
  onOpenBackup,
  onOpenHelpGuide,
  onResetDefaults,
  isPresentationMode,
  onTogglePresentationMode,
  mobileOpen,
  onCloseMobile,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(schoolName);

  const criticalCount = items.filter((item) => item.quantity <= item.minQuantity).length;
  const overdueLoans = loans.filter((l) => l.status === 'atrasado').length;

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateSchoolName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      sublabel: 'Resumo & indicadores',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'estoque',
      label: 'Inventário Escolar',
      sublabel: 'Materiais & categorias',
      icon: Package,
      badge: items.length,
    },
    {
      id: 'movimentacoes',
      label: 'Entradas & Saídas',
      sublabel: 'Histórico & turmas',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'emprestimos',
      label: 'Empréstimos',
      sublabel: 'Multimídia & aulas',
      icon: Clock,
      badge: overdueLoans > 0 ? `${overdueLoans} atrasado` : null,
      badgeColor: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]',
    },
    {
      id: 'alertas',
      label: 'Alertas de Reposição',
      sublabel: 'Estoque mínimo & risco',
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
    },
    {
      id: 'compras',
      label: 'Planejamento Semestral',
      sublabel: 'Previsão para o ano letivo',
      icon: ShoppingCart,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Island Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-4 z-50 lg:z-30 h-full lg:h-[calc(100vh-2rem)] w-72 lg:w-68 xl:w-72 flex flex-col bg-white rounded-none lg:rounded-3xl border-r lg:border border-stone-200/80 shadow-sm transition-transform duration-200 ease-out overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* School Branding Island Header */}
        <div className="p-4.5 pb-3 border-b border-stone-100 bg-[#FCFDFD]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EAF6ED] text-[#1B4D35] border border-[#CDE5D5] flex items-center justify-center shadow-2xs">
                <School className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="font-cursive text-2xl text-[#14532D] font-normal leading-none block">
                  Almoxarifado
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block">
                  Gestão Escolar
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* School Name Card (Luminous Pastel Clear Tint) */}
          <div className="bg-[#FAFBF9] rounded-xl p-2.5 border border-stone-200/80 shadow-2xs">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full bg-white text-xs text-stone-900 px-2 py-1 rounded border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  title="Salvar nome"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="font-script text-base font-semibold text-stone-900 truncate leading-snug" title={schoolName}>
                    {schoolName}
                  </p>
                  <p className="text-[10px] text-stone-600 font-medium">
                    Ano Letivo 2026 · Depósito Ativo
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTempName(schoolName);
                    setIsEditingName(true);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors shrink-0"
                  title="Editar nome da escola"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation and Tools Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Navigation Tabs */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                Menu Principal
              </span>
              <span className="font-cursive text-sm text-emerald-800 font-normal">rotina</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playBeep('click');
                      setCurrentTab(item.id as any);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left group ${
                      isActive
                        ? 'bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] shadow-2xs font-semibold'
                        : 'text-stone-600 hover:bg-[#F4F7F4] hover:text-stone-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#1B4D35]'
                            : 'text-stone-400 group-hover:text-stone-700'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ml-1.5 tabular-nums ${
                          item.badgeColor
                            ? item.badgeColor
                            : isActive
                            ? 'bg-[#D2EEDA] text-[#14532D]'
                            : 'bg-stone-100 text-stone-600 border border-stone-200/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Teacher Actions */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                Rotina do Professor
              </span>
              <span className="font-cursive text-sm text-purple-700 font-normal">pedagógico</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenRequisition();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-950 bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] transition-colors text-left shadow-2xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Requisição para Aula</span>
              </button>

              <button
                onClick={() => {
                  onOpenCalculator();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-950 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] transition-colors text-left shadow-2xs"
              >
                <Calculator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Calculadora por Aluno</span>
              </button>
            </div>
          </div>

          {/* School Depot Utilities Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                Ferramentas do Depósito
              </span>
              <span className="font-cursive text-sm text-emerald-800 font-normal">organização</span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onOpenKits();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-purple-900 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#E9D5FF] transition-colors text-left"
              >
                <Boxes className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">Kits Didáticos por Turma</span>
              </button>

              <button
                onClick={() => {
                  onOpenScanner();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-sky-900 bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] transition-colors text-left"
              >
                <Camera className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span className="truncate">Leitor de Código de Barras</span>
              </button>

              <button
                onClick={() => {
                  onOpenLabels();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-amber-900 bg-[#FFFBEB] hover:bg-[#FEF3C7] border border-[#FDE68A] transition-colors text-left"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Etiquetas para Prateleira</span>
              </button>

              <button
                onClick={() => {
                  onOpenMap();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-900 bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Mapa do Depósito / Armários</span>
              </button>

              <button
                onClick={() => {
                  onOpenAudit();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-800 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] transition-colors text-left"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">Conferência & Inventário Cego</span>
              </button>

              <button
                onClick={() => {
                  onOpenSustainability();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-emerald-900 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#BBF7D0] transition-colors text-left"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Depósito Sustentável</span>
              </button>

              <button
                onClick={() => {
                  onOpenBackup();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-800 bg-[#FAFAF9] hover:bg-[#F5F5F4] border border-[#E7E5E4] transition-colors text-left"
              >
                <Database className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span className="truncate">Backup & Prestação de Contas</span>
              </button>

              <button
                onClick={() => {
                  onOpenHelpGuide();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-teal-900 bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] transition-colors text-left"
              >
                <HelpCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate">Guia Rápido do Almoxarifado</span>
              </button>
            </div>
          </div>
        </div>

        {/* Island Sidebar Bottom Bar (Luminous Clear) */}
        <div className="p-3 border-t border-stone-100 bg-[#FCFDFD] space-y-2">
          {/* Quick search button shortcut */}
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:border-stone-300 text-xs transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-700">Buscar material...</span>
            </div>
            <kbd className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600 font-mono border border-stone-200">
              ⌘K
            </kbd>
          </button>

          {/* Presentation Mode Toggle */}
          <button
            onClick={onTogglePresentationMode}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-colors ${
              isPresentationMode
                ? 'bg-[#FEF3C7] text-[#92400E] font-semibold border border-[#FDE68A]'
                : 'text-stone-600 hover:bg-stone-50 border border-transparent'
            }`}
            title="Oculta valores em R$ para exibição em reuniões pedagógicas"
          >
            <div className="flex items-center gap-1.5">
              {isPresentationMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Modo Reunião Docente</span>
            </div>
            <span className="text-[9px] uppercase tracking-wider">{isPresentationMode ? 'Ativo' : 'Padrão'}</span>
          </button>

          {/* Reset data row */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
            <span className="font-cursive text-base text-emerald-800">Depósito Escolar</span>
            <button
              onClick={onResetDefaults}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors"
              title="Restaurar dados padrão de teste"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
