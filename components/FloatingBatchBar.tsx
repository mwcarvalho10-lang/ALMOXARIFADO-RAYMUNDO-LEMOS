'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, Download, ShoppingCart, X, CheckSquare } from 'lucide-react';
import { playBeep } from '@/lib/audio';

interface FloatingBatchBarProps {
  selectedCount: number;
  onPrintLabels: () => void;
  onExportCsv: () => void;
  onAddToPurchases: () => void;
  onClearSelection: () => void;
}

export const FloatingBatchBar: React.FC<FloatingBatchBarProps> = ({
  selectedCount,
  onPrintLabels,
  onExportCsv,
  onAddToPurchases,
  onClearSelection,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="fixed bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4"
        >
          <div className="pointer-events-auto bg-[#10281b]/95 text-white backdrop-blur-xl border border-[#275338] shadow-2xl rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-4 max-w-2xl w-full">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#348a57] text-white flex items-center justify-center text-xs font-bold font-mono">
                {selectedCount}
              </span>
              <span className="text-xs font-bold text-[#e1f5e8]">
                {selectedCount === 1 ? 'material selecionado' : 'materiais selecionados'}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  playBeep('click');
                  onPrintLabels();
                }}
                className="px-3.5 py-1.5 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                Etiquetas ({selectedCount})
              </button>

              <button
                onClick={() => {
                  playBeep('click');
                  onExportCsv();
                }}
                className="px-3.5 py-1.5 bg-[#2d7d4c] hover:bg-[#23663e] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>

              <button
                onClick={() => {
                  playBeep('click');
                  onAddToPurchases();
                }}
                className="px-3.5 py-1.5 bg-[#348a57] hover:bg-[#2b7549] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Compras
              </button>

              <button
                onClick={onClearSelection}
                className="p-1.5 text-[#8eb89e] hover:text-white rounded-lg hover:bg-[#1a3d28] transition-colors"
                title="Desmarcar todos"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
