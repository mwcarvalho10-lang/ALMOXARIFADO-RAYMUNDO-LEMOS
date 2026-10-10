'use client';

import React from 'react';
import { 
  AlertTriangle, 
  Package, 
  Plus, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  MapPin,
  ArrowRight
} from 'lucide-react';
import { InventoryItem, CATEGORIES } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface AlertsViewProps {
  items: InventoryItem[];
  onQuickRestock: (itemId: string) => void;
  onNavigateToPurchases: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  items,
  onQuickRestock,
  onNavigateToPurchases,
}) => {
  const criticalItems = items.filter((item) => item.quantity <= item.minQuantity);
  const lowItems = items.filter(
    (item) => item.quantity > item.minQuantity && item.quantity <= item.minQuantity * 1.5
  );

  const totalAlertItems = [...criticalItems, ...lowItems].sort(
    (a, b) => (a.quantity / (a.minQuantity || 1)) - (b.quantity / (b.minQuantity || 1))
  );

  return (
    <div className="space-y-4">
      {/* Header Banner Island */}
      <div className="bg-white dark:bg-[#1A2024] p-4.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#FFF5F5] dark:bg-rose-950/60 text-[#991B1B] dark:text-rose-300">
              <AlertTriangle className="w-4 h-4" />
            </span>
            Central de Alertas de Reposição Escolar
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Controle preventivo para evitar que faltem sulfites, materiais artísticos ou insumos durante as aulas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playBeep('click');
              onNavigateToPurchases();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#23563F] rounded-xl shadow-2xs transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Planejar Compras Semestrais
          </button>
        </div>
      </div>

      {/* Status Summary KPI Cards (Pastel Tone) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#FFF5F5] dark:bg-rose-950/30 border border-[#FED7D7] dark:border-rose-900/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] dark:bg-rose-900/80 text-[#991B1B] dark:text-rose-200 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#991B1B] dark:text-rose-300 tabular-nums">
              {criticalItems.length}
            </div>
            <div className="text-xs text-[#991B1B] dark:text-rose-400 font-medium">Nível Crítico (&le; mínimo)</div>
          </div>
        </div>

        <div className="bg-[#FEF9ED] dark:bg-amber-950/30 border border-[#FDE7B6] dark:border-amber-900/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] dark:bg-amber-900/80 text-[#92400E] dark:text-amber-200 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#92400E] dark:text-amber-300 tabular-nums">
              {lowItems.length}
            </div>
            <div className="text-xs text-[#92400E] dark:text-amber-400 font-medium">Atenção (Próximo do Mínimo)</div>
          </div>
        </div>

        <div className="bg-[#EAF4EE] dark:bg-emerald-950/30 border border-[#CFE7D8] dark:border-emerald-900/60 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D2EEDA] dark:bg-emerald-900/80 text-[#1E4620] dark:text-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#1E4620] dark:text-emerald-300 tabular-nums">
              {items.length - totalAlertItems.length}
            </div>
            <div className="text-xs text-[#1E4620] dark:text-emerald-400 font-medium">Estoque Seguro para as Aulas</div>
          </div>
        </div>
      </div>

      {/* Main Alert List Island */}
      <div className="bg-white dark:bg-[#1A2024] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 bg-[#FAFBF9] dark:bg-[#151A1D] flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
              Materiais que Requerem Reposição
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Ordenados pelo índice de urgência para uso escolar
            </p>
          </div>
          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 px-2.5 py-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700 tabular-nums">
            {totalAlertItems.length} em alerta
          </span>
        </div>

        {totalAlertItems.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF4EE] text-[#245D40] flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">Depósito 100% Regularizado</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
              Nenhum material está abaixo do limite de segurança no momento. Todas as salas contam com insumos garantidos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {totalAlertItems.map((item) => {
              const isCritical = item.quantity <= item.minQuantity;
              const deficit = Math.max(0, item.minQuantity - item.quantity);
              const semesterDeficit = Math.max(0, item.targetSemesterStock - item.quantity);
              const catInfo = CATEGORIES[item.category];

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded border border-stone-200 dark:border-stone-700">
                        {item.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        isCritical 
                          ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5] dark:bg-rose-950 dark:text-rose-300' 
                          : 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {isCritical ? 'Estoque Crítico' : 'Estoque Baixo'}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${catInfo.badgeBg} ${catInfo.badgeText}`}>
                        {catInfo.shortLabel}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                      {item.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                      <div>
                        Estoque Atual: <strong className={`tabular-nums ${isCritical ? 'text-[#991B1B] dark:text-rose-300 font-bold' : 'text-[#92400E] dark:text-amber-300 font-semibold'}`}>{item.quantity}</strong> {item.unit}
                      </div>
                      <span className="text-stone-300 dark:text-stone-600">·</span>
                      <div>
                        Mínimo Recomendado: <span className="tabular-nums font-medium text-stone-700 dark:text-stone-300">{item.minQuantity} {item.unit}</span>
                      </div>
                      <span className="text-stone-300 dark:text-stone-600">·</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>{item.location || 'Depósito Central'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => {
                        playBeep('click');
                        onQuickRestock(item.id);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#1E4620] bg-[#EAF4EE] hover:bg-[#DCEEE2] border border-[#CFE7D8] transition-colors shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Registrar Entrada
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
