'use client';

import React, { useState } from 'react';
import { Tag, Printer, X, CheckSquare, Square, Download, Filter } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1711]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header (Hidden on print) */}
        <div className="print:hidden px-6 py-4 bg-[#eaf5ee] dark:bg-[#142d1f] border-b border-[#d2ebdc] dark:border-[#1d3827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#348a57] text-white rounded-xl shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#143e26] dark:text-[#e4f6ec]">
                Gerador de Etiquetas de Almoxarifado & Patrimônio
              </h3>
              <p className="text-xs text-[#527d63] dark:text-[#8eb89e]">
                Geração em lote para identificação de caixas, estantes e bens permanentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={selectedItems.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-[#348a57] hover:bg-[#287b4a] rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Imprimir Folha ({selectedItems.length})
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] rounded-lg hover:bg-[#e4f3e8] dark:hover:bg-[#163122]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar (Hidden on print) */}
        <div className="print:hidden p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Seção:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'todas')}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Marcar Todos
            </button>
            <button
              onClick={() => handleSelectAll(false)}
              className="text-slate-500 font-semibold hover:underline flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Desmarcar Todos
            </button>
          </div>
        </div>

        {/* Labels Printable Canvas Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto bg-slate-100 dark:bg-slate-950">
          {selectedItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Nenhuma etiqueta selecionada. Marque os materiais para gerar as etiquetas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className="bg-white text-slate-900 border-2 border-slate-800 rounded-lg p-3 shadow-xs flex flex-col justify-between h-36 relative cursor-pointer select-none group hover:border-blue-600 transition-colors"
                >
                  {/* Label Header */}
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                    <span className="text-[10px] font-extrabold uppercase truncate max-w-[170px] tracking-tight">
                      {schoolName}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-300">
                      DEPÓSITO
                    </span>
                  </div>

                  {/* Item Info */}
                  <div className="my-1">
                    <h4 className="text-xs font-black line-clamp-2 leading-tight">
                      {item.name}
                    </h4>
                    <div className="text-[10px] text-slate-600 font-mono mt-0.5 flex items-center justify-between">
                      <span>CÓD: <strong>{item.code}</strong></span>
                      {item.patrimonyNumber && (
                        <span className="bg-blue-50 text-blue-900 px-1 rounded font-bold">
                          PAT: {item.patrimonyNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barcode Graphic + QR simulation */}
                  <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                    {/* Simulated SVG Barcode */}
                    <div className="space-y-0.5">
                      <div className="flex items-end gap-[1.5px] h-6">
                        {Array.from({ length: 28 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-black"
                            style={{
                              width: (i % 3 === 0 ? 2 : 1) + 'px',
                              height: (i % 5 === 0 ? 24 : 20) + 'px',
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono tracking-widest text-slate-600 block">
                        *{item.code}*
                      </span>
                    </div>

                    {/* QR Code graphic */}
                    <div className="w-8 h-8 border border-slate-400 bg-slate-50 flex items-center justify-center p-0.5 shrink-0">
                      <div className="grid grid-cols-3 gap-0.5 w-full h-full">
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`rounded-xs ${
                              idx % 2 === 0 ? 'bg-black' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Location badge */}
                  <div className="text-[8px] text-slate-500 truncate mt-0.5">
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
