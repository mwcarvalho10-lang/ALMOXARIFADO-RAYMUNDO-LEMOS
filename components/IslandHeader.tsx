'use client';

import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  GraduationCap,
  ChevronRight,
  EyeOff
} from 'lucide-react';
import { playBeep } from '@/lib/audio';

interface IslandHeaderProps {
  currentTab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos';
  schoolName: string;
  isPresentationMode?: boolean;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewItem: () => void;
  onOpenMovement: (type: 'entrada' | 'saida') => void;
  onOpenRequisition: () => void;
}

const TAB_TITLES: Record<IslandHeaderProps['currentTab'], { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Visão Geral',
    subtitle: 'painel executivo & indicadores',
  },
  estoque: {
    title: 'Inventário de Materiais',
    subtitle: 'papelaria, jogos, capital e limpeza',
  },
  movimentacoes: {
    title: 'Fluxo de Entradas & Saídas',
    subtitle: 'histórico de retiradas docentes',
  },
  emprestimos: {
    title: 'Empréstimos de Equipamentos',
    subtitle: 'projetores, caixas de som e notebooks',
  },
  alertas: {
    title: 'Alertas de Reposição',
    subtitle: 'margem mínima de segurança',
  },
  compras: {
    title: 'Planejamento de Compras',
    subtitle: 'previsão para o ano letivo',
  },
};

export const IslandHeader: React.FC<IslandHeaderProps> = ({
  currentTab,
  schoolName,
  isPresentationMode,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenNewItem,
  onOpenMovement,
  onOpenRequisition,
}) => {
  const currentInfo = TAB_TITLES[currentTab];

  return (
    <header className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-3 sm:px-5 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger + Contextual Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors shrink-0"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="font-script text-sm font-semibold text-emerald-950 truncate max-w-[120px] sm:max-w-[200px]">
              {schoolName}
            </span>
            <ChevronRight className="w-3 h-3 text-stone-300 shrink-0" />
            <span className="text-stone-600 font-medium whitespace-nowrap">Depósito Escolar</span>
            {isPresentationMode && (
              <span className="ml-1 inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <EyeOff className="w-2.5 h-2.5" /> Reunião Docente
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-base sm:text-lg font-bold text-stone-900 truncate tracking-tight">
              {currentInfo.title}
            </h1>
            <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal select-none">
              ~ {currentInfo.subtitle} ~
            </span>
          </div>
        </div>
      </div>

      {/* Right: Quick Clear Pastel Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors shadow-2xs"
          title="Buscar material (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span>Buscar</span>
          <kbd className="text-[10px] text-stone-500 font-mono ml-0.5">⌘K</kbd>
        </button>

        {/* Quick Teacher Requisition Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenRequisition();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-purple-950 bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] transition-colors shadow-2xs whitespace-nowrap"
          title="Pedido rápido de materiais para aula"
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
          <span className="hidden sm:inline">Pedido</span> Sala
        </button>

        {/* Pastel Entry Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenMovement('entrada');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors shadow-2xs whitespace-nowrap"
          title="Dar entrada de materiais no depósito"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
          <span className="hidden sm:inline">Nova</span> Entrada
        </button>

        {/* Pastel Exit Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenMovement('saida');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] transition-colors shadow-2xs whitespace-nowrap"
          title="Registrar saída / baixa de material"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-[#EA580C]" />
          <span className="hidden sm:inline">Registrar</span> Saída
        </button>

        {/* Primary Soft Botanical New Item Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenNewItem();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-[#2D6A4F] hover:bg-[#23563F] transition-colors shadow-2xs whitespace-nowrap"
          title="Cadastrar novo material escolar"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Item</span>
        </button>
      </div>
    </header>
  );
};
