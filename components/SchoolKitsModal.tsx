'use client';

import React, { useState } from 'react';
import { Package, X, CheckCircle2, ArrowRight, User, School, Sparkles, Layers } from 'lucide-react';
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
      const invItem = items.find((i) => i.id === kitItem.itemId || i.name.includes(kitItem.itemName));
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
      const invItem = items.find((i) => i.id === kitItem.itemId || i.name.includes(kitItem.itemName)) || {
        id: kitItem.itemId,
        name: kitItem.itemName,
        code: 'KIT-MAT',
        category: 'papelaria',
        quantity: kitItem.quantity,
      };

      const prevQty = (invItem as any).quantity;
      const newQty = Math.max(0, prevQty - kitItem.quantity);

      return {
        id: `mov-kit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1711]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#eaf5ee] dark:bg-[#142d1f] border-b border-[#d2ebdc] dark:border-[#1d3827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#348a57] text-white rounded-xl shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#143e26] dark:text-[#e4f6ec]">Kits Escolares Prontos (Dispensação em Lote)</h3>
              <p className="text-xs text-[#527d63] dark:text-[#8eb89e]">
                Agilize a entrega de materiais para eventos pedagógicos, feiras e rotinas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] p-1.5 rounded-lg hover:bg-[#e4f3e8] dark:hover:bg-[#163122]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Kit selector tabs */}
          <div className="md:col-span-5 space-y-2 border-r border-slate-200 dark:border-slate-800 pr-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Selecione o Kit:
            </span>
            {INITIAL_SCHOOL_KITS.map((kit) => {
              const isSelected = kit.id === selectedKit.id;
              return (
                <button
                  key={kit.id}
                  onClick={() => setSelectedKit(kit)}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    {kit.badge}
                  </span>
                  <h4 className="text-xs font-bold mt-1 line-clamp-1">{kit.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {kit.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Form & Items inside kit */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Itens inclusos no {selectedKit.name}:
              </h4>
              <p className="text-xs text-slate-500">{selectedKit.description}</p>
            </div>

            {/* Items table */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700 text-xs">
              {selectedKit.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.itemName}
                  </span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Recipient Form */}
            <form onSubmit={handleDispatch} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Professor / Solicitante *
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ex: Profª Fabiana Costa"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cargo / Função
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Professor(a)">Professor(a)</option>
                    <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                    <option value="Equipe de Limpeza">Equipe de Limpeza</option>
                    <option value="Direção">Direção</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Turma ou Destino do Kit *
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: 4º Ano A - Atividade Prática / Laboratório"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                  {error}
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
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
