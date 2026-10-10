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
  Moon, 
  Sun, 
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
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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
  isDarkMode,
  onToggleDarkMode,
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
    { label: 'Registrar Entrada de Material', icon: Plus, action: () => onOpenMovement('entrada'), color: 'text-emerald-500' },
    { label: 'Registrar Saída / Requisição de Professor', icon: Minus, action: () => onOpenMovement('saida'), color: 'text-rose-500' },
    { label: 'Bipar Código / Scanner de Câmera', icon: Camera, action: onOpenScanner, color: 'text-blue-500' },
    { label: 'Gerador de Etiquetas com QR Code', icon: Tag, action: onOpenLabels, color: 'text-amber-500' },
    { label: 'Mapeamento Visual do Depósito (Planta 2D)', icon: MapPin, action: onOpenMap, color: 'text-indigo-500' },
    { label: 'Kits Prontos de Material Escolar', icon: Package, action: onOpenKits, color: 'text-purple-500' },
    { label: 'Controle de Empréstimos & Devoluções', icon: Clock, action: onOpenLoans, color: 'text-blue-600' },
    { label: 'Auditoria & Inventário Cego de Estoque', icon: ClipboardCheck, action: onOpenAudit, color: 'text-emerald-600' },
    { label: 'Planejador Semestral de Compras', icon: ShoppingCart, action: onOpenPurchases, color: 'text-indigo-600' },
    { label: 'Painel de Sustentabilidade (Depósito Verde)', icon: FileText, action: onOpenSustainability, color: 'text-teal-600' },
    { 
      label: isDarkMode ? 'Mudar para Tema Claro' : 'Mudar para Modo Noturno (Dark)', 
      icon: isDarkMode ? Sun : Moon, 
      action: onToggleDarkMode, 
      color: 'text-slate-400' 
    },
  ].filter(act => !query.trim() || act.label.toLowerCase().includes(query.toLowerCase()));

  const handleAction = (act: () => void) => {
    playBeep('click');
    act();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#0c1711]/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#d8eadc] dark:border-[#1d3827] flex items-center gap-3 bg-[#f8fbf9] dark:bg-[#122419]">
          <Search className="w-5 h-5 text-[#4f7d61]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite para buscar materiais, ações ou atalhos..."
            className="w-full bg-transparent text-sm text-[#143e26] dark:text-[#e4f6ec] placeholder:text-[#6a927a] focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-[#426a52] dark:text-[#8ea998] bg-[#eef7f1] dark:bg-[#163122] rounded-lg border border-[#cbe4d4] dark:border-[#224b34]">
            ESC
          </kbd>
          <button onClick={onClose} className="text-[#527d63] hover:text-[#184f2f] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto divide-y divide-[#e5f1e8] dark:divide-[#1d3827] p-2.5 text-xs">
          {/* Matching Items Section */}
          {filteredItems.length > 0 && (
            <div className="pb-2">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#527d63] dark:text-[#8eb89e]">
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
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#f2f9f4] dark:hover:bg-[#163122] flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[#255636] dark:text-[#a0dbb7] bg-[#e7f4eb] dark:bg-[#163122] px-2 py-0.5 rounded-lg border border-[#cfe6d6] dark:border-[#224831] font-bold">
                      {item.code}
                    </span>
                    <div>
                      <div className="font-bold text-[#143d25] dark:text-[#e4f6ec] group-hover:text-[#287b4a] dark:group-hover:text-[#8ee2ae]">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[#527d63] dark:text-[#8eb89e]">
                        {item.location || 'Depósito Central'}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-[#1f663c] dark:text-[#8ee2ae]">
                    {item.quantity} {item.unit}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Actions Section */}
          <div className="pt-2">
            <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#527d63] dark:text-[#8eb89e]">
              Ações Rápidas & Ferramentas
            </div>
            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleAction(act.action)}
                  className="w-full px-3 py-2 text-left rounded-xl hover:bg-[#f2f9f4] dark:hover:bg-[#163122] flex items-center gap-2.5 group transition-colors"
                >
                  <div className={`p-2 rounded-xl bg-[#edf7f1] dark:bg-[#163122] border border-[#d0e5d6] dark:border-[#21432f] ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-[#143e26] dark:text-[#e4f6ec] group-hover:text-[#287b4a] dark:group-hover:text-[#8ee2ae]">
                    {act.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f4faf6] dark:bg-[#122419] border-t border-[#d8eadc] dark:border-[#1d3827] flex items-center justify-between text-[11px] text-[#527d63] dark:text-[#8eb89e] px-4">
          <span>Dica: Use <strong>⌘K</strong> ou <strong>Ctrl+K</strong> em qualquer tela para abrir</span>
          <span>Navegue com o mouse ou teclado</span>
        </div>
      </div>
    </div>
  );
};
