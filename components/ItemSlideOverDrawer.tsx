'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Tag, 
  Plus, 
  Minus, 
  Edit2, 
  Clock, 
  DollarSign, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { InventoryItem, StockMovement, CATEGORIES } from '@/types/inventory';

interface ItemSlideOverDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  movements: StockMovement[];
  onOpenMovement: (itemId: string, type: 'entrada' | 'saida') => void;
  onEditItem: (item: InventoryItem) => void;
  onPrintSingleLabel: (item: InventoryItem) => void;
}

export const ItemSlideOverDrawer: React.FC<ItemSlideOverDrawerProps> = ({
  isOpen,
  onClose,
  item,
  movements,
  onOpenMovement,
  onEditItem,
  onPrintSingleLabel,
}) => {
  if (!item) return null;

  const itemMovements = movements
    .filter((m) => m.itemId === item.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const isCritical = item.quantity <= item.minQuantity;
  const isLow = !isCritical && item.quantity <= item.minQuantity * 1.5;
  const catInfo = CATEGORIES[item.category];
  const totalValuation = (item.quantity * (item.estimatedUnitCost || 0));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-screen max-w-md bg-white dark:bg-[#0f1d16] shadow-2xl border-l border-[#d8eadc] dark:border-[#1d3827] flex flex-col justify-between"
            >
              {/* Drawer Header in Pastel Green */}
              <div className="p-6 border-b border-[#d8eadc] dark:border-[#1d3827] flex items-center justify-between bg-[#f4faf6] dark:bg-[#122419]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#e5f3e9] dark:bg-[#183825] text-[#18532f] dark:text-[#a2e2be] border border-[#cfe6d6] dark:border-[#224b33]">
                    {item.code}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${catInfo.badgeBg} ${catInfo.badgeText}`}>
                    {catInfo.shortLabel}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] hover:bg-[#e4f3e8] dark:hover:bg-[#163122] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
                {/* Title & Status */}
                <div>
                  <h3 className="text-lg font-extrabold text-[#143e26] dark:text-[#e4f6ec] leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" /> Estoque Crítico
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1a5532] bg-[#def2e4] dark:bg-emerald-950/60 dark:text-[#8fe2af] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Estoque Regular
                      </span>
                    )}

                    {item.condition && (
                      <span className="text-xs text-[#527d63] dark:text-[#8eb89e] capitalize">
                        Estado: {item.condition}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Level Card */}
                <div className="p-4 rounded-2xl bg-[#f5faf6] dark:bg-[#12281c] border border-[#d8eadc] dark:border-[#1d3827] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4e755c] dark:text-[#8ea998] font-bold">Saldo Disponível:</span>
                    <span className="text-2xl font-black text-[#143e26] dark:text-[#e4f6ec]">
                      {item.quantity}{' '}
                      <span className="text-xs font-normal text-[#527d63] dark:text-[#8eb89e]">{item.unit}</span>
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-[#dceee1] dark:bg-[#1a3826] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-[#348a57]'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (item.quantity / (item.targetSemesterStock || 1)) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#527d63] dark:text-[#8eb89e] pt-1">
                    <div>Mínimo: <strong>{item.minQuantity}</strong> {item.unit}</div>
                    <div>Meta Semestre: <strong>{item.targetSemesterStock}</strong> {item.unit}</div>
                  </div>
                </div>

                {/* Location & Patrimony Details */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-[#245336] dark:text-[#a0dbb7]">
                    <MapPin className="w-4 h-4 text-[#348a57] shrink-0" />
                    <span>Localização: <strong>{item.location || 'Depósito Central'}</strong></span>
                  </div>

                  {item.patrimonyNumber && (
                    <div className="flex items-center gap-2 text-[#175630] dark:text-[#a0e4ba]">
                      <Tag className="w-4 h-4 shrink-0" />
                      <span>Número de Tombamento: <strong>{item.patrimonyNumber}</strong></span>
                    </div>
                  )}

                  {item.brand && (
                    <div className="flex items-center gap-2 text-[#245336] dark:text-[#a0dbb7]">
                      <Layers className="w-4 h-4 text-[#5a8a6d] shrink-0" />
                      <span>Fabricante / Marca: <strong>{item.brand}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[#245336] dark:text-[#a0dbb7]">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Custo Médio: <strong>{item.estimatedUnitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> (Total em estoque: {totalValuation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="p-3 bg-[#fef9ee] dark:bg-[#2c2010] border border-[#fde8be] dark:border-[#523d19] rounded-xl text-xs text-[#825412] dark:text-[#fde68a]">
                    <strong>Observações:</strong> {item.notes}
                  </div>
                )}

                {/* Recent Movement History on this item */}
                <div className="space-y-2 pt-2 border-t border-[#d8eadc] dark:border-[#1d3827]">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#527d63] dark:text-[#8eb89e]">
                    Últimas Retiradas & Entradas
                  </h4>

                  {itemMovements.length === 0 ? (
                    <p className="text-xs text-[#759e85] italic">Nenhuma movimentação recente deste item.</p>
                  ) : (
                    <div className="divide-y divide-[#e5f1e8] dark:divide-[#1d3827] text-xs">
                      {itemMovements.map((m) => (
                        <div key={m.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-lg ${
                              m.type === 'entrada' ? 'bg-[#ddf2e3] text-[#14532d]' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {m.type === 'entrada' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            </span>
                            <div>
                              <div className="font-semibold text-[#143e26] dark:text-[#e4f6ec] truncate max-w-[170px]">
                                {m.responsible}
                              </div>
                              <div className="text-[10px] text-[#638d74]">
                                {new Date(m.date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                          <span className={`font-mono font-bold ${
                            m.type === 'entrada' ? 'text-[#1e6139] dark:text-[#8ee2ae]' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 bg-[#f4faf6] dark:bg-[#122419] border-t border-[#d8eadc] dark:border-[#1d3827] grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMovement(item.id, 'entrada');
                  }}
                  className="py-2.5 px-3 bg-[#348a57] hover:bg-[#2b7549] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-[#348a57]/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  + Entrada
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenMovement(item.id, 'saida');
                  }}
                  className="py-2.5 px-3 bg-[#8e2926] hover:bg-[#782320] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  - Saída
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onEditItem(item);
                  }}
                  className="col-span-1 py-2 px-3 bg-[#edf7f1] dark:bg-[#163122] text-[#1c5332] dark:text-[#a0e2ba] border border-[#cbe4d4] dark:border-[#224b34] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-[#dff2e5] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Editar Cadastro
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onPrintSingleLabel(item);
                  }}
                  className="col-span-1 py-2 px-3 bg-[#fef3c7] dark:bg-[#2d2212] text-[#92400e] dark:text-[#fde68a] border border-[#fde68a] dark:border-[#78350f] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-[#fde68a] transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir Etiqueta
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
