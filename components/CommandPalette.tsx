'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Camera, 
  Tag, 
  MapPin, 
  Package, 
  Clock, 
  ClipboardCheck, 
  ShoppingCart, 
  X,
  FileText
} from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onSelectItem: (item: InventoryItem) => void;
  onOpenMovement: (type: 'entrada' | 'saida') => void;
  onOpenScanner: () => void;
  onOpenLabels: () => void;
  onOpenMap: () => void;
  onOpenKits: () => void;
  onOpenLoans: () => void;
  onOpenAudit: () => void;
  onOpenPurchases: () => void;
  onOpenSustainability: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onOpenMovement,
  onOpenScanner,
  onOpenLabels,
  onOpenMap,
  onOpenKits,
  onOpenLoans,
  onOpenAudit,
  onOpenPurchases,
  onOpenSustainability,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          playBeep('click');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.patrimonyNumber?.toLowerCase().includes(q)
    );
  }).slice(0, 5);

  const quickActions = [
    { label: 'Registrar Entrada de Material', icon: Plus, action: () => onOpenMovement('entrada'), color: 'text-emerald-700 bg-[#EAF6ED]' },
    { label: 'Registrar Saída / Requisição de Professor', icon: Minus, action: () => onOpenMovement('saida'), color: 'text-amber-800 bg-[#FFF7ED]' },
    { label: 'Bipar Código / Scanner de Câmera', icon: Camera, action: onOpenScanner, color: 'text-sky-700 bg-[#F0F9FF]' },
    { label: 'Gerador de Etiquetas com QR Code', icon: Tag, action: onOpenLabels, color: 'text-amber-700 bg-[#FFFBEB]' },
    { label: 'Mapeamento Visual do Depósito (Planta 2D)', icon: MapPin, action: onOpenMap, color: 'text-emerald-700 bg-[#ECFDF5]' },
    { label: 'Kits Prontos de Material Escolar', icon: Package, action: onOpenKits, color: 'text-purple-700 bg-[#FAF5FF]' },
    { label: 'Controle de Empréstimos & Devoluções', icon: Clock, action: onOpenLoans, color: 'text-sky-800 bg-[#F0F9FF]' },
    { label: 'Auditoria & Inventário Cego de Estoque', icon: ClipboardCheck, action: onOpenAudit, color: 'text-slate-700 bg-[#F8FAFC]' },
    { label: 'Planejador Semestral de Compras', icon: ShoppingCart, action: onOpenPurchases, color: 'text-emerald-800 bg-[#EAF6ED]' },
    { label: 'Painel de Sustentabilidade (Depósito Verde)', icon: FileText, action: onOpenSustainability, color: 'text-teal-700 bg-[#F0FDFA]' },
  ].filter(act => !query.trim() || act.label.toLowerCase().includes(query.toLowerCase()));

  const handleAction = (act: () => void) => {
    playBeep('click');
    act();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-stone-900/30 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-stone-200 flex items-center gap-2.5 bg-[#FAFBF9]">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar materiais, ações ou atalhos..."
            className="w-full bg-transparent text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-stone-500 bg-stone-100 rounded border border-stone-200">
            ESC
          </kbd>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto divide-y divide-stone-100 p-2 text-xs">
          {/* Matching Items Section */}
          {filteredItems.length > 0 && (
            <div className="pb-2">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Materiais Cadastrados
              </div>
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    playBeep('click');
                    onSelectItem(item);
                    onClose();
                  }}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#FAFBF9] flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-semibold">
                      {item.code}
                    </span>
                    <div>
                      <div className="font-semibold text-stone-900 group-hover:text-emerald-800">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {item.location || 'Depósito Central'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-stone-800">
                    {item.quantity} {item.unit}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions Section */}
          <div className="pt-2">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Ações Rápidas & Ferramentas
            </div>
            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAction(act.action)}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#FAFBF9] flex items-center gap-2.5 group transition-colors"
                >
                  <div className={`p-1.5 rounded-lg border border-stone-200/60 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-stone-800 group-hover:text-emerald-800">
                    {act.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-[#FAFBF9] border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 px-4">
          <span>Dica: Use <strong>Ctrl + K</strong> em qualquer tela para abrir</span>
          <span>Navegue com o mouse ou teclado</span>
        </div>
      </div>
    </div>
  );
};
