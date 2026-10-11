'use client';

import React from 'react';
import { X, Printer, CheckCircle2, School, ShieldCheck } from 'lucide-react';
import { StockMovement } from '@/types/inventory';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: StockMovement | null;
  schoolName: string;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  movement,
  schoolName,
}) => {
  if (!isOpen || !movement) return null;

  const isSaida = movement.type === 'saida';
  const dateObj = new Date(movement.date);
  const formattedDate = dateObj.toLocaleDateString('pt-BR');
  const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/80 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="print:hidden px-6 py-4 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#EAF4EE] text-[#1E4620] rounded-xl border border-[#CFE7D8]">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                Comprovante de Movimentação de Estoque
              </h3>
              <p className="text-[11px] text-stone-500">Documento oficial para prestação e protocolo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D6A4F] text-white text-xs font-semibold rounded-xl hover:bg-[#1E4620] transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 text-slate-900 space-y-6 text-xs sm:text-sm">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 text-center">
            <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide">
              {schoolName}
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-slate-700 mt-1 uppercase">
              {isSaida 
                ? 'TERMO DE REQUISIÇÃO E CAUTELA DE MATERIAL ESCOLAR' 
                : 'TERMO DE CONFERÊNCIA E ENTRADA DE MATERIAL'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Protocolo Eletrônico: #{movement.id.slice(-8).toUpperCase()} | Emitido em: {formattedDate} às {formattedTime}
            </p>
          </div>

          {/* Details Box */}
          <div className="border border-slate-300 rounded-lg p-4 space-y-3 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block">Tipo de Operação:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {isSaida ? 'Saída / Requisição de Uso' : 'Entrada / Reabastecimento'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Seção / Categoria:</span>
                <span className="font-bold text-slate-900 uppercase">
                  {movement.category}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <span className="font-semibold text-slate-500 block text-xs">Material Solicitado:</span>
              <span className="text-sm font-bold text-slate-900">
                {movement.itemName}
              </span>
              <span className="text-xs text-slate-600 block mt-0.5 font-mono">
                Código: {movement.itemCode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-200 pt-2">
              <div>
                <span className="font-semibold text-slate-500 block">Quantidade Retirada:</span>
                <span className="text-base font-extrabold text-blue-700 font-mono">
                  {movement.quantity}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-500 block">Saldo Restante no Almoxarifado:</span>
                <span className="text-sm font-bold text-slate-700 font-mono">
                  {movement.newQuantity}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2 text-xs">
              <span className="font-semibold text-slate-500 block">
                {isSaida ? 'Solicitante / Professor(a):' : 'Recebido / Conferido por:'}
              </span>
              <span className="font-bold text-slate-900">
                {movement.responsible} {movement.role ? `(${movement.role})` : ''}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-2 text-xs">
              <span className="font-semibold text-slate-500 block">
                {isSaida ? 'Turma / Sala de Aula / Destino:' : 'Origem / Fornecedor:'}
              </span>
              <span className="font-bold text-slate-900">
                {movement.destinationOrReason}
              </span>
            </div>

            {movement.notes && (
              <div className="border-t border-slate-200 pt-2 text-xs text-slate-600 italic">
                Obs: {movement.notes}
              </div>
            )}
          </div>

          {/* Legal / Commitment notice for school */}
          <p className="text-[11px] text-slate-500 leading-tight italic text-justify">
            {isSaida
              ? 'Declaro ter recebido os materiais acima relacionados em perfeitas condições para fins estritamente pedagógicos e de funcionamento escolar, comprometendo-me com a sua correta utilização e zelo pelo patrimônio escolar.'
              : 'Declaro a conferência física e quantitativa dos materiais acima descritos, atestando sua conformidade com a nota fiscal ou guia de remessa do almoxarifado.'}
          </p>

          {/* Signature Lines */}
          <div className="grid grid-cols-2 gap-8 pt-6">
            <div className="text-center">
              <div className="border-b border-slate-800 mb-1.5 pb-2 min-h-[50px] flex items-end justify-center">
                {movement.signatureDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={movement.signatureDataUrl}
                    alt="Assinatura Digital"
                    className="max-h-12 max-w-[160px] object-contain"
                  />
                ) : (
                  <div className="h-8"></div>
                )}
              </div>
              <p className="font-bold text-xs">{movement.responsible}</p>
              <p className="text-[10px] text-slate-500">{movement.role || 'Solicitante'}</p>
              {movement.signatureDataUrl && (
                <span className="text-[9px] text-emerald-700 font-mono block mt-0.5">
                  ✓ Assinado Digitalmente na Tela
                </span>
              )}
            </div>
            <div className="text-center">
              <div className="border-b border-slate-800 mb-1.5 pb-2 min-h-[50px] flex items-end justify-center">
                <div className="h-8"></div>
              </div>
              <p className="font-bold text-xs">Almoxarifado / Depósito</p>
              <p className="text-[10px] text-slate-500">Conferência & Liberação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
