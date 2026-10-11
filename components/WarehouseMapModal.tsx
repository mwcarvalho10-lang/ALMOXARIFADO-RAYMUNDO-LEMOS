'use client';

import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
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
    return item.category === currentZone.category;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] rounded-xl shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-base text-stone-900">Mapeamento Visual do Depósito Escolar</h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ planta baixa 2D ~
                </span>
              </div>
              <p className="text-xs text-stone-500">Organização espacial das estantes, armários e baias pedagógicas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
          {/* Visual 2D Grid / Layout */}
          <div className="md:col-span-7 space-y-4">
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
              <span>Planta Baixa do Almoxarifado</span>
              <span className="text-[11px] text-stone-500 font-normal">Clique na área para inspecionar</span>
            </div>

            <div className="bg-[#FAFBF9] p-4 rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
              {/* Door Entrance */}
              <div className="w-28 mx-auto py-1 bg-[#FEF3C7] text-[#92400E] text-[10px] font-mono text-center font-bold rounded-lg border border-[#FDE68A] shadow-2xs">
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
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-[#2D6A4F] bg-white shadow-xs ring-2 ring-emerald-500/10'
                          : 'border-stone-200 bg-white/80 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200/60">
                          {zone.code}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800">
                          {count} itens
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-stone-900 mt-2 line-clamp-1">
                        {zone.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">
                        {zone.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Floor corridor notice */}
              <div className="py-1 text-center text-[10px] text-stone-500 font-mono">
                &mdash; CORREDOR CENTRAL LIVRE PARA CIRCULAÇÃO &mdash;
              </div>
            </div>
          </div>

          {/* Zone Detail & Stored Items List */}
          <div className="md:col-span-5 bg-[#FAFBF9] rounded-2xl border border-stone-200 p-4 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="border-b border-stone-200 pb-3">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                  Área Selecionada
                </span>
                <h4 className="text-sm font-bold text-stone-900 mt-0.5">
                  {currentZone.name}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {currentZone.description}
                </p>

                <div className="mt-2 flex flex-wrap gap-1">
                  {currentZone.shelves.map((sh, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white border border-stone-200 px-2 py-0.5 rounded-lg text-stone-600 font-medium"
                    >
                      {sh}
                    </span>
                  ))}
                </div>
              </div>

              {/* Items in this area */}
              <div className="mt-3">
                <h5 className="text-xs font-bold text-stone-800 mb-2">
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
                      className="p-2.5 bg-white rounded-xl border border-stone-200 hover:border-emerald-300 cursor-pointer transition-colors flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-stone-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {item.code} {item.location ? `• ${item.location}` : ''}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-stone-800 shrink-0">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 text-right">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl hover:bg-[#23563F] transition-colors shadow-2xs"
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
