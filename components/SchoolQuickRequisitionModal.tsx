'use client';

import React, { useState } from 'react';
import { 
  X, 
  GraduationCap, 
  Plus, 
  Minus, 
  Search, 
  Send 
} from 'lucide-react';
import { InventoryItem, StockMovement } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface SchoolQuickRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onDispatchRequisition?: (newMovements: StockMovement[], teacherName: string, classroom: string) => void;
  onSubmitRequisition?: (data: {
    teacherName: string;
    classroom: string;
    lessonDate: string;
    selectedItems: { item: InventoryItem; quantity: number }[];
  }) => void;
}

export const SchoolQuickRequisitionModal: React.FC<SchoolQuickRequisitionModalProps> = ({
  isOpen,
  onClose,
  items,
  onDispatchRequisition,
  onSubmitRequisition,
}) => {
  const [teacherName, setTeacherName] = useState('');
  const [classroom, setClassroom] = useState('');
  const [lessonDate, setLessonDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const filteredItems = items.filter((i) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      i.name.toLowerCase().includes(term) ||
      i.code.toLowerCase().includes(term) ||
      i.category.toLowerCase().includes(term)
    );
  });

  const handleQtyChange = (itemId: string, delta: number, maxQty: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const totalSelectedCount = Object.values(selectedItems).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !classroom.trim() || totalSelectedCount === 0) return;

    const requisitionData = Object.entries(selectedItems).map(([id, qty]) => {
      const item = items.find((i) => i.id === id)!;
      return { item, quantity: qty };
    });

    const movements: StockMovement[] = requisitionData.map(({ item, quantity }) => ({
      id: `mov-${Date.now()}-${item.id}`,
      itemId: item.id,
      itemName: item.name,
      itemCode: item.code,
      category: item.category,
      type: 'saida',
      quantity,
      previousQuantity: item.quantity,
      newQuantity: Math.max(0, item.quantity - quantity),
      date: new Date(lessonDate || Date.now()).toISOString(),
      responsible: teacherName.trim(),
      role: 'Professor(a)',
      destinationOrReason: `Aula/Turma: ${classroom.trim()}`,
      classroom: classroom.trim(),
    }));

    playBeep('success');

    if (onDispatchRequisition) {
      onDispatchRequisition(movements, teacherName.trim(), classroom.trim());
    }

    if (onSubmitRequisition) {
      onSubmitRequisition({
        teacherName: teacherName.trim(),
        classroom: classroom.trim(),
        lessonDate,
        selectedItems: requisitionData,
      });
    }

    // Reset form
    setTeacherName('');
    setClassroom('');
    setSelectedItems({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] rounded-xl shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-base text-stone-900">
                  Requisição Rápida para Professores
                </h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ atendimento docente express ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Dispensação ágil de materiais em lote para aulas diárias e projetos pedagógicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Teacher and Class Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F8FAF9] border border-stone-200/80">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Professor(a) Solicitante *
              </label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Ex: Profa. Mariana Castro"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Turma / Sala de Aula *
              </label>
              <input
                type="text"
                required
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="Ex: 4º Ano B (Sala 12)"
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Data da Aula
              </label>
              <input
                type="date"
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-xs font-medium"
              />
            </div>
          </div>

          {/* Quick Item Picker with Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-700">
                Selecione os Insumos para a Aula
              </label>
              <span className="text-[11px] text-stone-500">
                {totalSelectedCount} unidades no pedido
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do material, código ou categoria..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 text-xs"
              />
            </div>

            {/* List of items */}
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-stone-200 divide-y divide-stone-100 bg-white">
              {filteredItems.map((item) => {
                const qty = selectedItems[item.id] || 0;
                const isOutOfStock = item.quantity <= 0;

                return (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          {item.code}
                        </span>
                        <h4 className="font-semibold text-stone-900 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        Saldo atual: <strong className={isOutOfStock ? 'text-rose-600' : 'text-stone-700'}>{item.quantity}</strong> {item.unit} · {item.location}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={qty <= 0}
                        onClick={() => handleQtyChange(item.id, -1, item.quantity)}
                        className="p-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 border border-stone-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs tabular-nums text-stone-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity <= 0 || qty >= item.quantity}
                        onClick={() => handleQtyChange(item.id, 1, item.quantity)}
                        className="p-1 rounded-lg bg-[#EAF6ED] text-[#14532D] hover:bg-[#D2EEDA] border border-[#CDE5D5] disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500 font-medium">
              {totalSelectedCount > 0 ? `Total: ${totalSelectedCount} itens para entrega imediata.` : 'Selecione ao menos 1 item para confirmar.'}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={totalSelectedCount === 0 || !teacherName.trim() || !classroom.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#1E4620] font-semibold disabled:opacity-50 transition-colors shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                Dispensar Requisição
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
