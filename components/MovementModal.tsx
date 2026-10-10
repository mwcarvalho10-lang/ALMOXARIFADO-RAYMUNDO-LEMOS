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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A2024] rounded-3xl shadow-xl border border-stone-200/80 dark:border-stone-800 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          type === 'entrada' ? 'bg-[#EAF4EE] dark:bg-emerald-950/40 border-[#CFE7D8] dark:border-emerald-900/60' : 'bg-[#FFF4ED] dark:bg-amber-950/40 border-[#FED7AA] dark:border-amber-900/60'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              type === 'entrada' ? 'bg-[#D2EEDA] text-[#1E4620]' : 'bg-[#FED7AA] text-[#8C3F1B]'
            }`}>
              {type === 'entrada' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {type === 'entrada' ? 'Registrar Entrada de Material' : 'Registrar Saída / Requisição de Material'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Movement Type Toggle */}
          <div className="flex rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200/70 dark:border-stone-700">
            <button
              type="button"
              onClick={() => {
                setType('saida');
                setPrintReceipt(true);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'saida'
                  ? 'bg-white dark:bg-[#1A2024] text-[#8C3F1B] border border-[#FED7AA] shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#B45309]" />
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
                  ? 'bg-white dark:bg-[#1A2024] text-[#1E4620] border border-[#CFE7D8] shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#245D40]" />
              Entrada (Reposição)
            </button>
          </div>

          {/* Item Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Selecione o Material do Depósito *
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
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
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              type === 'entrada'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/60 border-rose-200 text-rose-900'
            }`}>
              <div>
                <span className="font-bold">Saldo Atual: </span>
                <span className="font-mono text-sm">{currentItem.quantity} {currentItem.unit}</span>
                {currentItem.patrimonyNumber && (
                  <span className="ml-2 font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                    Patrimônio: {currentItem.patrimonyNumber}
                  </span>
                )}
              </div>
              <div>
                <span className="font-bold">Após Operação: </span>
                <span className="font-mono text-sm font-extrabold">
                  {type === 'entrada'
                    ? currentItem.quantity + (quantity || 0)
                    : Math.max(0, currentItem.quantity - (quantity || 0))}{' '}
                  {currentItem.unit}
                </span>
              </div>
            </div>
          )}

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantidade a {type === 'entrada' ? 'Receber' : 'Retirar'} *
              </label>
              <input
                type="number"
                min="1"
                max={type === 'saida' && currentItem ? currentItem.quantity : undefined}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unidade
              </label>
              <input
                type="text"
                disabled
                value={currentItem?.unit || 'un'}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-100 rounded-lg border border-slate-200 text-slate-500"
              />
            </div>
          </div>

          {/* Responsible Person & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {type === 'entrada' ? 'Entregue / Conferido por *' : 'Solicitante / Professor(a) *'}
              </label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder={type === 'entrada' ? 'Ex: Almoxarife Valdemir' : 'Ex: Profª Ana Lúcia'}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cargo / Função
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="Professor(a)">Professor(a)</option>
                <option value="Coordenação Pedagógica">Coordenação Pedagógica</option>
                <option value="Equipe de Limpeza e Apoio">Equipe de Limpeza e Apoio</option>
                <option value="Direção Escolar">Direção Escolar</option>
                <option value="Secretaria">Secretaria Escolar</option>
                <option value="TI / Informática">TI / Informática</option>
                <option value="Responsável pelo Depósito">Responsável pelo Depósito</option>
              </select>
            </div>
          </div>

          {/* Destination / Reason & Classroom */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-slate-400" />
                {type === 'entrada' ? 'Origem / Motivo da Entrada *' : 'Finalidade Pedagógica / Atividade *'}
              </label>
              <input
                type="text"
                value={destinationOrReason}
                onChange={(e) => setDestinationOrReason(e.target.value)}
                placeholder={
                  type === 'entrada'
                    ? 'Ex: Reposição Semestral - Distribuidora Papel & Arte'
                    : 'Ex: Projeto de Artes / Feira Cultural / Aulas Regulares'
                }
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1">
                Turma / Sala
              </label>
              <input
                type="text"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="Ex: 5º Ano B / Lab"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Optional Invoice or Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {type === 'entrada' ? 'Nota Fiscal / Guia (Opcional)' : 'Nº de Cautela / Memorando'}
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Ex: NF-4921 ou MEMO-12"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Devolução prevista para sexta-feira"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Digital Signature Pad for Saída */}
          {type === 'saida' && (
            <div className="pt-1">
              <DigitalSignaturePad
                onSaveSignature={(data) => setSignatureData(data)}
                onClearSignature={() => setSignatureData('')}
              />
            </div>
          )}

          {/* Print Receipt Option */}
          {type === 'saida' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-slate-600" />
                <div>
                  <span className="text-xs font-bold text-slate-800">
                    Gerar Comprovante / Termo de Cautela
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Abre janela formatada para impressão com assinatura do solicitante
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={printReceipt}
                onChange={(e) => setPrintReceipt(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-xl shadow-2xs transition-colors ${
                type === 'entrada' ? 'bg-[#2D6A4F] hover:bg-[#23563F]' : 'bg-[#991B1B] hover:bg-[#7F1D1D]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar {type === 'entrada' ? 'Entrada' : 'Saída'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
