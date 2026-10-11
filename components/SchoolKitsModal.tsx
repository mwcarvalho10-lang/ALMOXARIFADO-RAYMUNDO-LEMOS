'use client';

import React, { useState } from 'react';
import { Package, X, CheckCircle2 } from 'lucide-react';
import { SchoolKit, InventoryItem, StockMovement } from '@/types/inventory';
import { INITIAL_SCHOOL_KITS } from '@/lib/mock-data';
import { playBeep } from '@/lib/audio';

interface SchoolKitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onDispatchKit: (movements: StockMovement[], kitName: string) => void;
}

export const SchoolKitsModal: React.FC<SchoolKitsModalProps> = ({
  isOpen,
  onClose,
  items,
  onDispatchKit,
}) => {
  const [selectedKit, setSelectedKit] = useState<SchoolKit>(INITIAL_SCHOOL_KITS[0]);
  const [responsible, setResponsible] = useState('');
  const [role, setRole] = useState('Professor(a)');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!responsible.trim()) {
      setError('Informe o nome do professor ou responsável pelo recebimento do kit.');
      return;
    }
    if (!destination.trim()) {
      setError('Informe a turma, sala ou finalidade do uso do kit.');
      return;
    }

    // Verify all items have enough stock
    for (const kitItem of selectedKit.items) {
      const invItem = items.find((i) => i.id === kitItem.itemId || i.name.toLowerCase().includes(kitItem.itemName.toLowerCase()));
      if (!invItem) continue;
      if (invItem.quantity < kitItem.quantity) {
        setError(
          `Estoque insuficiente para o item "${invItem.name}". Disponível: ${invItem.quantity}, necessário para o kit: ${kitItem.quantity}.`
        );
        return;
      }
    }

    // Create movement for each item in the kit
    const now = new Date().toISOString();
    const movements: StockMovement[] = selectedKit.items.map((kitItem) => {
      const invItem = items.find((i) => i.id === kitItem.itemId || i.name.toLowerCase().includes(kitItem.itemName.toLowerCase())) || {
        id: kitItem.itemId,
        name: kitItem.itemName,
        code: 'KIT-MAT',
        category: 'papelaria',
        quantity: kitItem.quantity,
      };

      const prevQty = (invItem as any).quantity;
      const newQty = Math.max(0, prevQty - kitItem.quantity);

      return {
        id: `mov-kit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        itemId: invItem.id,
        itemName: invItem.name,
        itemCode: (invItem as any).code || 'KIT-001',
        category: (invItem as any).category || 'papelaria',
        type: 'saida',
        quantity: kitItem.quantity,
        previousQuantity: prevQty,
        newQuantity: newQty,
        date: now,
        responsible: responsible.trim(),
        role,
        destinationOrReason: `[${selectedKit.name}] - ${destination.trim()}`,
      };
    });

    playBeep('success');
    onDispatchKit(movements, selectedKit.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF] rounded-xl shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-base text-stone-900">Kits Escolares Prontos</h3>
                <span className="hidden sm:inline font-cursive text-lg text-purple-800 font-normal">
                  ~ dispensação em lote ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Agilize a entrega de conjuntos de materiais para eventos pedagógicos, feiras e rotinas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 text-xs">
          {/* Kit selector tabs */}
          <div className="md:col-span-5 space-y-2 border-r border-stone-200 pr-4">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Selecione o Kit:
            </span>
            {INITIAL_SCHOOL_KITS.map((kit) => {
              const isSelected = kit.id === selectedKit.id;
              return (
                <button
                  key={kit.id}
                  onClick={() => setSelectedKit(kit)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-[#FAF5FF] text-purple-950 ring-2 ring-purple-500/10 shadow-2xs font-semibold'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200">
                    {kit.badge}
                  </span>
                  <h4 className="text-xs font-bold mt-1.5 line-clamp-1">{kit.name}</h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                    {kit.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Form & Items inside kit */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                Itens inclusos no {selectedKit.name}:
              </h4>
              <p className="text-xs text-stone-500">{selectedKit.description}</p>
            </div>

            {/* Items table */}
            <div className="bg-[#FAFBF9] rounded-2xl p-3 border border-stone-200 divide-y divide-stone-100 text-xs shadow-2xs">
              {selectedKit.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                  <span className="font-semibold text-stone-800">
                    {item.itemName}
                  </span>
                  <span className="font-mono font-bold text-purple-800 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Recipient Form */}
            <form onSubmit={handleDispatch} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Professor / Solicitante *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex: Profª Fabiana Costa"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Cargo / Função
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden font-medium"
                  >
                    <option value="Professor(a)">Professor(a)</option>
                    <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                    <option value="Equipe de Limpeza">Equipe de Limpeza</option>
                    <option value="Direção">Direção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Turma ou Destino do Kit *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: 4º Ano A - Atividade Prática / Laboratório"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
                />
              </div>

              {error && (
                <p className="text-xs text-[#991B1B] bg-[#FFF5F5] p-2.5 rounded-xl border border-[#FED7D7] font-medium">
                  {error}
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Dispensar Kit Completo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
