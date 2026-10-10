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
  Clock
} from 'lucide-react';
import { InventoryItem, StockMovement, Category, CATEGORIES } from '@/types/inventory';

interface DashboardOverviewProps {
  items: InventoryItem[];
  movements: StockMovement[];
  onSelectCategory: (category: Category | 'todas') => void;
  onNavigateToTab: (tab: 'dashboard' | 'estoque' | 'movimentacoes' | 'alertas' | 'compras') => void;
  onQuickMovement: (itemId: string, type: 'entrada' | 'saida') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  items,
  movements,
  onSelectCategory,
  onNavigateToTab,
  onQuickMovement,
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

  const getCategoryIcon = (cat: Category) => {
    switch (cat) {
      case 'papelaria': return <FileText className="w-4 h-4 text-amber-700 dark:text-amber-300" />;
      case 'jogos': return <Gamepad2 className="w-4 h-4 text-purple-700 dark:text-purple-300" />;
      case 'capital': return <Cpu className="w-4 h-4 text-sky-700 dark:text-sky-300" />;
      case 'limpeza': return <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />;
      case 'outros': return <Package className="w-4 h-4 text-stone-700 dark:text-stone-300" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Calm Pastel Warning Banner (Only if critical items exist) */}
      {criticalItems.length > 0 && (
        <div className="bg-[#FFF5F5] dark:bg-rose-950/40 border border-[#FED7D7] dark:border-rose-900/60 rounded-2xl p-4 sm:p-4.5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FEE2E2] dark:bg-rose-900/80 text-[#991B1B] dark:text-rose-200 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Aviso: {criticalItems.length} {criticalItems.length === 1 ? 'material está' : 'materiais estão'} com estoque crítico
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Itens como <span className="font-medium text-[#991B1B] dark:text-rose-300">{criticalItems.slice(0, 3).map(i => i.name).join(', ')}</span> atingiram o limite mínimo de segurança para as aulas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => onNavigateToTab('alertas')}
              className="px-3 py-1.5 text-xs font-medium rounded-xl text-[#991B1B] dark:text-rose-200 bg-[#FEE2E2] hover:bg-[#FCD2D2] dark:bg-rose-900/60 dark:hover:bg-rose-900 transition-colors"
            >
              Ver Alertas ({criticalItems.length})
            </button>
            <button
              onClick={() => onNavigateToTab('compras')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-white bg-[#991B1B] hover:bg-[#7F1D1D] dark:bg-rose-700 dark:hover:bg-rose-600 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Prever Compras
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Island Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Items */}
        <div className="bg-white dark:bg-[#1A2024] rounded-2xl p-4.5 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Total de Materiais</span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF4EE] dark:bg-emerald-950/60 text-[#245D40] dark:text-emerald-300 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums tracking-tight">
              {items.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="tabular-nums">{items.reduce((acc, i) => acc + i.quantity, 0)} unidades físicas</span>
              <span className="font-medium text-stone-700 dark:text-stone-300 tabular-nums">
                {totalEstimatedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white dark:bg-[#1A2024] rounded-2xl p-4.5 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Alertas de Reposição</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF5F5] dark:bg-rose-950/60 text-[#991B1B] dark:text-rose-300 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-[#991B1B] dark:text-rose-300 tabular-nums tracking-tight">
              {criticalItems.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#991B1B] dark:text-rose-300 font-medium">Abaixo da margem</span>
              {lowItems.length > 0 && (
                <span className="text-amber-700 dark:text-amber-400 tabular-nums">+{lowItems.length} em atenção</span>
              )}
            </div>
          </div>
        </div>

        {/* Capital Assets */}
        <div className="bg-white dark:bg-[#1A2024] rounded-2xl p-4.5 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Bens de Capital</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] dark:bg-sky-950/60 text-[#0369A1] dark:text-sky-300 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums tracking-tight">
              {capitalItems.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              <span>Equipamentos tombados</span>
              <span className="text-sky-700 dark:text-sky-300 font-medium">Patrimônio</span>
            </div>
          </div>
        </div>

        {/* Total Movements */}
        <div className="bg-white dark:bg-[#1A2024] rounded-2xl p-4.5 border border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Movimentações</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F3FF] dark:bg-purple-950/60 text-[#6D28D9] dark:text-purple-300 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100 tabular-nums tracking-tight">
              {movements.length}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500 dark:text-stone-400">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
                {movements.filter(m => m.type === 'entrada').length} Entradas
              </span>
              <span className="text-stone-500 dark:text-stone-400 font-medium tabular-nums">
                {movements.filter(m => m.type === 'saida').length} Saídas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Overview Island */}
      <div className="bg-white dark:bg-[#1A2024] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
              Seções do Depósito Escolar
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Acesso rápido organizado por área de material pedagógico e suporte
            </p>
          </div>
          <button
            onClick={() => {
              onSelectCategory('todas');
              onNavigateToTab('estoque');
            }}
            className="text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 flex items-center gap-1 transition-colors"
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
                className="group p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xs transition-all cursor-pointer bg-[#FBFBFA] dark:bg-[#14191C] hover:bg-white dark:hover:bg-[#1A2024] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700/60 shadow-2xs">
                      {getCategoryIcon(catKey)}
                    </div>
                    {stats.criticalCount > 0 ? (
                      <span className="bg-[#FEE2E2] text-[#991B1B] dark:bg-rose-950 dark:text-rose-300 text-[10px] font-semibold px-2 py-0.5 rounded-md tabular-nums">
                        {stats.criticalCount} crítico{stats.criticalCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1 text-[10px] font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Regular
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {cat.shortLabel}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-1 leading-snug">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-200/60 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-600 dark:text-stone-400 font-medium tabular-nums">
                    {stats.itemCount} {stats.itemCount === 1 ? 'material' : 'materiais'}
                  </span>
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                    Acessar &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Watchlist vs Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Critical Stock Watchlist */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1A2024] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#FFF5F5] dark:bg-rose-950/60 text-[#991B1B] dark:text-rose-300">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Materiais com Menor Estoque
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Atenção para reposição antes do término nas salas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToTab('alertas')}
              className="text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:text-emerald-950"
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
                    className="p-3 rounded-xl border border-stone-200/60 dark:border-stone-800/80 bg-[#FAFAFA] dark:bg-[#14191C] hover:bg-white dark:hover:bg-[#1A2024] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-medium text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                          {item.code}
                        </span>
                        <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {item.name}
                        </h4>
                      </div>

                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="w-20 sm:w-28 bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.max(8, ratio)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 tabular-nums">
                          Estoque: <strong className={isCritical ? 'text-[#991B1B] dark:text-rose-300' : 'text-stone-800 dark:text-stone-200'}>{item.quantity}</strong> / mín: {item.minQuantity} {item.unit}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md tabular-nums ${
                        isCritical 
                          ? 'bg-[#FEE2E2] text-[#991B1B] dark:bg-rose-950 dark:text-rose-300' 
                          : 'bg-[#FEF3C7] text-[#92400E] dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isCritical ? 'Crítico' : 'Baixo'}
                      </span>
                      <button
                        onClick={() => onQuickMovement(item.id, 'entrada')}
                        className="p-1.5 rounded-lg text-emerald-800 bg-[#EAF4EE] hover:bg-[#DCEEE2] border border-[#CFE7D8] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80 transition-colors"
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

        {/* Right: Recent Movements Log */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1A2024] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Últimas Movimentações
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Retiradas docentes e recebimentos
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('movimentacoes')}
              className="text-xs font-medium text-emerald-800 dark:text-emerald-300 hover:text-emerald-950"
            >
              Histórico &rarr;
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {recentMovements.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Nenhuma movimentação registrada ainda.</p>
            ) : (
              recentMovements.map((mov) => {
                const isEntrada = mov.type === 'entrada';
                const dateObj = new Date(mov.date);
                const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={mov.id} className="py-2.5 flex items-start gap-3">
                    <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      isEntrada 
                        ? 'bg-[#EAF4EE] text-[#245D40] dark:bg-emerald-950/60 dark:text-emerald-300' 
                        : 'bg-[#FFF4ED] text-[#8C3F1B] dark:bg-amber-950/60 dark:text-amber-300'
                    }`}>
                      {isEntrada ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {mov.itemName}
                        </h4>
                        <span className={`text-[11px] font-semibold shrink-0 tabular-nums ${
                          isEntrada ? 'text-emerald-800 dark:text-emerald-300' : 'text-stone-600 dark:text-stone-400'
                        }`}>
                          {isEntrada ? '+' : '-'}{mov.quantity}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {mov.responsible} {mov.destinationOrReason ? `· ${mov.destinationOrReason}` : ''}
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 tabular-nums">
                        {formattedDate}
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
  );
};
