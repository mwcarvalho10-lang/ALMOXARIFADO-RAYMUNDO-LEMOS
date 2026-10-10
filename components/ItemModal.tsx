'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle, Package, MapPin, DollarSign, Cpu } from 'lucide-react';
import { InventoryItem, Category, CATEGORIES, ItemCondition } from '@/types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  itemToEdit: InventoryItem | null;
  existingItems: InventoryItem[];
}

function getInitialCode(cat: Category, existingItems: InventoryItem[]): string {
  const prefixes: Record<Category, string> = {
    papelaria: 'PAP',
    jogos: 'JOG',
    capital: 'CAP',
    limpeza: 'LMP',
    outros: 'OUT',
  };
  const prefix = prefixes[cat];
  const catItems = existingItems.filter((i) => i.code?.startsWith(prefix));
  const nextNum = catItems.length + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  existingItems,
}) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>(() => {
    if (itemToEdit) return itemToEdit;
    return {
      category: 'papelaria',
      name: '',
      code: getInitialCode('papelaria', existingItems),
      quantity: 10,
      minQuantity: 5,
      targetSemesterStock: 30,
      unit: 'unidades',
      location: '',
      patrimonyNumber: '',
      brand: '',
      estimatedUnitCost: 15.0,
      condition: 'bom',
      notes: '',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: Category) => {
    if (!itemToEdit) {
      const suggestedCode = getInitialCode(newCat, existingItems);
      setFormData((prev) => ({
        ...prev,
        category: newCat,
        code: suggestedCode,
      }));
    } else {
      setFormData((prev) => ({ ...prev, category: newCat }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome do material é obrigatório.';
    }
    if (!formData.code?.trim()) {
      newErrors.code = 'Código de identificação é obrigatório.';
    }
    if ((formData.quantity ?? 0) < 0) {
      newErrors.quantity = 'A quantidade não pode ser negativa.';
    }
    if ((formData.minQuantity ?? 0) < 0) {
      newErrors.minQuantity = 'O estoque mínimo deve ser zero ou maior.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();
    const finalItem: InventoryItem = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}`,
      code: formData.code!.trim().toUpperCase(),
      name: formData.name!.trim(),
      category: formData.category as Category,
      quantity: Number(formData.quantity) || 0,
      minQuantity: Number(formData.minQuantity) || 0,
      targetSemesterStock: Number(formData.targetSemesterStock) || 0,
      unit: formData.unit?.trim() || 'unidades',
      location: formData.location?.trim() || 'Depósito Central',
      patrimonyNumber: formData.category === 'capital' ? formData.patrimonyNumber?.trim() : undefined,
      brand: formData.brand?.trim(),
      condition: formData.condition as ItemCondition,
      estimatedUnitCost: Number(formData.estimatedUnitCost) || 0,
      notes: formData.notes?.trim(),
      gradeCycle: formData.gradeCycle || 'todos',
      fundingSource: formData.fundingSource,
      expirationDate: formData.expirationDate,
      isToxicFree: formData.isToxicFree ?? false,
      isFavorite: formData.isFavorite ?? false,
      createdAt: itemToEdit ? itemToEdit.createdAt : now,
      updatedAt: now,
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] rounded-xl shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {itemToEdit ? 'Editar Material Escolar' : 'Cadastrar Novo Material Escolar'}
                </h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ depósito escolar ~
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Almoxarifado & Suprimentos da Escola
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Seção / Categoria do Depósito *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORIES) as Category[]).map((catKey) => {
                const info = CATEGORIES[catKey];
                const isSelected = formData.category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategoryChange(catKey)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {info.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Material *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Resma Papel Sulfite A4 75g"
                className={`w-full px-3 py-2 text-xs sm:text-sm rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.name ? 'border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.name && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Código / Ref *
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: PAP-001"
                className={`w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg border bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 ${
                  errors.code ? 'border-rose-500' : 'border-slate-200 focus:border-blue-500'
                }`}
              />
              {errors.code && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.code}
                </p>
              )}
            </div>
          </div>

          {/* Quantities & Unit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estoque Atual *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity ?? 0}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-rose-700">
                Estoque Mínimo (Alerta) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.minQuantity ?? 0}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-blue-700">
                Meta Semestral
              </label>
              <input
                type="number"
                min="0"
                value={formData.targetSemesterStock ?? 0}
                onChange={(e) => setFormData({ ...formData, targetSemesterStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Unidade de Medida
              </label>
              <input
                type="text"
                value={formData.unit || ''}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="un, cx, resma, pct, galão 5L"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Location & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Localização no Almoxarifado
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Armário A1 - Prateleira 2"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Marca / Fabricante
              </label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ex: Faber-Castell, Ypê..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* CAPITAL / PATRIMONY SPECIAL FIELDS */}
          {formData.category === 'capital' && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <Cpu className="w-4 h-4 text-blue-700" />
                Identificação de Bem Permanente / Patrimônio Escolar
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Tombamento / Plaqueta de Patrimônio
                  </label>
                  <input
                    type="text"
                    value={formData.patrimonyNumber || ''}
                    onChange={(e) => setFormData({ ...formData, patrimonyNumber: e.target.value })}
                    placeholder="Ex: PAT-2024-0042"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg border border-blue-200 bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado de Conservação
                  </label>
                  <select
                    value={formData.condition || 'bom'}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as ItemCondition })}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-blue-200 bg-white focus:border-blue-600 focus:outline-hidden"
                  >
                    <option value="novo">Novo / Sem marcas de uso</option>
                    <option value="bom">Bom / Em pleno funcionamento</option>
                    <option value="regular">Regular / Marcas de uso moderadas</option>
                    <option value="necessita_reparo">Necessita Reparo / Manutenção</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Pedagogical & School Settings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-[#FAFBF9] border border-stone-200/80">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ciclo / Segmento
              </label>
              <select
                value={formData.gradeCycle || 'todos'}
                onChange={(e) => setFormData({ ...formData, gradeCycle: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-900"
              >
                <option value="todos">Todos os Ciclos</option>
                <option value="infantil">Educação Infantil</option>
                <option value="fundamental1">Fundamental I</option>
                <option value="fundamental2">Fundamental II</option>
                <option value="medio">Ensino Médio</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Origem da Verba
              </label>
              <select
                value={formData.fundingSource || ''}
                onChange={(e) => setFormData({ ...formData, fundingSource: (e.target.value || undefined) as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-900"
              >
                <option value="">Não informado</option>
                <option value="PDDE">PDDE Federal</option>
                <option value="APM">Caixa Escolar / APM</option>
                <option value="Prefeitura">Prefeitura / Estado</option>
                <option value="Doação">Doação de Pais</option>
                <option value="Recurso Próprio">Recurso Próprio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Data de Validade
              </label>
              <input
                type="date"
                value={formData.expirationDate || ''}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value || undefined })}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-900"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isToxicFree ?? false}
                  onChange={(e) => setFormData({ ...formData, isToxicFree: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Material Atóxico</span>
              </label>
            </div>
          </div>

          {/* Unit Cost & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                Custo Médio Unitário (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.estimatedUnitCost ?? 0}
                onChange={(e) => setFormData({ ...formData, estimatedUnitCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Observações ou Instruções Pedagógicas
              </label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ex: Requisitado para Educação Infantil, guardar longe de umidade..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2D6A4F] hover:bg-[#23563F] rounded-xl shadow-2xs transition-colors"
            >
              <Save className="w-4 h-4" />
              Salvar Material
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
