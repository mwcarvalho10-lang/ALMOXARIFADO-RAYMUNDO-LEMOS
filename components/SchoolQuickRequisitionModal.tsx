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
import { InventoryItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface SchoolQuickRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSubmitRequisition: (data: {
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

    playBeep('success');
    onSubmitRequisition({
      teacherName: teacherName.trim(),
      classroom: classroom.trim(),
      lessonDate,
      selectedItems: requisitionData,
    });

    // Reset form
    setTeacherName('');
    setClassroom('');
    setSelectedItems({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] rounded-xl shadow-2xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Requisição Rápida para Aula
                </h3>
                <span className="hidden sm:inline font-cursive text-lg text-purple-800 font-normal">
                  ~ rotina docente ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Selecione os materiais pedagógicos necessários para a sua turma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Teacher and Class Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Professor(a) Solicitante
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Profª Ana Lúcia"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Turma / Ano / Sala
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 3º Ano B / Sala 14"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">
                Data da Aula / Atividade
              </label>
              <input
                type="date"
                required
                value={lessonDate}
                onChange={(e) => setLessonDate(e.target.value)}
                className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Item Search */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-stone-800">
                Selecione os Materiais Disponíveis no Depósito
              </label>
              <span className="text-[11px] text-stone-500 font-medium">
                {totalSelectedCount} unidades selecionadas
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por nome do material (ex: sulfite, canetão, tinta, tesoura)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#FAFBF9] border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Item list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-2xl p-1 bg-white">
              {filteredItems.map((item) => {
                const qty = selectedItems[item.id] || 0;
                const isOutOfStock = item.quantity <= 0;

                return (
                  <div
                    key={item.id}
                    className="p-2.5 flex items-center justify-between gap-3 hover:bg-[#FAFBF9] rounded-xl transition-colors"
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
                        className="p-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 disabled:opacity-30 border border-stone-200"
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
                        className="p-1 rounded-lg bg-[#EAF6ED] text-[#14532D] hover:bg-[#D2EEDA] border border-[#CDE5D5] disabled:opacity-30"
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
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={totalSelectedCount === 0 || !teacherName.trim() || !classroom.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#23563F] font-semibold disabled:opacity-50 transition-colors shadow-2xs"
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
