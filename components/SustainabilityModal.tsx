'use client';

import React from 'react';
import { Leaf, X, TreePine, Droplets, Recycle, Award, CheckCircle2 } from 'lucide-react';
import { StockMovement, InventoryItem } from '@/types/inventory';

interface SustainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  movementsCount: number;
  itemsCount: number;
}

export const SustainabilityModal: React.FC<SustainabilityModalProps> = ({
  isOpen,
  onClose,
  movementsCount,
  itemsCount,
}) => {
  if (!isOpen) return null;

  // Ecological math estimation
  const sheetsSaved = movementsCount * 3; // ~3 sheets of physical requisition paper per transaction
  const litersWaterSaved = Math.round(sheetsSaved * 10); // 1 sheet ~10 liters of industrial water
  const co2AvoidedKg = (sheetsSaved * 0.005).toFixed(2); // ~5g of CO2 per sheet

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1711]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#eaf5ee] dark:bg-[#142d1f] border-b border-[#d2ebdc] dark:border-[#1d3827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#348a57] text-white rounded-xl shadow-xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#143e26] dark:text-[#e4f6ec]">Painel de Sustentabilidade (&ldquo;Depósito Verde&rdquo;)</h3>
              <p className="text-xs text-[#527d63] dark:text-[#8eb89e]">Indicadores ecológicos de eficiência no almoxarifado escolar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] p-1.5 rounded-lg hover:bg-[#e4f3e8] dark:hover:bg-[#163122]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-800 dark:text-slate-200">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Ao digitalizar as requisições de professores, controlar datas de validade e prevenir compras redundantes, sua unidade escolar promove educação ambiental na prática.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl">
              <TreePine className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100">
                {sheetsSaved}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                Folhas de Papel Poupadas
              </span>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl">
              <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-extrabold text-blue-900 dark:text-blue-100">
                {litersWaterSaved} L
              </div>
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                Água Preservada
              </span>
            </div>

            <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-xl">
              <Recycle className="w-6 h-6 text-teal-600 dark:text-teal-400 mx-auto mb-1" />
              <div className="text-xl font-extrabold text-teal-900 dark:text-teal-100">
                {co2AvoidedKg} kg
              </div>
              <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                Redução de Emissão CO₂
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
              <Award className="w-4 h-4 text-amber-500" /> Selo de Gestão Escolar Consciente:
            </h4>
            <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero formulários impressos para retiradas de rotina</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Reaproveitamento de sobras de cartolina e E.V.A. catalogado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Planejamento semestral enxuto, combatendo vencimento de saneantes</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
