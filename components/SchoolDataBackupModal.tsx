'use client';

import React, { useRef } from 'react';
import { 
  X, 
  Database, 
  Download, 
  Upload, 
  FileText, 
  Printer, 
  CheckCircle2, 
  ShieldCheck,
  AlertTriangle
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
}

export const SchoolDataBackupModal: React.FC<SchoolDataBackupModalProps> = ({
  isOpen,
  onClose,
  items,
  movements,
  loans,
  schoolName,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePrintAccountabilityReport = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const totalPatrimonyValue = items.reduce((acc, i) => acc + (i.quantity * (i.estimatedUnitCost || 0)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A2024] rounded-3xl shadow-xl border border-stone-200/80 dark:border-stone-800 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] dark:bg-[#151A1D] border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF4EE] dark:bg-emerald-950/60 text-[#245D40] dark:text-emerald-300 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Segurança Patrimonial & Backup
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Exportação de dados e relatório para o Conselho Escolar / APM
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
          <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 flex items-center justify-between">
            <div>
              <div className="font-semibold text-stone-800 dark:text-stone-200">{schoolName}</div>
              <div className="text-[11px] text-stone-500">
                {items.length} materiais cadastrados · {movements.length} movimentações registradas
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-400 uppercase">Patrimônio Estimado</div>
              <div className="font-bold text-emerald-800 dark:text-emerald-300 text-sm tabular-nums">
                {totalPatrimonyValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </div>
          </div>

          {/* Backup Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-emerald-300 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 mb-1">
                  <Download className="w-4 h-4 text-emerald-700" />
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

            <div className="p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 hover:border-sky-300 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 mb-1">
                  <Upload className="w-4 h-4 text-sky-700" />
                  Restaurar Backup
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
                Selecionar Arquivo
              </button>
            </div>
          </div>

          {/* Accountability Print Box */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-amber-950/20 border border-[#FBE8CE] dark:border-amber-900/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                Relatório de Prestação de Contas (APM & Conselho)
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Folha executiva formatada para prestação de contas dos recursos aplicados.
              </p>
            </div>
            <button
              onClick={handlePrintAccountabilityReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 border border-stone-200 text-stone-700 dark:text-stone-300 rounded-xl font-medium shrink-0 hover:bg-stone-50"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>

          {/* Footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
