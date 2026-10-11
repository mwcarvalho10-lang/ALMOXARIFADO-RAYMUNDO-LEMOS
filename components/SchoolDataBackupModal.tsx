'use client';

import React, { useRef, useState } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  FileText, 
  Printer,
  Trash2,
  KeyRound,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { InventoryItem, StockMovement, EquipmentLoan } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface SchoolDataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  movements: StockMovement[];
  loans: EquipmentLoan[];
  schoolName: string;
  onRestoreData: (newItems: InventoryItem[], newMovements: StockMovement[], newLoans: EquipmentLoan[]) => void;
  onResetDefaults?: () => void;
  onClearAllData?: () => void;
}

export const SchoolDataBackupModal: React.FC<SchoolDataBackupModalProps> = ({
  isOpen,
  onClose,
  items,
  movements,
  loans,
  schoolName,
  onRestoreData,
  onResetDefaults,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const backupData = {
      schoolName,
      exportDate: new Date().toISOString(),
      version: '2.5.0-escolar',
      items,
      movements,
      loans,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_almoxarifado_${schoolName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    playBeep('success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed.items) && Array.isArray(parsed.movements)) {
          if (confirm(`Deseja restaurar o backup de "${parsed.schoolName || 'Escola'}" com ${parsed.items.length} materiais? Os dados atuais serão substituídos.`)) {
            onRestoreData(parsed.items, parsed.movements, parsed.loans || []);
            playBeep('success');
            onClose();
          }
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmClearAllData = () => {
    setPinError('');
    if (pinInput.trim() !== '122026') {
      playBeep('alert');
      setPinError('PIN incorreto! Para autorizar o zeramento total da base de dados, digite o PIN 122026.');
      return;
    }

    playBeep('success');
    if (onClearAllData) {
      onClearAllData();
    } else {
      onRestoreData([], [], []);
    }
    setShowPinPrompt(false);
    setPinInput('');
    onClose();
  };

  const handlePrintAccountabilityReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const totalPatrimonyValue = items.reduce((acc, i) => acc + (i.quantity * (i.estimatedUnitCost || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF4EE] text-[#1E4620] rounded-xl border border-[#CFE7D8]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Segurança, Restauração & Backup
                </h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ gestão de dados ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Backup em arquivo, restauração e opções de zeramento do depósito
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAF9] border border-stone-200/80 flex items-center justify-between">
            <div>
              <div className="font-semibold text-stone-800">{schoolName}</div>
              <div className="text-[11px] text-stone-500">
                {items.length} materiais cadastrados · {movements.length} movimentações registradas
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider font-medium">Patrimônio Estimado</div>
              <div className="font-bold text-[#1E4620] text-sm tabular-nums">
                {totalPatrimonyValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>

          {/* Backup Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-[#2D6A4F]/50 flex flex-col justify-between space-y-3 transition-colors">
              <div>
                <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                  <Download className="w-4 h-4 text-[#2D6A4F]" />
                  Salvar Backup (JSON)
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Gere um arquivo de segurança contendo todos os materiais, estoques e histórico da escola.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="w-full py-2 px-3 rounded-xl bg-[#EAF4EE] text-[#1E4620] hover:bg-[#DCEEE2] font-semibold text-center transition-colors"
              >
                Baixar Arquivo .json
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200/80 hover:border-sky-400 flex flex-col justify-between space-y-3 transition-colors">
              <div>
                <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
                  <Upload className="w-4 h-4 text-sky-700" />
                  Restaurar Backup (.json)
                </div>
                <p className="text-[11px] text-stone-500 leading-snug">
                  Carregue um arquivo gerado anteriormente para recuperar dados em outro computador.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-3 rounded-xl bg-[#F0F9FF] text-sky-800 hover:bg-[#E0F2FE] font-semibold text-center transition-colors"
              >
                Selecionar Arquivo .json
              </button>
            </div>
          </div>

          {/* Critical Section: Reset / Clear All Data with PIN 122026 */}
          <div className="p-4 rounded-2xl bg-[#FFF5F5] border border-[#FED7D7] space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-white border border-[#FED7D7] text-[#991B1B] shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <span>Zerar Todos os Dados do Estoque</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white text-[#991B1B] border border-[#FED7D7]">
                    PIN: 122026
                  </span>
                </h4>
                <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                  Apaga permanentemente todos os materiais, registros de entradas/saídas e empréstimos, reiniciando o depósito totalmente zerado.
                </p>
              </div>
            </div>

            {!showPinPrompt ? (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinPrompt(true);
                    setPinError('');
                    setPinInput('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Zerar Dados (Exige PIN 122026)
                </button>

                {onResetDefaults && (
                  <button
                    type="button"
                    onClick={onResetDefaults}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-medium text-xs transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-stone-400" />
                    Restaurar Padrão Escolar
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#FED7D7] space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-800 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-[#991B1B]" />
                    Digite o PIN de Segurança para confirmar (122026):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPinPrompt(false);
                      setPinError('');
                    }}
                    className="text-stone-400 hover:text-stone-600 text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={pinInput}
                    onChange={(e) => {
                      setPinError('');
                      setPinInput(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConfirmClearAllData();
                      }
                    }}
                    placeholder="Digite 122026..."
                    className="flex-1 px-3 py-2 text-xs font-mono font-bold rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-[#FAFBF9]"
                  />

                  <button
                    type="button"
                    onClick={handleConfirmClearAllData}
                    className="px-4 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors"
                  >
                    Confirmar Zeramento
                  </button>
                </div>

                {pinError && (
                  <p className="text-[11px] text-[#991B1B] font-medium flex items-center gap-1 animate-in fade-in">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {pinError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Accountability Print Box */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#FBE8CE] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Relatório de Prestação de Contas (APM & Conselho)
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Folha executiva formatada para prestação de contas dos recursos aplicados.
              </p>
            </div>
            <button
              onClick={handlePrintAccountabilityReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium shrink-0 hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
