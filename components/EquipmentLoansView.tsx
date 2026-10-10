'use client';

import React, { useState } from 'react';
import { Clock, Plus, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { EquipmentLoan, InventoryItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface EquipmentLoansViewProps {
  loans: EquipmentLoan[];
  items: InventoryItem[];
  onSaveLoan: (loan: EquipmentLoan) => void;
  onReturnLoan: (loanId: string) => void;
}

export const EquipmentLoansView: React.FC<EquipmentLoansViewProps> = ({
  loans,
  items,
  onSaveLoan,
  onReturnLoan,
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(items.filter(i => i.category === 'capital' || i.category === 'jogos')[0]?.id || items[0]?.id);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerRole, setBorrowerRole] = useState('Professor(a)');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [purpose, setPurpose] = useState('');

  const capitalOrGameItems = items.filter(i => i.category === 'capital' || i.category === 'jogos' || i.quantity > 0);

  const filteredLoans = loans.filter((l) => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return (
      l.borrowerName.toLowerCase().includes(s) ||
      l.itemName.toLowerCase().includes(s) ||
      l.patrimonyNumber?.toLowerCase().includes(s)
    );
  }).sort((a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime());

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim() || !purpose.trim()) return;

    const targetItem = items.find(i => i.id === selectedItemId);
    if (!targetItem) return;

    const newLoan: EquipmentLoan = {
      id: `loan-${Date.now()}`,
      itemId: targetItem.id,
      itemName: targetItem.name,
      itemCode: targetItem.code,
      patrimonyNumber: targetItem.patrimonyNumber,
      borrowerName: borrowerName.trim(),
      borrowerRole,
      borrowDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      status: 'ativo',
      purpose: purpose.trim(),
    };

    playBeep('success');
    onSaveLoan(newLoan);
    setIsNewModalOpen(false);
    setBorrowerName('');
    setPurpose('');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner Island */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] shadow-2xs">
              <Clock className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  Empréstimos de Equipamentos & Multimídia
                </h2>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ controle de patrimônio ~
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Rastreamento pontual de projetores, caixas de som e notebooks para aulas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playBeep('click');
              setIsNewModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2D6A4F] hover:bg-[#23563F] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Empréstimo
          </button>
        </div>
      </div>

      {/* KPI Cards (Clear Pastel Tone) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-sky-800">Empréstimos Ativos</span>
          <div className="text-2xl font-bold text-sky-950 mt-1 tabular-nums">
            {loans.filter(l => l.status === 'ativo').length}
          </div>
        </div>

        <div className="p-4 bg-[#FFF5F5] border border-[#FED7D7] rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-[#991B1B]">Devoluções Atrasadas</span>
          <div className="text-2xl font-bold text-[#991B1B] mt-1 tabular-nums">
            {loans.filter(l => l.status === 'atrasado').length}
          </div>
        </div>

        <div className="p-4 bg-[#EAF6ED] border border-[#CDE5D5] rounded-2xl shadow-2xs">
          <span className="text-xs font-semibold text-[#14532D]">Equipamentos Devolvidos</span>
          <div className="text-2xl font-bold text-[#14532D] mt-1 tabular-nums">
            {loans.filter(l => l.status === 'devolvido').length}
          </div>
        </div>
      </div>

      {/* Loans Table Island */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-stone-100 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por professor, turma ou equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-stone-200/80 text-stone-600 font-semibold select-none">
              <tr>
                <th className="py-2.5 px-4">Equipamento</th>
                <th className="py-2.5 px-3">Professor / Solicitante</th>
                <th className="py-2.5 px-3">Data Retirada</th>
                <th className="py-2.5 px-3">Prazo de Devolução</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Nenhum empréstimo registrado.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const isOverdue = loan.status === 'atrasado';
                  const isReturned = loan.status === 'devolvido';

                  return (
                    <tr key={loan.id} className="hover:bg-[#FAFBF9] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">
                          {loan.itemName}
                        </div>
                        <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{loan.itemCode}</span>
                          {loan.patrimonyNumber && (
                            <span className="bg-[#E0F2FE] text-sky-800 px-1.5 rounded font-semibold border border-[#BAE6FD]">
                              Tombamento: {loan.patrimonyNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-stone-800">
                          {loan.borrowerName}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {loan.borrowerRole} · {loan.purpose}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-stone-600 tabular-nums">
                        {new Date(loan.borrowDate).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className={`font-semibold ${isOverdue ? 'text-[#991B1B] font-bold' : 'text-stone-700'}`}>
                          {new Date(loan.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5]">
                            <CheckCircle2 className="w-3 h-3" /> Devolvido
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
                            <AlertTriangle className="w-3 h-3" /> Atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#E0F2FE] text-sky-800 border border-[#BAE6FD]">
                            <Clock className="w-3 h-3" /> Em Uso
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {!isReturned && (
                          <button
                            onClick={() => {
                              playBeep('success');
                              onReturnLoan(loan.id);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors shadow-2xs"
                          >
                            Dar Baixa / Devolver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Loan Modal (Island Style) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Registrar Empréstimo de Equipamento
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Informe os dados da retirada para garantia patrimonial escolar.
            </p>

            <form onSubmit={handleCreateLoan} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Item a ser Emprestado
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900 font-medium"
                >
                  {capitalOrGameItems.map(it => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.code}) {it.patrimonyNumber ? `[Tombamento: ${it.patrimonyNumber}]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Nome do Docente / Solicitante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profª Mariana Alves"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Cargo / Função
                  </label>
                  <select
                    value={borrowerRole}
                    onChange={(e) => setBorrowerRole(e.target.value)}
                    className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900 font-medium"
                  >
                    <option value="Professor(a)">Professor(a)</option>
                    <option value="Coordenador(a)">Coordenador(a)</option>
                    <option value="Diretor(a)">Diretor(a)</option>
                    <option value="Secretaria">Secretaria</option>
                    <option value="Inspetor(a)">Inspetor(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">
                    Data Limite de Devolução
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900 font-medium"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  Finalidade Pedagógica / Turma
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Exibição de documentário - 8º Ano B"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-[#FAFBF9] border border-stone-200 rounded-xl p-2 text-stone-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#23563F] font-semibold shadow-2xs"
                >
                  Confirmar Empréstimo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
