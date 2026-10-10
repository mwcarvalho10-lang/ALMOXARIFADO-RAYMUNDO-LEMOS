'use client';

import React, { useState } from 'react';
import { ClipboardCheck, X, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { InventoryItem, StockMovement } from '@/types/inventory';
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
      alert('Por favor, informe o nome do conferente/auditor.');
      return;
    }

    const adjustments = divergedItems.map((d) => ({
      itemId: d.item.id,
      newQuantity: d.counted,
      reason: `Inventário Cego de Auditoria realizado por ${auditorName.trim()} (Divergência anterior: ${d.diff > 0 ? '+' : ''}${d.diff})`,
    }));

    playBeep('success');
    onApplyInventoryAdjustments(adjustments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1711]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#eaf5ee] dark:bg-[#142d1f] border-b border-[#d2ebdc] dark:border-[#1d3827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#348a57] text-white rounded-xl shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#143e26] dark:text-[#e4f6ec]">Inventário Cego de Auditoria Escolar</h3>
              <p className="text-xs text-[#527d63] dark:text-[#8eb89e]">
                Conferência física isenta de viés para apuração de divergências de estoque
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] p-1.5 rounded-lg hover:bg-[#e4f3e8] dark:hover:bg-[#163122]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Conferente Responsável:
              </span>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                placeholder="Ex: Valdemir Santos (Almoxarife) / Comissão Escolar"
                className="mt-1 px-3 py-1.5 text-xs w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <button
              onClick={() => setShowResults(!showResults)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200"
            >
              {showResults ? 'Ocultar Comparação' : 'Revelar Divergências'}
            </button>
          </div>

          {/* Table */}
          <div className="max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 border-b border-slate-200 dark:border-slate-800 font-semibold">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {discrepancies.map((d) => (
                  <tr key={d.item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-500">{d.item.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{d.item.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{d.item.location}</td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={counts[d.item.id] !== undefined ? counts[d.item.id] : d.item.quantity}
                        onChange={(e) => handleCountChange(d.item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-right px-2 py-0.5 font-bold font-mono border rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      />
                    </td>
                    {showResults && (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">{d.system}</td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {d.diff === 0 ? (
                            <span className="text-emerald-600 font-bold">OK (Conforme)</span>
                          ) : (
                            <span className={`font-bold font-mono px-1.5 py-0.5 rounded text-[11px] ${
                              d.diff > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
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
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Foram encontradas <strong>{divergedItems.length} divergências</strong> entre o estoque físico e o saldo registrado.
                </span>
              </div>
              <button
                onClick={handleApplyAdjustments}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shrink-0 ml-2"
              >
                Ajustar Saldos Automaticamente
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
