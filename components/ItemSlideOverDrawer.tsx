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
  DollarSign, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
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
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-screen max-w-md bg-white shadow-2xl border-l border-stone-200/90 flex flex-col justify-between"
            >
              {/* Drawer Header in Soft Green */}
              <div className="p-6 border-b border-stone-200/80 flex items-center justify-between bg-[#F8FAF9]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#EAF4EE] text-[#1E4620] border border-[#CFE7D8]">
                    {item.code}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${catInfo.badgeBg} ${catInfo.badgeText}`}>
                    {catInfo.shortLabel}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Scroll */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
                {/* Title & Status */}
                <div>
                  <h3 className="text-lg font-bold text-stone-900 leading-snug">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {isCritical ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#991B1B] bg-[#FFF5F5] border border-[#FED7D7] px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" /> Estoque Crítico
                      </span>
                    ) : isLow ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] px-2.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" /> Estoque Baixo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1E4620] bg-[#EAF4EE] border border-[#CFE7D8] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Estoque Regular
                      </span>
                    )}

                    {item.condition && (
                      <span className="text-xs text-stone-500 capitalize">
                        Estado: {item.condition}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Level Card */}
                <div className="p-4 rounded-2xl bg-[#F8FAF9] border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-semibold">Saldo Disponível:</span>
                    <span className="text-2xl font-bold text-[#1E4620]">
                      {item.quantity}{' '}
                      <span className="text-xs font-normal text-stone-500">{item.unit}</span>
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-[#2D6A4F]'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(5, (item.quantity / (item.targetSemesterStock || 1)) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                    <div>Mínimo: <strong className="text-stone-800">{item.minQuantity}</strong> {item.unit}</div>
                    <div>Meta Semestre: <strong className="text-stone-800">{item.targetSemesterStock}</strong> {item.unit}</div>
                  </div>
                </div>

                {/* Location & Patrimony Details */}
                <div className="space-y-2.5 bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/70">
                  <div className="flex items-center gap-2 text-stone-700">
                    <MapPin className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                    <span>Localização: <strong>{item.location || 'Depósito Central'}</strong></span>
                  </div>

                  {item.patrimonyNumber && (
                    <div className="flex items-center gap-2 text-stone-700">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Número de Tombamento: <strong className="font-mono">{item.patrimonyNumber}</strong></span>
                    </div>
                  )}

                  {item.brand && (
                    <div className="flex items-center gap-2 text-stone-700">
                      <Layers className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>Fabricante / Marca: <strong>{item.brand}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-stone-700">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Custo Médio: <strong>{item.estimatedUnitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> (Total: {totalValuation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900">
                    <strong>Observações:</strong> {item.notes}
                  </div>
                )}

                {/* Recent Movement History on this item */}
                <div className="space-y-2 pt-2 border-t border-stone-200/80">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                    Últimas Retiradas & Entradas
                  </h4>

                  {itemMovements.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">Nenhuma movimentação recente deste item.</p>
                  ) : (
                    <div className="divide-y divide-stone-100 text-xs">
                      {itemMovements.map((m) => (
                        <div key={m.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-lg ${
                              m.type === 'entrada' ? 'bg-[#EAF4EE] text-[#1E4620]' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {m.type === 'entrada' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            </span>
                            <div>
                              <div className="font-semibold text-stone-800 truncate max-w-[170px]">
                                {m.responsible}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                {new Date(m.date).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                          <span className={`font-mono font-bold ${
                            m.type === 'entrada' ? 'text-emerald-700' : 'text-rose-600'
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
              <div className="p-4 bg-[#F8FAF9] border-t border-stone-200/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenMovement(item.id, 'entrada');
                  }}
                  className="py-2.5 px-3 bg-[#2D6A4F] hover:bg-[#1E4620] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  + Entrada
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenMovement(item.id, 'saida');
                  }}
                  className="py-2.5 px-3 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                >
                  <Minus className="w-4 h-4" />
                  - Saída
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onEditItem(item);
                  }}
                  className="col-span-1 py-2 px-3 bg-white text-stone-700 border border-stone-300 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-stone-500" />
                  Editar Cadastro
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onPrintSingleLabel(item);
                  }}
                  className="col-span-1 py-2 px-3 bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100/70 transition-colors"
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
