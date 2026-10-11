'use client';

import React, { useState } from 'react';
import { ClipboardCheck, X, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface BlindInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onApplyInventoryAdjustments: (adjustments: Array<{ itemId: string; newQuantity: number; reason: string }>) => void;
}

export const BlindInventoryModal: React.FC<BlindInventoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onApplyInventoryAdjustments,
}) => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [auditorName, setAuditorName] = useState('');

  if (!isOpen) return null;

  const handleCountChange = (itemId: string, val: number) => {
    setCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, val),
    }));
  };

  const calculateDiscrepancies = () => {
    return items.map((item) => {
      const counted = counts[item.id] !== undefined ? counts[item.id] : item.quantity;
      const diff = counted - item.quantity;
      return {
        item,
        counted,
        system: item.quantity,
        diff,
      };
    });
  };

  const discrepancies = calculateDiscrepancies();
  const divergedItems = discrepancies.filter((d) => d.diff !== 0);

  const handleApplyAdjustments = () => {
    if (!auditorName.trim()) {
      alert('Por favor, informe o nome do conferente/auditor da escola.');
      return;
    }

    const adjustments = divergedItems.map((d) => ({
      itemId: d.item.id,
      newQuantity: d.counted,
      reason: `Inventário Cego realizado por ${auditorName.trim()} (Divergência: ${d.diff > 0 ? '+' : ''}${d.diff})`,
    }));

    playBeep('success');
    onApplyInventoryAdjustments(adjustments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] rounded-xl shadow-2xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-base text-stone-900">Inventário Cego de Auditoria Escolar</h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ conferência física ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Conferência física isenta de viés para apuração de divergências de estoque no depósito
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">
                Conferente Responsável:
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder="Ex: Valdemir Santos (Almoxarife) / Comissão Escolar"
                className="px-3 py-1.5 text-xs w-full sm:w-80 rounded-xl border border-stone-200 bg-[#FAFBF9] text-stone-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <button
              onClick={() => setShowResults(!showResults)}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors shadow-2xs self-start sm:self-end"
            >
              {showResults ? 'Ocultar Comparação' : 'Revelar Divergências'}
            </button>
          </div>

          {/* Table */}
          <div className="max-h-96 overflow-y-auto border border-stone-200 rounded-2xl bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFBF9] sticky top-0 border-b border-stone-200 font-semibold text-stone-600">
                <tr>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Material</th>
                  <th className="py-2.5 px-3">Local Físico</th>
                  <th className="py-2.5 px-3 text-right">Contagem Física</th>
                  {showResults && (
                    <>
                      <th className="py-2.5 px-3 text-right">Saldo Sistema</th>
                      <th className="py-2.5 px-3 text-center">Divergência</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {discrepancies.map((d) => (
                  <tr key={d.item.id} className="hover:bg-[#FAFBF9] transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-stone-600">{d.item.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">{d.item.name}</td>
                    <td className="py-2.5 px-3 text-stone-500">{d.item.location}</td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={counts[d.item.id] !== undefined ? counts[d.item.id] : d.item.quantity}
                        onChange={(e) => handleCountChange(d.item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-right px-2 py-0.5 font-bold font-mono border rounded-lg border-stone-200 bg-[#FAFBF9] focus:bg-white tabular-nums"
                      />
                    </td>
                    {showResults && (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-600 font-medium">{d.system}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {d.diff === 0 ? (
                            <span className="text-[#14532D] font-bold">OK (Conforme)</span>
                          ) : (
                            <span className={`font-bold font-mono px-2 py-0.5 rounded-md text-[11px] border ${
                              d.diff > 0 
                                ? 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' 
                                : 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]'
                            }`}>
                              {d.diff > 0 ? `+${d.diff}` : d.diff}
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Divergence alert banner */}
          {showResults && divergedItems.length > 0 && (
            <div className="p-3.5 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Foram encontradas <strong>{divergedItems.length} divergências</strong> entre a contagem física e o saldo registrado.
                </span>
              </div>
              <button
                onClick={handleApplyAdjustments}
                className="px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#23563F] text-white font-semibold rounded-xl transition-colors shrink-0 shadow-2xs"
              >
                Ajustar Saldos no Sistema
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
