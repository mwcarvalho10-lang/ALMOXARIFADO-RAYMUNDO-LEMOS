'use client';

import React from 'react';
import { 
  Menu, 
  Search, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight,
  School,
  ChevronRight
} from 'lucide-react';
import { playBeep } from '@/lib/audio';

interface IslandHeaderProps {
  currentTab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras' | 'emprestimos';
  schoolName: string;
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewItem: () => void;
  onOpenMovement: (type: 'entrada' | 'saida') => void;
}

const TAB_TITLES: Record<IslandHeaderProps['currentTab'], { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Visão Geral',
    subtitle: 'Painel executivo do almoxarifado escolar',
  },
  estoque: {
    title: 'Inventário de Materiais',
    subtitle: 'Papelaria, jogos, capital e limpeza',
  },
  movimentacoes: {
    title: 'Fluxo de Entradas & Saídas',
    subtitle: 'Histórico de retiradas docentes e reposições',
  },
  emprestimos: {
    title: 'Empréstimos de Equipamentos',
    subtitle: 'Controle de projetores, caixas de som e notebooks',
  },
  alertas: {
    title: 'Alertas de Reposição',
    subtitle: 'Materiais com estoque abaixo da margem de segurança',
  },
  compras: {
    title: 'Planejamento de Compras',
    subtitle: 'Previsão semestral de materiais para o ano letivo',
  },
};

export const IslandHeader: React.FC<IslandHeaderProps> = ({
  currentTab,
  schoolName,
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenNewItem,
  onOpenMovement,
}) => {
  const currentInfo = TAB_TITLES[currentTab];

  return (
    <header className="bg-white dark:bg-[#1A2024] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs p-3.5 sm:px-5 flex items-center justify-between gap-3 transition-colors">
      {/* Left: Mobile hamburger + Contextual Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
          aria-label="Abrir menu lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300">
            <span className="truncate max-w-[120px] sm:max-w-[200px]">{schoolName}</span>
            <ChevronRight className="w-3 h-3 text-stone-300 dark:text-stone-600 shrink-0" />
            <span className="text-stone-600 dark:text-stone-300 font-medium whitespace-nowrap">Depósito</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 truncate tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick Pastel Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 dark:text-stone-300 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/80 dark:hover:bg-stone-800 rounded-xl border border-stone-200/70 dark:border-stone-700/70 transition-colors"
          title="Buscar material (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span>Buscar</span>
          <kbd className="text-[10px] text-stone-400 dark:text-stone-500 font-mono ml-0.5">⌘K</kbd>
        </button>

        {/* Pastel Entry Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenMovement('entrada');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#1E4620] bg-[#EAF4EE] hover:bg-[#DCEEE2] border border-[#CFE7D8] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70 transition-colors shadow-2xs whitespace-nowrap"
          title="Dar entrada de materiais no depósito"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-[#245D40] dark:text-emerald-400" />
          <span className="hidden sm:inline">Nova</span> Entrada
        </button>

        {/* Pastel Exit Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenMovement('saida');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#8C3F1B] bg-[#FFF4ED] hover:bg-[#FFE8DC] border border-[#FED7AA] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70 transition-colors shadow-2xs whitespace-nowrap"
          title="Registrar saída / baixa de material"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-[#B45309] dark:text-amber-400" />
          <span className="hidden sm:inline">Registrar</span> Saída
        </button>

        {/* Primary Soft Sage New Item Button */}
        <button
          onClick={() => {
            playBeep('click');
            onOpenNewItem();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-[#2D6A4F] hover:bg-[#23563F] dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shadow-2xs whitespace-nowrap"
          title="Cadastrar novo material escolar"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Item</span>
        </button>
      </div>
    </header>
  );
};
