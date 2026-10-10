'use client';

import React from 'react';
import { 
  AlertTriangle, 
  Plus, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  MapPin
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
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FFF5F5] text-[#991B1B] border border-[#FED7D7] shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  Central de Alertas de Reposição Escolar
                </h2>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ segurança pedagógica ~
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Controle preventivo para evitar que faltem sulfites, materiais artísticos ou insumos durante as aulas
              </p>
            </div>
          </div>
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

      {/* Status Summary KPI Cards (Clear Pastel Tone) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#991B1B] tabular-nums">
              {criticalItems.length}
            </div>
            <div className="text-xs text-[#991B1B] font-semibold">Nível Crítico (&le; mínimo)</div>
          </div>
        </div>

        <div className="bg-[#FEF9ED] border border-[#FDE7B6] rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#92400E] tabular-nums">
              {lowItems.length}
            </div>
            <div className="text-xs text-[#92400E] font-semibold">Atenção (Próximo do Mínimo)</div>
          </div>
        </div>

        <div className="bg-[#EAF6ED] border border-[#CDE5D5] rounded-2xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-[#D2EEDA] text-[#14532D] border border-[#BBF7D0] flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#14532D] tabular-nums">
              {items.length - totalAlertItems.length}
            </div>
            <div className="text-xs text-[#14532D] font-semibold">Estoque Seguro para as Aulas</div>
          </div>
        </div>
      </div>

      {/* Main Alert List Island */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 bg-[#FAFBF9] flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-stone-900">
              Materiais que Requerem Reposição
            </h3>
            <p className="text-[11px] text-stone-500">
              Ordenados pelo índice de urgência para uso escolar
            </p>
          </div>
          <span className="text-[11px] font-semibold text-stone-700 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200 tabular-nums">
            {totalAlertItems.length} em alerta
          </span>
        </div>

        {totalAlertItems.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] flex items-center justify-center mx-auto mb-2.5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-stone-800">Depósito 100% Regularizado</h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Nenhum material está abaixo do limite de segurança no momento. Todas as salas contam com insumos garantidos.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {totalAlertItems.map((item) => {
              const isCritical = item.quantity <= item.minQuantity;
              const catInfo = CATEGORIES[item.category];

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#FAFBF9] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                        {item.code}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        isCritical 
                          ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]' 
                          : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                      }`}>
                        {isCritical ? 'Estoque Crítico' : 'Estoque Baixo'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catInfo.badgeBg} ${catInfo.badgeText} border-stone-200/60`}>
                        {catInfo.shortLabel}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 mt-1">
                      {item.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-stone-600">
                      <div>
                        Estoque Atual: <strong className={`tabular-nums ${isCritical ? 'text-[#991B1B] font-bold' : 'text-[#92400E] font-semibold'}`}>{item.quantity}</strong> {item.unit}
                      </div>
                      <span className="text-stone-300">·</span>
                      <div>
                        Mínimo Recomendado: <span className="tabular-nums font-semibold text-stone-700">{item.minQuantity} {item.unit}</span>
                      </div>
                      <span className="text-stone-300">·</span>
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
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors shadow-2xs"
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
