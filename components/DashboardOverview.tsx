'use client';

import React from 'react';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Cpu, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Gamepad2, 
  Plus, 
  ChevronRight, 
  ShoppingCart, 
  Flame, 
  PieChart 
} from 'lucide-react';
import { InventoryItem, StockMovement, Category, CATEGORIES } from '@/types/inventory';

interface DashboardOverviewProps {
  items: InventoryItem[];
  movements: StockMovement[];
  onSelectCategory: (category: Category | 'todas') => void;
  onNavigateToTab: (tab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras') => void;
  onQuickMovement: (itemId: string, type: 'entrada' | 'saida') => void;
  onOpenCalculator?: () => void;
  isPresentationMode?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  items,
  movements,
  onSelectCategory,
  onNavigateToTab,
  onQuickMovement,
  isPresentationMode = false,
}) => {
  const criticalItems = items.filter((item) => item.quantity <= item.minQuantity);
  const lowItems = items.filter((item) => item.quantity > item.minQuantity && item.quantity <= item.minQuantity * 1.5);
  const capitalItems = items.filter((item) => item.category === 'capital');

  const totalEstimatedValue = items.reduce((acc, curr) => {
    return acc + (curr.quantity * (curr.estimatedUnitCost || 0));
  }, 0);

  const recentMovements = [...movements].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  // Calculate most consumed materials from outgoing movements
  const consumptionMap: Record<string, { name: string; code: string; qty: number; unit: string }> = {};
  movements.filter(m => m.type === 'saida').forEach(m => {
    if (!consumptionMap[m.itemId]) {
      const it = items.find(i => i.id === m.itemId);
      consumptionMap[m.itemId] = {
        name: m.itemName,
        code: m.itemCode,
        qty: 0,
        unit: it?.unit || 'un',
      };
    }
    consumptionMap[m.itemId].qty += m.quantity;
  });

  const topConsumedItems = Object.values(consumptionMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  const getCategoryCount = (cat: Category) => {
    const catItems = items.filter((i) => i.category === cat);
    const catCritical = catItems.filter((i) => i.quantity <= i.minQuantity).length;
    const catTotalQty = catItems.reduce((acc, i) => acc + i.quantity, 0);
    return {
      itemCount: catItems.length,
      totalQty: catTotalQty,
      criticalCount: catCritical,
    };
  };

  const totalItemCount = items.length || 1;
  const papelariaPct = Math.round((items.filter(i => i.category === 'papelaria').length / totalItemCount) * 100);
  const jogosPct = Math.round((items.filter(i => i.category === 'jogos').length / totalItemCount) * 100);
  const capitalPct = Math.round((items.filter(i => i.category === 'capital').length / totalItemCount) * 100);
  const limpezaPct = Math.round((items.filter(i => i.category === 'limpeza').length / totalItemCount) * 100);
  const outrosPct = Math.max(0, 100 - (papelariaPct + jogosPct + capitalPct + limpezaPct));

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'papelaria': return <FileText className="w-4 h-4 text-amber-700" />;
      case 'jogos': return <Gamepad2 className="w-4 h-4 text-purple-700" />;
      case 'capital': return <Cpu className="w-4 h-4 text-sky-700" />;
      case 'limpeza': return <Sparkles className="w-4 h-4 text-emerald-700" />;
      case 'outros': return <Package className="w-4 h-4 text-stone-700" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Luminous Welcome Banner with Elegant Cursive */}
      <div className="bg-gradient-to-r from-[#F0FDF4] via-[#FFFFFF] to-[#FFFBEB] rounded-2xl border border-stone-200/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div>
          <span className="font-cursive text-3xl sm:text-4xl text-[#14532D] block leading-none">
            Almoxarifado & Gestão Pedagógica
          </span>
          <p className="text-xs text-stone-600 font-medium mt-1">
            Depósito escolar organizado em cores claras, caligrafia elegante e alta visibilidade de materiais.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-script text-sm font-semibold text-emerald-900 bg-white px-3 py-1 rounded-xl border border-stone-200 shadow-2xs">
            Ano Letivo 2026
          </span>
        </div>
      </div>

      {/* Calm Pastel Warning Banner (Only if critical items exist) */}
      {criticalItems.length > 0 && (
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-4 sm:p-4.5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900 flex items-center gap-2">
                Aviso: {criticalItems.length} {criticalItems.length === 1 ? 'material está' : 'materiais estão'} com estoque crítico
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Itens como <span className="font-medium text-[#991B1B]">{criticalItems.slice(0, 3).map(i => i.name).join(', ')}</span> atingiram o limite mínimo de segurança para as aulas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => onNavigateToTab('alertas')}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-[#991B1B] bg-[#FEE2E2] hover:bg-[#FCD2D2] border border-[#FECACA] transition-colors shadow-2xs"
            >
              Ver Alertas ({criticalItems.length})
            </button>
            <button
              onClick={() => onNavigateToTab('compras')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-[#991B1B] hover:bg-[#7F1D1D] transition-colors shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Prever Compras
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Island Grid (Clear Light Palette) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Items */}
        <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Total de Materiais</span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] flex items-center justify-center shadow-2xs">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-stone-900 tabular-nums tracking-tight">
              {items.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
              <span className="tabular-nums">{items.reduce((acc, i) => acc + i.quantity, 0)} unidades físicas</span>
              {!isPresentationMode && (
                <span className="font-semibold text-emerald-900 tabular-nums">
                  {totalEstimatedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs hover:border-rose-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Alertas de Reposição</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F5] text-[#991B1B] border border-[#FED7D7] flex items-center justify-center shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-[#991B1B] tabular-nums tracking-tight">
              {criticalItems.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#991B1B] font-semibold">Abaixo da margem</span>
              {lowItems.length > 0 && (
                <span className="text-amber-800 tabular-nums">+{lowItems.length} em atenção</span>
              )}
            </div>
          </div>
        </div>

        {/* Capital Assets */}
        <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs hover:border-sky-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Bens de Capital</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD] flex items-center justify-center shadow-2xs">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-stone-900 tabular-nums tracking-tight">
              {capitalItems.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
              <span>Equipamentos tombados</span>
              <span className="text-sky-900 font-semibold">Patrimônio</span>
            </div>
          </div>
        </div>

        {/* Total Movements */}
        <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Movimentações</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] flex items-center justify-center shadow-2xs">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-stone-900 tabular-nums tracking-tight">
              {movements.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
              <span className="text-emerald-800 font-semibold tabular-nums">
                {movements.filter(m => m.type === 'entrada').length} Entradas
              </span>
              <span className="text-stone-600 font-medium tabular-nums">
                {movements.filter(m => m.type === 'saida').length} Saídas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pastel Category Balance Bar Island */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-stone-400" />
              Composição do Acervo Escolar
            </span>
            <span className="hidden sm:inline font-cursive text-base text-emerald-800 font-normal">
              ~ equilíbrio pedagógico ~
            </span>
          </div>
          <span className="text-stone-500 text-[11px]">
            Didático, lúdico e suporte
          </span>
        </div>

        {/* Multi-segment pastel bar */}
        <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden flex border border-stone-200/40">
          <div style={{ width: `${papelariaPct}%` }} className="bg-[#FED7AA] h-full" title={`Papelaria: ${papelariaPct}%`} />
          <div style={{ width: `${jogosPct}%` }} className="bg-[#DDD6FE] h-full" title={`Jogos: ${jogosPct}%`} />
          <div style={{ width: `${capitalPct}%` }} className="bg-[#BAE6FD] h-full" title={`Capital: ${capitalPct}%`} />
          <div style={{ width: `${limpezaPct}%` }} className="bg-[#BBF7D0] h-full" title={`Limpeza: ${limpezaPct}%`} />
          <div style={{ width: `${outrosPct}%` }} className="bg-stone-300 h-full" title={`Outros: ${outrosPct}%`} />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-600 pt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FED7AA] border border-[#FDBA74]" /> Papelaria ({papelariaPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DDD6FE] border border-[#C4B5FD]" /> Jogos & Lúdico ({jogosPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BAE6FD] border border-[#7DD3FC]" /> Capital & Multimídia ({capitalPct}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BBF7D0] border border-[#86EFAC]" /> Limpeza ({limpezaPct}%)
          </span>
        </div>
      </div>

      {/* Categories Overview Island */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Seções do Depósito Escolar
              </h3>
              <span className="hidden sm:inline font-cursive text-base text-emerald-800 font-normal">
                ~ acervo por área ~
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Acesso rápido organizado por área de material pedagógico e suporte
            </p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('todas');
              onNavigateToTab('estoque');
            }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
          >
            <span>Ver todo o estoque</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(Object.keys(CATEGORIES) as Category[]).map((catKey) => {
            const cat = CATEGORIES[catKey];
            const stats = getCategoryCount(catKey);

            return (
              <div
                key={catKey}
                onClick={() => {
                  onSelectCategory(catKey);
                  onNavigateToTab('estoque');
                }}
                className="group p-3.5 rounded-xl border border-stone-200/70 hover:border-emerald-300 hover:shadow-2xs transition-all cursor-pointer bg-[#FCFDFD] hover:bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-1.5 rounded-lg bg-white border border-stone-200/80 shadow-2xs">
                      {getCategoryIcon(catKey)}
                    </div>
                    {stats.criticalCount > 0 ? (
                      <span className="bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums">
                        {stats.criticalCount} crítico{stats.criticalCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-emerald-800 flex items-center gap-1 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Regular
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                    {cat.shortLabel}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-snug">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 font-medium tabular-nums">
                    {stats.itemCount} {stats.itemCount === 1 ? 'material' : 'materiais'}
                  </span>
                  <span className="text-emerald-800 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                    Acessar &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Watchlist vs Recent Movements + Top Consumed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Critical Stock Watchlist */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FFF5F5] text-[#991B1B] border border-[#FED7D7]">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Materiais com Menor Estoque
                </h3>
                <p className="text-xs text-stone-500">
                  Atenção para reposição antes do término nas salas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('alertas')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
            >
              Ver todos &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {[...items]
              .sort((a, b) => (a.quantity / (a.minQuantity || 1)) - (b.quantity / (b.minQuantity || 1)))
              .slice(0, 5)
              .map((item) => {
                const isCritical = item.quantity <= item.minQuantity;
                const ratio = Math.min(100, Math.round((item.quantity / (item.minQuantity * 2)) * 100));

                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-stone-200/60 bg-[#FAFBF9] hover:bg-white transition-colors flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold text-stone-600 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                          {item.code}
                        </span>
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {item.name}
                        </h4>
                      </div>

                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="w-20 sm:w-28 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.max(8, ratio)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-stone-600 tabular-nums">
                          Estoque: <strong className={isCritical ? 'text-[#991B1B]' : 'text-stone-800'}>{item.quantity}</strong> / mín: {item.minQuantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums border ${
                        isCritical 
                          ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]' 
                          : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
                      }`}>
                        {isCritical ? 'Crítico' : 'Baixo'}
                      </span>
                      <button
                        onClick={() => onQuickMovement(item.id, 'entrada')}
                        className="p-1.5 rounded-lg text-emerald-800 bg-[#EAF6ED] hover:bg-[#D2EEDA] border border-[#CDE5D5] transition-colors shadow-2xs"
                        title="Reabastecer estoque deste material"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Top Consumed in Bimestre & Recent Movements */}
        <div className="lg:col-span-5 space-y-4">
          {/* Top Consumed Materials Card */}
          {topConsumedItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-4.5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  Mais Utilizados nas Salas de Aula
                </span>
                <span className="text-[10px] text-stone-500 font-medium">Dispensado</span>
              </div>
              <div className="space-y-2">
                {topConsumedItems.map((top, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-none">
                    <span className="truncate pr-2 font-medium text-stone-700">
                      {idx + 1}. {top.name}
                    </span>
                    <span className="font-bold text-emerald-800 shrink-0 tabular-nums">
                      {top.qty} {top.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Movements Log */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs p-4.5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900">
                  Últimas Movimentações
                </h3>
                <p className="text-[10px] text-stone-500">
                  Retiradas e entregas recentes
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('movimentacoes')}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950"
              >
                Histórico &rarr;
              </button>
            </div>

            <div className="divide-y divide-stone-100">
              {recentMovements.length === 0 ? (
                <p className="text-xs text-stone-400 py-4 text-center">Nenhuma movimentação registrada.</p>
              ) : (
                recentMovements.map((mov) => {
                  const isEntrada = mov.type === 'entrada';

                  return (
                    <div key={mov.id} className="py-2 flex items-start gap-2.5">
                      <div className={`mt-0.5 p-1 rounded-lg shrink-0 border ${
                        isEntrada 
                          ? 'bg-[#EAF6ED] text-[#1B4D35] border-[#CDE5D5]' 
                          : 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]'
                      }`}>
                        {isEntrada ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {mov.itemName}
                          </h4>
                          <span className={`text-xs font-semibold shrink-0 tabular-nums ${
                            isEntrada ? 'text-emerald-800' : 'text-stone-700'
                          }`}>
                            {isEntrada ? '+' : '-'}{mov.quantity}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">
                          {mov.responsible} {mov.destinationOrReason ? `· ${mov.destinationOrReason}` : ''}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
