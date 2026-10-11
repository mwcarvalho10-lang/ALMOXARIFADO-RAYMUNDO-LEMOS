'use client';

import React, { useState } from 'react';
import { Tag, Printer, X, CheckSquare, Square } from 'lucide-react';
import { InventoryItem, Category, CATEGORIES } from '@/types/inventory';

interface BarcodeLabelGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  schoolName: string;
  initialSelectedIds?: Record<string, boolean>;
}

export const BarcodeLabelGenerator: React.FC<BarcodeLabelGeneratorProps> = ({
  isOpen,
  onClose,
  items,
  schoolName,
  initialSelectedIds,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'todas'>('todas');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>(() => {
    if (initialSelectedIds && Object.keys(initialSelectedIds).length > 0) {
      return { ...initialSelectedIds };
    }
    const map: Record<string, boolean> = {};
    items.slice(0, 12).forEach((i) => {
      map[i.id] = true;
    });
    return map;
  });

  if (!isOpen) return null;

  const filteredItems = items.filter((i) => {
    if (selectedCategory !== 'todas' && i.category !== selectedCategory) return false;
    return true;
  });

  const selectedItems = items.filter((i) => selectedIds[i.id]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (val: boolean) => {
    const updated: Record<string, boolean> = {};
    filteredItems.forEach((i) => {
      updated[i.id] = val;
    });
    setSelectedIds((prev) => ({ ...prev, ...updated }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Hidden on print) */}
        <div className="print:hidden px-6 py-4.5 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] rounded-xl shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-base text-stone-900">
                  Gerador de Etiquetas de Almoxarifado
                </h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ identificação escolar ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Geração em lote para identificação de caixas, estantes e bens permanentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#23563F] rounded-xl shadow-2xs transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Imprimir Folha ({selectedItems.length})
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar (Hidden on print) */}
        <div className="print:hidden p-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs bg-[#FAFBF9]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Seção:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'todas')}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-800 font-medium focus:outline-hidden"
            >
              <option value="todas">Todas as Seções</option>
              {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORIES[cat].shortLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSelectAll(true)}
              className="text-emerald-800 font-semibold hover:underline flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Marcar Todos
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="text-stone-500 font-semibold hover:underline flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Desmarcar Todos
            </button>
          </div>
        </div>

        {/* Labels Printable Canvas Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-[#F8FAF9]">
          {selectedItems.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              Nenhuma etiqueta selecionada. Marque os materiais para gerar as etiquetas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className="bg-white text-stone-900 border-2 border-stone-800 rounded-xl p-3 shadow-2xs flex flex-col justify-between h-36 relative cursor-pointer select-none group hover:border-emerald-600 transition-colors"
                >
                  {/* Label Header */}
                  <div className="flex items-center justify-between border-b border-stone-300 pb-1">
                    <span className="text-[10px] font-extrabold uppercase truncate max-w-[170px] tracking-tight">
                      {schoolName}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-stone-100 px-1 py-0.5 rounded border border-stone-300">
                      DEPÓSITO
                    </span>
                  </div>

                  {/* Item Info */}
                  <div className="my-1">
                    <h4 className="text-xs font-black line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                    <div className="text-[10px] text-stone-600 font-mono mt-0.5 flex items-center justify-between">
                      <span>CÓD: <strong>{item.code}</strong></span>
                      {item.patrimonyNumber && (
                        <span className="bg-[#E0F2FE] text-sky-900 px-1 rounded font-bold border border-[#BAE6FD]">
                          PAT: {item.patrimonyNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barcode Graphic + QR simulation */}
                  <div className="pt-1 border-t border-stone-200 flex items-center justify-between">
                    {/* Simulated SVG Barcode */}
                    <div className="space-y-0.5">
                      <div className="flex items-end gap-[1.5px] h-6">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-stone-950"
                            style={{
                              width: (i % 3 === 0 ? 2 : 1) + 'px',
                              height: (i % 5 === 0 ? 24 : 20) + 'px',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono tracking-widest text-stone-600 block">
                        *{item.code}*
                      </span>
                    </div>

                    {/* QR Code graphic */}
                    <div className="w-8 h-8 border border-stone-400 bg-stone-50 flex items-center justify-center p-0.5 shrink-0">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xs ${
                              idx % 2 === 0 ? 'bg-stone-900' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Location badge */}
                  <div className="text-[8px] text-stone-500 truncate mt-0.5">
                    📍 {item.location || 'Depósito Central'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
