'use client';

import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Printer, 
  User, 
  FileSpreadsheet
} from 'lucide-react';
import { StockMovement, Category, CATEGORIES } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface MovementsHistoryProps {
  movements: StockMovement[];
  onOpenReceipt: (movement: StockMovement) => void;
  onOpenNewMovement: (type: 'entrada' | 'saida') => void;
}

export const MovementsHistory: React.FC<MovementsHistoryProps> = ({
  movements,
  onOpenReceipt,
  onOpenNewMovement,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'todas'>('todas');

  const filteredMovements = useMemo(() => {
    return movements
      .filter((mov) => {
        if (typeFilter !== 'todos' && mov.type !== typeFilter) {
          return false;
        }

        if (categoryFilter !== 'todas' && mov.category !== categoryFilter) {
          return false;
        }

        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchItem = mov.itemName.toLowerCase().includes(term);
          const matchCode = mov.itemCode.toLowerCase().includes(term);
          const matchResp = mov.responsible.toLowerCase().includes(term);
          const matchDest = mov.destinationOrReason.toLowerCase().includes(term);
          const matchNotes = mov.notes?.toLowerCase().includes(term);
          if (!matchItem && !matchCode && !matchResp && !matchDest && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [movements, typeFilter, categoryFilter, searchTerm]);

  const exportToCSV = () => {
    if (filteredMovements.length === 0) return;

    const headers = [
      'Data/Hora',
      'Tipo',
      'Código Material',
      'Nome Material',
      'Categoria',
      'Quantidade',
      'Saldo Anterior',
      'Novo Saldo',
      'Responsável',
      'Cargo/Setor',
      'Destino/Motivo',
      'NF/Referência',
      'Observações',
    ];

    const rows = filteredMovements.map((m) => [
      new Date(m.date).toLocaleString('pt-BR'),
      m.type === 'entrada' ? 'Entrada (Reposição)' : 'Saída (Retirada)',
      m.itemCode,
      `"${m.itemName.replace(/"/g, '""')}"`,
      m.category,
      m.quantity,
      m.previousQuantity,
      m.newQuantity,
      `"${m.responsible.replace(/"/g, '""')}"`,
      `"${(m.role || '').replace(/"/g, '""')}"`,
      `"${(m.destinationOrReason || '').replace(/"/g, '""')}"`,
      `"${(m.invoiceNumber || '').replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `movimentacoes-almoxarifado-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const entradasCount = movements.filter((m) => m.type === 'entrada').length;
  const saidasCount = movements.filter((m) => m.type === 'saida').length;

  return (
    <div className="space-y-4">
      {/* Header Island */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-bold text-stone-900">
              Livro de Movimentações Escolares
            </h2>
            <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
              ~ registro fidedigno ~
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Registro cronológico das entregas de fornecedores e retiradas por professores e funcionários
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors shadow-2xs"
            title="Exportar dados filtrados para CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Exportar CSV
          </button>
          <button
            onClick={() => {
              playBeep('click');
              onOpenNewMovement('entrada');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#065F46] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] transition-colors shadow-2xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-[#059669]" />
            + Entrada
          </button>
          <button
            onClick={() => {
              playBeep('click');
              onOpenNewMovement('saida');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#C2410C] bg-[#FFF7ED] hover:bg-[#FFEDD5] border border-[#FED7AA] transition-colors shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#EA580C]" />
            - Saída
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Island */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por professor, turma, destino pedagógico ou material..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-[#FAFBF9] border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Type & Category Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Movement Type Filter */}
          <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              onClick={() => setTypeFilter('todos')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                typeFilter === 'todos' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Todas ({movements.length})
            </button>
            <button
              onClick={() => setTypeFilter('entrada')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                typeFilter === 'entrada' ? 'bg-[#EAF6ED] text-[#14532D]' : 'text-stone-500 hover:text-emerald-700'
              }`}
            >
              Entradas ({entradasCount})
            </button>
            <button
              onClick={() => setTypeFilter('saida')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                typeFilter === 'saida' ? 'bg-[#FFF7ED] text-[#C2410C]' : 'text-stone-500 hover:text-amber-700'
              }`}
            >
              Saídas ({saidasCount})
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="text-xs bg-stone-50 border border-stone-200 text-stone-700 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
          >
            <option value="todas">Todas as Seções</option>
            {Object.keys(CATEGORIES).map((catKey) => (
              <option key={catKey} value={catKey}>
                {CATEGORIES[catKey as Category].shortLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movements Table Island */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-stone-200/80 text-stone-600 font-semibold select-none">
              <tr>
                <th className="py-2.5 px-4 w-36">Data & Horário</th>
                <th className="py-2.5 px-3 w-24">Tipo</th>
                <th className="py-2.5 px-4">Material Escolar</th>
                <th className="py-2.5 px-3 text-right">Qtd</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">Saldo</th>
                <th className="py-2.5 px-4">Responsável / Docente</th>
                <th className="py-2.5 px-4 hidden md:table-cell">Destino / Turma</th>
                <th className="py-2.5 px-3 text-center w-24">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-stone-400">
                    Nenhuma movimentação encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const isEntrada = mov.type === 'entrada';
                  const dateObj = new Date(mov.date);
                  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={mov.id} className="hover:bg-[#FAFBF9] transition-colors">
                      {/* Date & Time */}
                      <td className="py-2.5 px-4 text-stone-500 whitespace-nowrap tabular-nums">
                        <div className="font-semibold text-stone-800">{formattedDate}</div>
                        <div className="text-[10px] text-stone-400">{formattedTime}</div>
                      </td>

                      {/* Type Pill (Pastel) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {isEntrada ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5]">
                            <ArrowDownLeft className="w-3 h-3 text-[#059669]" /> Entrada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]">
                            <ArrowUpRight className="w-3 h-3 text-[#EA580C]" /> Saída
                          </span>
                        )}
                      </td>

                      {/* Item Info */}
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-stone-900 truncate max-w-xs sm:max-w-md">
                          {mov.itemName}
                        </div>
                        <div className="text-[10px] text-stone-500 font-mono">
                          {mov.itemCode}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap tabular-nums">
                        <span className={`font-bold ${isEntrada ? 'text-emerald-800' : 'text-stone-800'}`}>
                          {isEntrada ? '+' : '-'}{mov.quantity}
                        </span>
                      </td>

                      {/* Previous and New Balance */}
                      <td className="py-2.5 px-3 text-right hidden sm:table-cell whitespace-nowrap text-stone-500 tabular-nums text-[11px]">
                        <span>{mov.previousQuantity} &rarr; </span>
                        <strong className="text-stone-800">{mov.newQuantity}</strong>
                      </td>

                      {/* Responsible */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-stone-400" />
                          <span>{mov.responsible}</span>
                        </div>
                        {mov.role && (
                          <div className="text-[10px] text-stone-500 pl-4">{mov.role}</div>
                        )}
                      </td>

                      {/* Destination / Turma */}
                      <td className="py-2.5 px-4 hidden md:table-cell text-stone-600 text-xs">
                        <span className="truncate max-w-xs block font-medium">
                          {mov.destinationOrReason || 'Consumo Geral'}
                        </span>
                      </td>

                      {/* Print Receipt */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenReceipt(mov)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-700 hover:text-emerald-800 bg-stone-50 hover:bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 transition-colors shadow-2xs"
                          title="Visualizar ou imprimir comprovante"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Recibo</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
