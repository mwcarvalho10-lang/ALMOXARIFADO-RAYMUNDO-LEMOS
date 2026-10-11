'use client';

import React, { useState } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  School,
  Printer
} from 'lucide-react';
import { InventoryItem, MovementType, StockMovement } from '@/types/inventory';
import { DigitalSignaturePad } from './DigitalSignaturePad';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMovement: (movement: StockMovement, openPrintReceipt: boolean) => void;
  items: InventoryItem[];
  preselectedItemId?: string | null;
  defaultType?: MovementType;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  onSaveMovement,
  items,
  preselectedItemId,
  defaultType = 'saida',
}) => {
  const [type, setType] = useState<MovementType>(defaultType);
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    if (preselectedItemId) return preselectedItemId;
    if (items.length > 0) return items[0].id;
    return '';
  });
  const [quantity, setQuantity] = useState<number>(1);
  const [responsible, setResponsible] = useState<string>('');
  const [role, setRole] = useState<string>('Professor(a)');
  const [destinationOrReason, setDestinationOrReason] = useState<string>('');
  const [classroom, setClassroom] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');
  const [printReceipt, setPrintReceipt] = useState<boolean>(defaultType === 'saida');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentItem) {
      setError('Por favor, selecione um material válido da lista.');
      return;
    }

    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    if (!responsible.trim()) {
      setError('Informe o nome do responsável pela retirada ou entrega.');
      return;
    }

    if (!destinationOrReason.trim()) {
      setError('Informe a turma, sala ou finalidade do uso.');
      return;
    }

    // Validate exit quantity against existing stock
    if (type === 'saida' && quantity > currentItem.quantity) {
      setError(
        `Estoque insuficiente! Você tentou retirar ${quantity} ${currentItem.unit}, mas há apenas ${currentItem.quantity} ${currentItem.unit} no depósito.`
      );
      return;
    }

    const previousQty = currentItem.quantity;
    const newQty = type === 'entrada' ? previousQty + quantity : Math.max(0, previousQty - quantity);

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      itemId: currentItem.id,
      itemName: currentItem.name,
      itemCode: currentItem.code,
      category: currentItem.category,
      type,
      quantity,
      previousQuantity: previousQty,
      newQuantity: newQty,
      date: new Date().toISOString(),
      responsible: responsible.trim(),
      role,
      destinationOrReason: destinationOrReason.trim(),
      classroom: classroom.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      signatureDataUrl: signatureData || undefined,
    };

    onSaveMovement(movement, printReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          type === 'entrada' ? 'bg-[#EAF6ED] border-[#CDE5D5]' : 'bg-[#FFF7ED] border-[#FED7AA]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              type === 'entrada' ? 'bg-[#D2EEDA] text-[#14532D] border-[#BBF7D0]' : 'bg-[#FED7AA] text-[#C2410C] border-[#FDBA74]'
            }`}>
              {type === 'entrada' ? <ArrowDownLeft className="w-5 h-5 text-[#059669]" /> : <ArrowUpRight className="w-5 h-5 text-[#EA580C]" />}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {type === 'entrada' ? 'Registrar Entrada de Material' : 'Registrar Saída / Requisição'}
                </h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ livro de registro ~
                </span>
              </div>
              <p className="text-xs text-stone-600">
                {type === 'entrada' ? 'Recebimento e reabastecimento do depósito' : 'Retirada para sala de aula, professor ou setor escolar'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Movement Type Toggle */}
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200/70">
            <button
              type="button"
              onClick={() => {
                setType('saida');
                setPrintReceipt(true);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'saida'
                  ? 'bg-white text-[#C2410C] border border-[#FED7AA] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#EA580C]" />
              Saída (Uso Escolar)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('entrada');
                setPrintReceipt(false);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'entrada'
                  ? 'bg-white text-[#14532D] border border-[#CDE5D5] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
              Entrada (Reposição)
            </button>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Selecione o Material do Depósito *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  [{it.code}] {it.name} — Estoque Atual: {it.quantity} {it.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {currentItem && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between shadow-2xs ${
              type === 'entrada' ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#FFF7ED] border-[#FED7AA]'
            }`}>
              <div>
                <span className="font-semibold text-stone-800">Saldo Atual:</span>{' '}
                <strong className="text-stone-900 font-bold tabular-nums">{currentItem.quantity} {currentItem.unit}</strong>
                <span className="text-[11px] text-stone-500 ml-2">({currentItem.location || 'Depósito Central'})</span>
              </div>
              <div className="font-semibold">
                Novo saldo previsto:{' '}
                <strong className={`tabular-nums ${type === 'entrada' ? 'text-[#065F46]' : 'text-[#C2410C]'}`}>
                  {type === 'entrada'
                    ? currentItem.quantity + (quantity || 0)
                    : Math.max(0, currentItem.quantity - (quantity || 0))}{' '}
                  {currentItem.unit}
                </strong>
              </div>
            </div>
          )}

          {/* Quantity and Responsible Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-bold tabular-nums"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-stone-400" />
                Nome do Responsável / Docente *
              </label>
              <input
                type="text"
                required
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Ex: Prof. Carlos Eduardo / Ana Secretaria"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Role and Classroom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Função / Setor
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden font-medium"
              >
                <option value="Professor(a)">Professor(a)</option>
                <option value="Coordenador(a)">Coordenador(a)</option>
                <option value="Diretor(a)">Diretor(a)</option>
                <option value="Secretaria">Secretaria</option>
                <option value="Equipe de Limpeza">Equipe de Limpeza</option>
                <option value="Monitor(a)">Monitor(a)</option>
                <option value="Fornecedor / Entrega">Fornecedor / Entrega</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-stone-400" />
                {type === 'entrada' ? 'Origem / Motivo da Entrada *' : 'Finalidade Pedagógica / Atividade *'}
              </label>
              <input
                type="text"
                required
                value={destinationOrReason}
                onChange={(e) => setDestinationOrReason(e.target.value)}
                placeholder={
                  type === 'entrada'
                    ? 'Ex: Reposição Semestral - Distribuidora Papel & Arte'
                    : 'Ex: Projeto de Artes / Feira Cultural / Aulas Regulares'
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Optional Invoice or Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {type === 'entrada' ? 'Nota Fiscal / Guia (Opcional)' : 'Turma / Sala / Cautela'}
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder={type === 'entrada' ? 'Ex: NF-4921 ou GUIA-08' : 'Ex: 4º Ano A - Sala 12'}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Devolução de sobras prevista na sexta-feira"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Digital Signature Pad */}
          <div className="pt-1">
            <DigitalSignaturePad
              onSave={setSignatureData}
              onClear={() => setSignatureData('')}
            />
          </div>

          {/* Print Receipt Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="printReceipt"
              checked={printReceipt}
              onChange={(e) => setPrintReceipt(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
            />
            <label htmlFor="printReceipt" className="text-xs text-stone-700 font-medium cursor-pointer flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-stone-500" />
              Abrir comprovante oficial de retirada para impressão / assinatura física
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[#FFF5F5] border border-[#FED7D7] rounded-xl text-xs text-[#991B1B] flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-2xs transition-colors flex items-center gap-1.5 ${
                type === 'entrada'
                  ? 'bg-[#2D6A4F] hover:bg-[#23563F]'
                  : 'bg-[#B45309] hover:bg-[#92400E]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{type === 'entrada' ? 'Confirmar Entrada' : 'Confirmar Saída'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
