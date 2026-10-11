'use client';

import React from 'react';
import { Leaf, X, TreePine, Droplets, Recycle, Award, CheckCircle2 } from 'lucide-react';

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
}) => {
  if (!isOpen) return null;

  // Ecological math estimation
  const sheetsSaved = movementsCount * 3; // ~3 sheets of physical requisition paper per transaction
  const litersWaterSaved = Math.round(sheetsSaved * 10); // 1 sheet ~10 liters of industrial water
  const co2AvoidedKg = (sheetsSaved * 0.005).toFixed(2); // ~5g of CO2 per sheet

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAFBF9] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#2D6A4F] text-white rounded-xl shadow-2xs">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Painel de Sustentabilidade <span className="font-cursive text-xl text-[#2D6A4F] font-normal">&ldquo;Depósito Verde&rdquo;</span>
              </h3>
              <p className="text-xs text-stone-500">Indicadores ecológicos de eficiência no almoxarifado escolar</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-stone-800">
          <p className="text-xs text-stone-600 leading-relaxed">
            Ao digitalizar as requisições de professores, controlar datas de validade e prevenir compras redundantes, sua unidade escolar promove educação ambiental na prática.
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl">
              <TreePine className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-emerald-900">
                {sheetsSaved}
              </div>
              <span className="text-[10px] font-semibold text-emerald-700">
                Folhas de Papel Poupadas
              </span>
            </div>

            <div className="p-4 bg-[#F0F9FF] border border-[#E0F2FE] rounded-2xl">
              <Droplets className="w-6 h-6 text-sky-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-sky-900">
                {litersWaterSaved} L
              </div>
              <span className="text-[10px] font-semibold text-sky-700">
                Água Preservada
              </span>
            </div>

            <div className="p-4 bg-[#F0FDFA] border border-[#CCFBF1] rounded-2xl">
              <Recycle className="w-6 h-6 text-teal-600 mx-auto mb-1" />
              <div className="text-xl font-bold text-teal-900">
                {co2AvoidedKg} kg
              </div>
              <span className="text-[10px] font-semibold text-teal-700">
                Redução de Emissão CO₂
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAF9] rounded-2xl border border-stone-200/80 space-y-2 text-xs">
            <h4 className="font-bold flex items-center gap-1.5 text-stone-900">
              <Award className="w-4 h-4 text-amber-500" /> Selo de Gestão Escolar Consciente:
            </h4>
            <div className="space-y-1.5 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero formulários impressos para retiradas de rotina</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reaproveitamento de sobras de cartolina e E.V.A. catalogado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Planejamento semestral enxuto, combatendo vencimento de saneantes</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#1E4620] text-white font-semibold text-xs rounded-xl transition-colors shadow-2xs"
            >
              Fechar Painel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
