'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Printer, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  CheckSquare, 
  Square, 
  AlertTriangle, 
  FileSpreadsheet
} from 'lucide-react';
import { InventoryItem, Category, CATEGORIES, SemesterPurchaseItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface SemesterPurchasePlannerProps {
  items: InventoryItem[];
  schoolName: string;
}

export const SemesterPurchasePlanner: React.FC<SemesterPurchasePlannerProps> = ({
  items,
}) => {
  const [semester, setSemester] = useState<'1' | '2'>('1');
  const [safetyMargin, setSafetyMargin] = useState<number>(1.1); // 10% safety buffer
  const [categoryFilter, setCategoryFilter] = useState<Category | 'todas'>('todas');
  const [onlyNeeded, setOnlyNeeded] = useState<boolean>(true);
  
  const [customQuantities, setCustomQuantities] = useState<Record<string, number>>({});
  const [selectedItemIds, setSelectedItemIds] = useState<Record<string, boolean>>({});

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  const plannerItems: SemesterPurchaseItem[] = useMemo(() => {
    return items.map((item) => {
      const targetWithMargin = Math.ceil(item.targetSemesterStock * safetyMargin);
      const suggested = Math.max(0, targetWithMargin - item.quantity);
      const userQty = customQuantities[item.id] !== undefined ? customQuantities[item.id] : suggested;
      const isSelected = selectedItemIds[item.id] !== undefined ? selectedItemIds[item.id] : suggested > 0;

      let priority: 'critica' | 'alta' | 'media' | 'baixa' = 'baixa';
      if (item.quantity <= item.minQuantity) {
        priority = 'critica';
      } else if (item.quantity < item.targetSemesterStock * 0.4) {
        priority = 'alta';
      } else if (item.quantity < item.targetSemesterStock) {
        priority = 'media';
      }

      return {
        itemId: item.id,
        name: item.name,
        code: item.code,
        category: item.category,
        unit: item.unit,
        currentStock: item.quantity,
        targetSemesterStock: item.targetSemesterStock,
        suggestedQuantity: suggested,
        orderedQuantity: userQty,
        estimatedUnitCost: item.estimatedUnitCost || 0,
        estimatedTotalCost: userQty * (item.estimatedUnitCost || 0),
        priority,
        supplierHint: item.lastSupplier,
        selected: isSelected,
        notes: item.notes,
      };
    });
  }, [items, safetyMargin, customQuantities, selectedItemIds]);

  const filteredPlannerItems = useMemo(() => {
    return plannerItems.filter((p) => {
      if (categoryFilter !== 'todas' && p.category !== categoryFilter) return false;
      if (onlyNeeded && p.suggestedQuantity === 0 && p.orderedQuantity === 0) return false;
      return true;
    });
  }, [plannerItems, categoryFilter, onlyNeeded]);

  const selectedItems = plannerItems.filter((p) => p.selected && p.orderedQuantity > 0);
  const totalCost = selectedItems.reduce((acc, curr) => acc + curr.estimatedTotalCost, 0);
  const totalUnits = selectedItems.reduce((acc, curr) => acc + curr.orderedQuantity, 0);

  const handleQuantityChange = (itemId: string, newQty: number) => {
    setCustomQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, newQty),
    }));
  };

  const handleToggleSelect = (itemId: string) => {
    setSelectedItemIds((prev) => ({
      ...prev,
      [itemId]: !plannerItems.find((p) => p.itemId === itemId)?.selected,
    }));
  };

  const handleSelectAll = (select: boolean) => {
    const next: Record<string, boolean> = {};
    filteredPlannerItems.forEach((p) => {
      next[p.itemId] = select;
    });
    setSelectedItemIds((prev) => ({
      ...prev,
      ...next,
    }));
  };

  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    setIsAiModalOpen(true);
    setAiReport(null);

    try {
      const res = await fetch('/api/purchases/ai-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester,
          margin: safetyMargin,
          items: items.map((i) => ({
            name: i.name,
            category: i.category,
            quantity: i.quantity,
            minQuantity: i.minQuantity,
            targetSemesterStock: i.targetSemesterStock,
            unit: i.unit,
          })),
        }),
      });

      const data = await res.json();
      setAiReport(data.analysis || 'Não foi possível gerar a análise.');
    } catch (err) {
      console.error('Falha ao rodar análise de IA:', err);
      setAiReport('Ocorreu um erro ao conectar com o serviço de análise.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const exportToCSV = () => {
    if (selectedItems.length === 0) return;

    const headers = [
      'Código',
      'Material / Descrição',
      'Categoria',
      'Estoque Atual',
      'Meta Semestral',
      'Qtd a Comprar',
      'Unidade',
      'Custo Unit. Estimado (R$)',
      'Subtotal Estimado (R$)',
      'Prioridade',
      'Fornecedor Habitual',
    ];

    const rows = selectedItems.map((p) => [
      p.code,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.currentStock,
      p.targetSemesterStock,
      p.orderedQuantity,
      p.unit,
      p.estimatedUnitCost.toFixed(2),
      p.estimatedTotalCost.toFixed(2),
      p.priority,
      `"${(p.supplierHint || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `planejamento_compras_semestre_${semester}_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Island */}
      <div className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shadow-2xs">
              <ShoppingCart className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-sm sm:text-base font-bold text-stone-900">
                  Planejamento Semestral de Suprimentos
                </h2>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ previsão orçamentária ~
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Cálculo automático de compra baseado na meta pedagógica semestral e saldo atual
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRunAiAnalysis}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-purple-950 bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Análise com IA
          </button>

          <button
            onClick={exportToCSV}
            disabled={selectedItems.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Exportar CSV
          </button>

          <button
            onClick={handlePrint}
            disabled={selectedItems.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2D6A4F] hover:bg-[#23563F] rounded-xl shadow-2xs transition-colors disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Pedido
          </button>
        </div>
      </div>

      {/* Semester Controls & Safety Margin Island */}
      <div className="print:hidden bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Semester Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-stone-400" /> Semestre:
          </span>
          <div className="inline-flex rounded-xl border border-stone-200 p-0.5 bg-stone-50 text-xs">
            <button
              onClick={() => {
                playBeep('click');
                setSemester('1');
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                semester === '1' ? 'bg-[#EAF6ED] text-[#14532D] shadow-2xs font-bold border border-[#CDE5D5]' : 'text-stone-600 font-medium'
              }`}
            >
              1º Semestre (Fev - Jul)
            </button>
            <button
              onClick={() => {
                playBeep('click');
                setSemester('2');
              }}
              className={`px-3 py-1 rounded-lg transition-colors ${
                semester === '2' ? 'bg-[#EAF6ED] text-[#14532D] shadow-2xs font-bold border border-[#CDE5D5]' : 'text-stone-600 font-medium'
              }`}
            >
              2º Semestre (Ago - Dez)
            </button>
          </div>
        </div>

        {/* Safety Margin */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600">Margem de Reserva:</span>
          <select
            value={safetyMargin}
            onChange={(e) => setSafetyMargin(parseFloat(e.target.value))}
            className="px-2.5 py-1 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-hidden font-medium"
          >
            <option value={1.0}>0% (Meta Exata de Consumo)</option>
            <option value={1.1}>+10% (Recomendado para Escolas)</option>
            <option value={1.2}>+20% (Eventos e Feiras Culturais)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-600">Seção:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | 'todas')}
            className="px-2.5 py-1 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 focus:outline-hidden font-medium"
          >
            <option value="todas">Todas as Seções</option>
            {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORIES[cat].shortLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Only Needed Checkbox */}
        <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none font-medium">
          <input
            type="checkbox"
            checked={onlyNeeded}
            onChange={(e) => setOnlyNeeded(e.target.checked)}
            className="rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
          />
          Mostrar apenas itens com necessidade de compra
        </label>
      </div>

      {/* Financial Summary Cards Island (Clear Pastel Tones) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Cost */}
        <div className="bg-[#EAF6ED] border border-[#CDE5D5] rounded-2xl p-4.5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#14532D] font-semibold">
            <span>Orçamento Estimado do Pedido</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#14532D] mt-1.5 tabular-nums tracking-tight">
            {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-[#1B4D35] mt-1 font-medium">
            Previsão média para o {semester}º semestre letivo
          </p>
        </div>

        {/* Total Items Selected */}
        <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Materiais Selecionados</span>
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900 mt-1.5 tabular-nums tracking-tight">
            {selectedItems.length}{' '}
            <span className="text-xs font-normal text-stone-500">
              de {items.length} itens totais
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 tabular-nums font-medium">
            {totalUnits} unidades físicas a adquirir
          </p>
        </div>

        {/* Critical Attention */}
        <div className="bg-white rounded-2xl p-4.5 border border-stone-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Urgência Crítica no Semestre</span>
            <AlertTriangle className="w-4 h-4 text-[#991B1B]" />
          </div>
          <div className="text-2xl font-bold text-[#991B1B] mt-1.5 tabular-nums tracking-tight">
            {selectedItems.filter((i) => i.priority === 'critica').length}{' '}
            <span className="text-xs font-normal text-stone-500">itens críticos</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Itens que precisam de pedido imediato para início das aulas
          </p>
        </div>
      </div>

      {/* Main Purchasing Table Island */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
        <div className="print:hidden px-4 py-2.5 bg-[#FAFBF9] border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectAll(true)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Selecionar Todos
            </button>
            <span className="text-stone-300">|</span>
            <button
              onClick={() => handleSelectAll(false)}
              className="text-xs font-semibold text-stone-600 hover:text-stone-800 flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" /> Desmarcar Todos
            </button>
          </div>

          <span className="text-[11px] text-stone-500">
            Você pode ajustar as quantidades a comprar em cada linha conforme o orçamento da escola.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFBF9] border-b border-stone-200/80 text-stone-600 font-semibold select-none">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center print:hidden">Sel.</th>
                <th className="py-2.5 px-3 w-24">Código</th>
                <th className="py-2.5 px-4">Material / Descrição</th>
                <th className="py-2.5 px-3 text-center hidden md:table-cell">Seção</th>
                <th className="py-2.5 px-3 text-right">Estoque</th>
                <th className="py-2.5 px-3 text-right">Meta Sem.</th>
                <th className="py-2.5 px-3 text-right font-bold text-emerald-800">Sugerido</th>
                <th className="py-2.5 px-4 text-right font-bold w-32">Comprar (Qtd)</th>
                <th className="py-2.5 px-3 text-right hidden sm:table-cell">Custo Unit.</th>
                <th className="py-2.5 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredPlannerItems.map((item) => {
                const isSelected = item.selected;

                return (
                  <tr
                    key={item.itemId}
                    className={`transition-colors ${
                      isSelected ? 'bg-white hover:bg-[#FAFBF9]' : 'bg-stone-50/40 opacity-60'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center print:hidden">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.itemId)}
                        className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300 cursor-pointer"
                      />
                    </td>

                    {/* Code */}
                    <td className="py-2.5 px-3 font-mono font-semibold text-stone-600 whitespace-nowrap text-[11px]">
                      {item.code}
                    </td>

                    {/* Name */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-stone-900">
                        {item.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500">
                        {item.priority === 'critica' && (
                          <span className="font-semibold text-[#991B1B] bg-[#FEE2E2] px-1.5 py-0.2 rounded border border-[#FECACA]">
                            Urgente
                          </span>
                        )}
                        {item.supplierHint && (
                          <span>Fornecedor: {item.supplierHint}</span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 text-center hidden md:table-cell whitespace-nowrap">
                      <span className="text-[11px] text-stone-600 font-medium">
                        {CATEGORIES[item.category]?.shortLabel}
                      </span>
                    </td>

                    {/* Current Stock */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap tabular-nums">
                      <span className={item.currentStock <= 0 ? 'text-[#991B1B] font-bold' : 'text-stone-700 font-medium'}>
                        {item.currentStock}
                      </span>{' '}
                      <span className="text-[10px] text-stone-400">{item.unit}</span>
                    </td>

                    {/* Target Semester */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap tabular-nums text-stone-600">
                      {item.targetSemesterStock} {item.unit}
                    </td>

                    {/* Suggested */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-emerald-800 tabular-nums">
                      {item.suggestedQuantity} {item.unit}
                    </td>

                    {/* Ordered Quantity Input */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <input
                        type="number"
                        min="0"
                        value={item.orderedQuantity}
                        onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-right text-xs rounded-lg border border-stone-200 bg-[#FAFBF9] text-stone-900 font-bold focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 tabular-nums"
                      />
                    </td>

                    {/* Estimated Unit Cost */}
                    <td className="py-2.5 px-3 text-right hidden sm:table-cell whitespace-nowrap text-stone-600 font-medium tabular-nums">
                      {item.estimatedUnitCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>

                    {/* Subtotal */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap font-bold text-stone-900 tabular-nums">
                      {item.estimatedTotalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-xl w-full p-6 shadow-xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#F5F3FF] text-purple-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  Planejamento Estratégico com IA
                </h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {isAiLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-stone-500">
                  Analisando matriz curricular e consumo semestral de materiais...
                </p>
              </div>
            ) : (
              <div className="text-xs text-stone-700 max-h-80 overflow-y-auto space-y-2 whitespace-pre-wrap leading-relaxed font-sans">
                {aiReport}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-1.5 bg-[#2D6A4F] text-white hover:bg-[#23563F] rounded-xl text-xs font-semibold shadow-2xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
