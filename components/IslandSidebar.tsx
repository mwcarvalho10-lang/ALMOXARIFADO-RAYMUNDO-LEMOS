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
  Moon, 
  Sun, 
  Search, 
  Camera, 
  Tag, 
  MapPin, 
  Boxes, 
  ClipboardCheck, 
  Leaf, 
  RotateCcw,
  BookOpen,
  Clock,
  X
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
  onResetDefaults: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
  onResetDefaults,
  isDarkMode,
  onToggleDarkMode,
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
      sublabel: 'Histórico & comprovantes',
      icon: ArrowLeftRight,
      badge: null,
    },
    {
      id: 'emprestimos',
      label: 'Empréstimos',
      sublabel: 'Multimídia & aulas',
      icon: Clock,
      badge: overdueLoans > 0 ? `${overdueLoans} atrasado` : null,
      badgeColor: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-rose-950 dark:text-rose-300',
    },
    {
      id: 'alertas',
      label: 'Alertas de Reposição',
      sublabel: 'Estoque mínimo & risco',
      icon: AlertTriangle,
      badge: criticalCount > 0 ? criticalCount : null,
      badgeColor: 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950 dark:text-amber-300',
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
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Island Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-4 z-50 lg:z-30 h-full lg:h-[calc(100vh-2rem)] w-72 lg:w-68 xl:w-72 flex flex-col bg-white dark:bg-[#1A2024] rounded-none lg:rounded-3xl border-r lg:border border-stone-200/80 dark:border-stone-800 shadow-sm transition-transform duration-200 ease-out overflow-hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* School Branding Island Header */}
        <div className="p-4.5 pb-3 border-b border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E8F3EE] dark:bg-emerald-950/60 text-[#245D40] dark:text-emerald-300 flex items-center justify-center shadow-2xs">
                <School className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
                  Almoxarifado
                </span>
                <span className="text-xs text-stone-600 dark:text-stone-300 block">
                  Gestão Escolar
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Fechar menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* School Name Card (Pastel Tint) */}
          <div className="bg-[#F8F9FA] dark:bg-[#14191C] rounded-xl p-2.5 border border-stone-200/60 dark:border-stone-800/60">
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="w-full bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 px-2 py-1 rounded border border-stone-300 dark:border-stone-700 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-200"
                  title="Salvar nome"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate" title={schoolName}>
                    {schoolName}
                  </p>
                  <p className="text-[10px] text-stone-600 dark:text-stone-300">
                    Ano Letivo 2026 · Depósito Ativo
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTempName(schoolName);
                    setIsEditingName(true);
                  }}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 rounded-md transition-colors shrink-0"
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
            <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider px-2 block mb-1">
              Menu Principal
            </span>
            <nav className="space-y-0.5">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left group ${
                      isActive
                        ? 'bg-[#EAF4EE] text-[#1D5137] dark:bg-emerald-950/70 dark:text-emerald-200 shadow-2xs font-semibold'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#245D40] dark:text-emerald-300'
                            : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300'
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
                            ? 'bg-[#D2EEDA] text-[#1D5137] dark:bg-emerald-900 dark:text-emerald-200'
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
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

          {/* School Depot Utilities Section */}
          <div>
            <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 uppercase tracking-wider px-2 block mb-1">
              Ferramentas Escolares
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onOpenKits();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-purple-50 hover:text-purple-900 dark:hover:bg-purple-950/40 dark:hover:text-purple-300 transition-colors text-left"
              >
                <Boxes className="w-3.5 h-3.5 text-purple-500" />
                <span className="truncate">Kits Didáticos por Turma</span>
              </button>

              <button
                onClick={() => {
                  onOpenScanner();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-sky-50 hover:text-sky-900 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 transition-colors text-left"
              >
                <Camera className="w-3.5 h-3.5 text-sky-500" />
                <span className="truncate">Leitor de Código de Barras</span>
              </button>

              <button
                onClick={() => {
                  onOpenLabels();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-amber-50 hover:text-amber-900 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 transition-colors text-left"
              >
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span className="truncate">Etiquetas para Prateleira</span>
              </button>

              <button
                onClick={() => {
                  onOpenMap();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-emerald-50 hover:text-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span className="truncate">Mapa do Depósito / Armários</span>
              </button>

              <button
                onClick={() => {
                  onOpenAudit();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-stone-200 transition-colors text-left"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-stone-500" />
                <span className="truncate">Conferência & Inventário Cego</span>
              </button>

              <button
                onClick={() => {
                  onOpenSustainability();
                  onCloseMobile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-emerald-50 hover:text-emerald-900 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors text-left"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">Depósito Sustentável</span>
              </button>
            </div>
          </div>
        </div>

        {/* Island Sidebar Bottom Bar */}
        <div className="p-3 border-t border-stone-100 dark:border-stone-800/80 bg-[#FAFAFA] dark:bg-[#161B1E] space-y-2">
          {/* Quick search button shortcut */}
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-stone-600 dark:text-stone-400 hover:border-stone-300 text-xs transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-stone-600 dark:text-stone-300">Buscar material...</span>
            </div>
            <kbd className="text-[10px] bg-stone-100 dark:bg-stone-900 px-1.5 py-0.5 rounded text-stone-500 dark:text-stone-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Controls row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 px-2 py-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title={isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-stone-500" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>

            <button
              onClick={onResetDefaults}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Restaurar dados padrão de teste"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
