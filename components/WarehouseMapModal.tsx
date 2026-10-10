'use client';

import React, { useState } from 'react';
import { MapPin, X, Package, Layers, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { InventoryItem, Category, WarehouseZone } from '@/types/inventory';
import { INITIAL_WAREHOUSE_ZONES } from '@/lib/mock-data';

interface WarehouseMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
}

export const WarehouseMapModal: React.FC<WarehouseMapModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-a');

  if (!isOpen) return null;

  const currentZone = INITIAL_WAREHOUSE_ZONES.find((z) => z.id === selectedZoneId) || INITIAL_WAREHOUSE_ZONES[0];

  const zoneItems = items.filter((item) => {
    // Match location or category
    return item.category === currentZone.category;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1711]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#eaf5ee] dark:bg-[#142d1f] border-b border-[#d2ebdc] dark:border-[#1d3827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#348a57] text-white rounded-xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#143e26] dark:text-[#e4f6ec]">Mapeamento Visual do Depósito Escolar (Planta 2D)</h3>
              <p className="text-xs text-[#527d63] dark:text-[#8eb89e]">Organização espacial das estantes, armários e baias pedagógicas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] p-1.5 rounded-lg hover:bg-[#e4f3e8] dark:hover:bg-[#163122]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Visual 2D Grid / Layout */}
          <div className="md:col-span-7 space-y-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Planta Baixa do Almoxarifado</span>
              <span className="text-[11px] text-slate-400 font-normal">Clique na área para inspecionar</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-800 space-y-3">
              {/* Door Entrance */}
              <div className="w-24 mx-auto py-1 bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-mono text-center font-bold rounded-sm border border-amber-400">
                PORTA PRINCIPAL
              </div>

              {/* Warehouse Bays grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {INITIAL_WAREHOUSE_ZONES.map((zone) => {
                  const isSelected = zone.id === selectedZoneId;
                  const count = items.filter((i) => i.category === zone.category).length;

                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-blue-600 bg-white dark:bg-slate-800 shadow-md ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {zone.code}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {count} itens
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 line-clamp-1">
                        {zone.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {zone.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Floor corridor notice */}
              <div className="py-1 text-center text-[10px] text-slate-400 font-mono">
                &mdash; CORREDOR CENTRAL LIVRE PARA CIRCULAÇÃO &mdash;
              </div>
            </div>
          </div>

          {/* Zone Detail & Stored Items List */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Área Selecionada
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentZone.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentZone.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {currentZone.shelves.map((sh, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300"
                    >
                      {sh}
                    </span>
                  ))}
                </div>
              </div>

              {/* Items in this area */}
              <div className="mt-3">
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Materiais nesta localização ({zoneItems.length}):
                </h5>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {zoneItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.code} {item.location ? `• ${item.location}` : ''}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-right">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
