'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Edit2, 
  Trash2, 
  Package, 
  Layers, 
  MapPin, 
  FileText, 
  Gamepad2, 
  Cpu, 
  Sparkles,
  ArrowUpDown,
  Tag,
  LayoutGrid,
  List,
  Clock,
  Camera,
  Star,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { InventoryItem, Category, CATEGORIES, GradeCycle } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface InventoryTableProps {
  items: InventoryItem[];
  selectedCategory: Category | 'todas';
  onSelectCategory: (category: Category | 'todas') => void;
  onOpenNewItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onRecordMovement: (itemId: string, type: 'entrada' | 'saida') => void;
  onOpenScanner?: () => void;
  onOpenLabels?: () => void;
  onToggleFavorite?: (itemId: string) => void;
  onQuickAdjust?: (itemId: string, delta: number) => void;
  isPresentationMode?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  onOpenNewItem,
  onEditItem,
  onDeleteItem,
  onRecordMovement,
  onOpenScanner,
  onOpenLabels,
  onToggleFavorite,
  onQuickAdjust,
  isPresentationMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'critico' | 'baixo' | 'normal'>('todos');
  const [cycleFilter, setCycleFilter] = useState<GradeCycle | 'todos'>('todos');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'code' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'todas' && item.category !== selectedCategory) {
          return false;
        }

        // Favorites filter
        if (onlyFavorites && !item.isFavorite) {
          return false;
        }

        // Grade cycle filter
        if (cycleFilter !== 'todos' && item.gradeCycle && item.gradeCycle !== 'todos' && item.gradeCycle !== cycleFilter) {
          return false;
        }

        // Search term filter
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchName = item.name.toLowerCase().includes(term);
          const matchCode = item.code.toLowerCase().includes(term);
          const matchLocation = item.location?.toLowerCase().includes(term);
          const matchBrand = item.brand?.toLowerCase().includes(term);
          const matchPatrimony = item.patrimonyNumber?.toLowerCase().includes(term);
          const matchFunding = item.fundingSource?.toLowerCase().includes(term);
          if (!matchName && !matchCode && !matchLocation && !matchBrand && !matchPatrimony && !matchFunding) {
            return false;
          }
        }

        // Stock status filter
        if (statusFilter === 'critico') {
          return item.quantity <= item.minQuantity;
        }
        if (statusFilter === 'baixo') {
          return item.quantity > item.minQuantity && item.quantity <= item.minQuantity * 1.5;
        }
        if (statusFilter === 'normal') {
          return item.quantity > item.minQuantity * 1.5;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name, 'pt-BR');
        } else if (sortBy === 'quantity') {
          comparison = a.quantity - b.quantity;
        } else if (sortBy === 'code') {
          comparison = a.code.localeCompare(b.code);
        } else if (sortBy === 'category') {
          comparison = a.category.localeCompare(b.category);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [items, selectedCategory, searchTerm, statusFilter, cycleFilter, onlyFavorites, sortBy, sortOrder]);

  const toggleSort = (field: 'name' | 'quantity' | 'code' | 'category') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getCategoryBadge = (cat: Category) => {
    const info = CATEGORIES[cat];
    let icon = <Package className="w-3 h-3" />;
    if (cat === 'papelaria') icon = <FileText className="w-3 h-3" />;
    if (cat === 'jogos') icon = <Gamepad2 className="w-3 h-3" />;
    if (cat === 'capital') icon = <Cpu className="w-3 h-3" />;
    if (cat === 'limpeza') icon = <Sparkles className="w-3 h-3" />;

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${info.badgeBg} ${info.badgeText} border-stone-200/60`}>
        {icon}
        {info.shortLabel}
      </span>
    );
  };

  const getRunwayDays = (item: InventoryItem) => {
    const dailyBurn = (item.targetSemesterStock || item.minQuantity * 2 || 1) / 120;
    const days = Math.round(item.quantity / dailyBurn);
    return Math.max(1, days);
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs Island */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200/80 shadow-2xs flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playBeep('click');
              onSelectCategory('todas');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'todas'
                ? 'bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] shadow-2xs font-semibold'
                : 'text-stone-600 hover:bg-[#F4F7F4] font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Todos ({items.length})
          </button>

          {(Object.keys(CATEGORIES) as Category[]).map((catKey) => {
            const info = CATEGORIES[catKey];
            const count = items.filter((i) => i.category === catKey).length;
            const isSelected = selectedCategory === catKey;

            return (
              <button
                key={catKey}
                onClick={() => {
                  playBeep('click');
                  onSelectCategory(catKey);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] shadow-2xs font-semibold'
                    : 'text-stone-600 hover:bg-[#F4F7F4] font-medium'
                }`}
              >
                {catKey === 'papelaria' && <FileText className="w-3.5 h-3.5 text-amber-600" />}
                {catKey === 'jogos' && <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />}
                {catKey === 'capital' && <Cpu className="w-3.5 h-3.5 text-sky-600" />}
                {catKey === 'limpeza' && <Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
                {catKey === 'outros' && <Package className="w-3.5 h-3.5 text-stone-500" />}
                <span>{info.shortLabel}</span>
                <span className="text-[10px] text-stone-500 tabular-nums font-semibold">({count})</span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="hidden sm:flex items-center gap-0.5 border border-stone-200 rounded-xl p-0.5 bg-stone-50 shrink-0 ml-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-400 hover:text-stone-600'
            }`}
            title="Visualização em Lista / Tabela"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-400 hover:text-stone-600'
            }`}
            title="Visualização em Cards"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar Island */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, código, tombamento, verba (PDDE) ou armário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#FAFBF9] border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Filter Badges & Quick Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorites Star Button */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
              onlyFavorites
                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A] shadow-2xs'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="Mostrar apenas materiais favoritos"
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
            <span>Favoritos</span>
          </button>

          {/* Grade Cycle Filter */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value as any)}
            className="text-xs bg-stone-50 border border-stone-200 text-stone-700 rounded-xl px-2.5 py-1 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="todos">Todos os Ciclos</option>
            <option value="infantil">Ed. Infantil (Creche/Pré)</option>
            <option value="fundamental1">Fundamental I (1º ao 5º)</option>
            <option value="fundamental2">Fundamental II (6º ao 9º)</option>
            <option value="medio">Ensino Médio</option>
            <option value="administrativo">Administrativo/Geral</option>
          </select>

          {/* Status Filter buttons */}
          <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                statusFilter === 'todos' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setStatusFilter('critico')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                statusFilter === 'critico' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'text-stone-500 hover:text-rose-700'
              }`}
            >
              Crítico
            </button>
            <button
              onClick={() => setStatusFilter('baixo')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                statusFilter === 'baixo' ? 'bg-[#FEF3C7] text-[#92400E]' : 'text-stone-500 hover:text-amber-700'
              }`}
            >
              Baixo
            </button>
            <button
              onClick={() => setStatusFilter('normal')}
              className={`px-2 py-1 rounded-lg font-semibold transition-colors ${
                statusFilter === 'normal' ? 'bg-[#EAF6ED] text-[#14532D]' : 'text-stone-500 hover:text-emerald-700'
              }`}
            >
              Normal
            </button>
          </div>

          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="p-1.5 rounded-xl bg-stone-50 text-stone-600 hover:bg-sky-50 hover:text-sky-800 border border-stone-200 transition-colors"
              title="Scanner de Código de Barras"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenLabels && (
            <button
              onClick={onOpenLabels}
              className="p-1.5 rounded-xl bg-stone-50 text-stone-600 hover:bg-amber-50 hover:text-amber-800 border border-stone-200 transition-colors"
              title="Etiquetas para Prateleira"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onOpenNewItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2D6A4F] text-white rounded-xl text-xs font-semibold hover:bg-[#23563F] transition-colors shadow-2xs ml-auto md:ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Material
          </button>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredItems.map((item) => {
            const isCritical = item.quantity <= item.minQuantity;
            const isLow = !isCritical && item.quantity <= item.minQuantity * 1.5;
            const runway = getRunwayDays(item);

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200/80 rounded-2xl p-4 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleFavorite?.(item.id)}
                        className="text-stone-300 hover:text-amber-500 transition-colors"
                        title={item.isFavorite ? 'Remover dos favoritos' : 'Favoritar item'}
                      >
                        <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                      <span className="font-mono text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200/60">
                        {item.code}
                      </span>
                    </div>
                    {getCategoryBadge(item.category)}
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 line-clamp-2">
                    {item.name}
                  </h4>

                  {/* Educational Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {item.isToxicFree && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5]">
                        <ShieldCheck className="w-2.5 h-2.5" /> Atóxico
                      </span>
                    )}
                    {item.fundingSource && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#F0F9FF] text-sky-800 border border-[#BAE6FD]">
                        Verba: {item.fundingSource}
                      </span>
                    )}
                    {item.expirationDate && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" /> Val: {new Date(item.expirationDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-stone-500 mt-2 space-y-1">
                    <div className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{item.location || 'Depósito Central'}</span>
                    </div>
                    {item.patrimonyNumber && (
                      <div className="flex items-center gap-1 text-sky-800 font-mono text-[10px]">
                        <Tag className="w-3 h-3" />
                        <span>Tombamento: {item.patrimonyNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase block font-medium">Estoque</span>
                      <span className={`text-sm font-bold tabular-nums ${
                        isCritical ? 'text-[#991B1B]' : isLow ? 'text-amber-700' : 'text-stone-900'
                      }`}>
                        {item.quantity} <span className="text-[11px] font-normal text-stone-500">{item.unit}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase block font-medium flex items-center justify-end gap-1">
                        <Clock className="w-2.5 h-2.5" /> Duração
                      </span>
                      <span className={`text-[11px] font-semibold tabular-nums ${
                        runway <= 7 ? 'text-[#991B1B]' : runway <= 15 ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        ~{runway} dias
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <div className="flex items-center gap-1">
                      {/* Inline quick adjust */}
                      <button
                        onClick={() => onQuickAdjust?.(item.id, -1)}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded border border-stone-200"
                        title="Diminuir 1 do estoque"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => onQuickAdjust?.(item.id, 1)}
                        className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 bg-[#EAF6ED] hover:bg-[#D2EEDA] rounded border border-[#CDE5D5]"
                        title="Adicionar 1 ao estoque"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => onRecordMovement(item.id, 'entrada')}
                        className="px-2 py-1 text-[11px] font-semibold text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] rounded-lg transition-colors ml-1"
                      >
                        Entrada
                      </button>
                      <button
                        onClick={() => onRecordMovement(item.id, 'saida')}
                        className="px-2 py-1 text-[11px] font-semibold text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] rounded-lg transition-colors"
                      >
                        Saída
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-1 text-stone-400 hover:text-stone-800 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View Island */
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] border-b border-stone-200/80 text-stone-600 font-semibold select-none">
                <tr>
                  <th className="py-2.5 px-3 w-8">★</th>
                  <th onClick={() => toggleSort('code')} className="py-2.5 px-3 cursor-pointer hover:text-stone-900 transition-colors w-24">
                    <div className="flex items-center gap-1">
                      Código
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th onClick={() => toggleSort('name')} className="py-2.5 px-4 cursor-pointer hover:text-stone-900 transition-colors">
                    <div className="flex items-center gap-1">
                      Material / Descrição Escolar
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th onClick={() => toggleSort('category')} className="py-2.5 px-3 cursor-pointer hover:text-stone-900 transition-colors hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      Seção
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 hidden lg:table-cell">
                    Localização no Depósito
                  </th>
                  {!isPresentationMode && (
                    <th className="py-2.5 px-3 text-right hidden xl:table-cell">
                      Custo Unit.
                    </th>
                  )}
                  <th onClick={() => toggleSort('quantity')} className="py-2.5 px-4 cursor-pointer hover:text-stone-900 transition-colors text-right">
                    <div className="flex items-center justify-end gap-1">
                      Estoque Atual
                      <ArrowUpDown className="w-3 h-3 text-stone-400" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 text-center">
                    Status
                  </th>
                  <th className="py-2.5 px-4 text-center w-40">
                    Ações Rápidas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredItems.map((item) => {
                  const isCritical = item.quantity <= item.minQuantity;
                  const isLow = !isCritical && item.quantity <= item.minQuantity * 1.5;

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-[#FAFBF9] transition-colors ${
                        isCritical ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      {/* Favorite Star */}
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onToggleFavorite?.(item.id)}
                          className="text-stone-300 hover:text-amber-500 transition-colors"
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </td>

                      {/* Code */}
                      <td className="py-2.5 px-3 font-mono font-semibold text-stone-600 whitespace-nowrap">
                        <span className="bg-stone-100 px-2 py-0.5 rounded text-[11px] border border-stone-200/60">
                          {item.code}
                        </span>
                      </td>

                      {/* Name & Educational Badges */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-stone-900">
                          {item.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-stone-500">
                          {item.isToxicFree && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5]">
                              <ShieldCheck className="w-2.5 h-2.5" /> Atóxico
                            </span>
                          )}
                          {item.fundingSource && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-[#F0F9FF] text-sky-800 border border-[#BAE6FD]">
                              {item.fundingSource}
                            </span>
                          )}
                          {item.brand && <span>Marca: {item.brand}</span>}
                          {item.patrimonyNumber && (
                            <span className="inline-flex items-center gap-1 text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded font-mono">
                              <Tag className="w-2.5 h-2.5" />
                              Patrimônio: {item.patrimonyNumber}
                            </span>
                          )}
                          <span className="md:hidden">
                            {getCategoryBadge(item.category)}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 hidden md:table-cell whitespace-nowrap">
                        {getCategoryBadge(item.category)}
                      </td>

                      {/* Location */}
                      <td className="py-2.5 px-3 hidden lg:table-cell text-stone-600 text-xs">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate max-w-xs">{item.location || 'Depósito Central'}</span>
                        </div>
                      </td>

                      {/* Estimated Unit Cost (Hidden in presentation mode) */}
                      {!isPresentationMode && (
                        <td className="py-2.5 px-3 text-right hidden xl:table-cell whitespace-nowrap tabular-nums text-stone-600 font-medium">
                          {item.estimatedUnitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                      )}

                      {/* Quantity & Units */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap tabular-nums">
                        <div className="text-xs font-bold text-stone-900">
                          <span className={isCritical ? 'text-[#991B1B]' : isLow ? 'text-amber-700' : 'text-stone-900'}>
                            {item.quantity}
                          </span>{' '}
                          <span className="text-[11px] font-normal text-stone-500">{item.unit}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5">
                          Mín: {item.minQuantity} | ~{getRunwayDays(item)}d
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                            Crítico
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
                            Baixo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5]">
                            Normal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Adjust Buttons */}
                          <button
                            onClick={() => onQuickAdjust?.(item.id, -1)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 border border-stone-200"
                            title="Diminuir 1 (Baixa rápida)"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => onQuickAdjust?.(item.id, 1)}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-800 bg-[#EAF6ED] hover:bg-[#D2EEDA] border border-[#CDE5D5]"
                            title="Adicionar 1 (Entrada rápida)"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onRecordMovement(item.id, 'entrada')}
                            className="p-1 rounded-lg text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors ml-0.5"
                            title="Dar Entrada Formal"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRecordMovement(item.id, 'saida')}
                            className="p-1 rounded-lg text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] transition-colors"
                            title="Dar Baixa Formal"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1 text-stone-400 hover:text-stone-800 transition-colors ml-0.5"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info Island */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-stone-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
        <span>
          Exibindo <strong className="text-stone-800 tabular-nums">{filteredItems.length}</strong> de <strong className="text-stone-800 tabular-nums">{items.length}</strong> materiais escolares
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span> Crítico
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span> Baixo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Regular
          </span>
        </div>
      </div>
    </div>
  );
};
