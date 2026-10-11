'use client';

import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Users, 
  GraduationCap, 
  School, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface SchoolConsumptionCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onNavigateToPurchases: () => void;
}

export const SchoolConsumptionCalculatorModal: React.FC<SchoolConsumptionCalculatorModalProps> = ({
  isOpen,
  onClose,
  items,
  onNavigateToPurchases,
}) => {
  const [studentCount, setStudentCount] = useState<number>(450);
  const [classroomsCount, setClassroomsCount] = useState<number>(18);
  const [teachersCount, setTeachersCount] = useState<number>(32);

  if (!isOpen) return null;

  // Pedagogical metrics per month and per semester (120 school days / 5 months):
  // Sulfite: ~30 folhas por aluno por mês -> 1 resma (500 fls) a cada ~16 alunos/mês
  const sulfiteSemesterNeeded = Math.ceil((studentCount * 30 * 5) / 500);
  // Canetão quadro: ~2 canetas por sala por mês
  const whiteboardPensSemesterNeeded = classroomsCount * 2 * 5;
  // Cartolina: ~1 folha por aluno por semestre
  const cartolinasSemesterNeeded = Math.ceil(studentCount * 1.2);
  // Cola branca 1kg: ~1 pote por sala a cada 2 meses
  const glueSemesterNeeded = Math.ceil((classroomsCount * 5) / 2);
  // Tinta Guache 250ml: ~3 potes por sala por semestre
  const gouacheSemesterNeeded = classroomsCount * 3;

  // Match items in stock
  const sulfiteItem = items.find((i) => i.code === 'PAP-001' || i.name.toLowerCase().includes('sulfite'));
  const pensItem = items.find((i) => i.code === 'PAP-003' || i.name.toLowerCase().includes('caneta para quadro'));
  const cartolinaItem = items.find((i) => i.code === 'PAP-002' || i.name.toLowerCase().includes('cartolina'));
  const glueItem = items.find((i) => i.code === 'PAP-005' || i.name.toLowerCase().includes('cola'));
  const gouacheItem = items.find((i) => i.code === 'PAP-004' || i.name.toLowerCase().includes('guache'));

  const estimates = [
    {
      name: 'Papel Sulfite A4 (Resmas)',
      formula: '30 folhas/aluno/mês para provas e apostilas',
      estimatedSemester: sulfiteSemesterNeeded,
      currentStock: sulfiteItem?.quantity || 0,
      unit: 'resmas',
    },
    {
      name: 'Canetas para Quadro Branco',
      formula: '2 unidades por sala a cada mês',
      estimatedSemester: whiteboardPensSemesterNeeded,
      currentStock: pensItem?.quantity || 0,
      unit: 'unidades',
    },
    {
      name: 'Cartolinas (Projetos e Murais)',
      formula: '1,2 folhas por aluno/semestre',
      estimatedSemester: cartolinasSemesterNeeded,
      currentStock: cartolinaItem?.quantity || 0,
      unit: 'folhas',
    },
    {
      name: 'Cola Branca (Potes 1kg)',
      formula: '1 pote a cada 2 meses por sala',
      estimatedSemester: glueSemesterNeeded,
      currentStock: glueItem?.quantity || 0,
      unit: 'potes',
    },
    {
      name: 'Tinta Guache Escolar (Potes 250ml)',
      formula: '3 potes por sala/semestre para Artes',
      estimatedSemester: gouacheSemesterNeeded,
      currentStock: gouacheItem?.quantity || 0,
      unit: 'potes',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] border-b border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF4EE] text-[#1E4620] rounded-xl border border-[#CFE7D8]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Calculadora de Consumo por Matrícula
              </h3>
              <p className="text-xs text-stone-500">
                Estimativa pedagógica para garantir insumos a todos os estudantes
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
        <div className="p-6 space-y-5 text-xs">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F8FAF9] border border-stone-200/80">
            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                Alunos Matriculados
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={studentCount}
                onChange={(e) => setStudentCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-stone-400" />
                Salas de Aula Ativas
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={classroomsCount}
                onChange={(e) => setClassroomsCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-stone-400" />
                Corpo Docente
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={teachersCount}
                onChange={(e) => setTeachersCount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-stone-200 rounded-xl p-2 font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20"
              />
            </div>
          </div>

          {/* Estimates Comparison Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-stone-900">
              Projeção de Demanda para o Semestre Letivo (120 Dias de Aula)
            </h4>

            <div className="border border-stone-200/80 rounded-2xl overflow-hidden divide-y divide-stone-100 bg-white">
              {estimates.map((est, idx) => {
                const deficit = Math.max(0, est.estimatedSemester - est.currentStock);
                const hasEnough = est.currentStock >= est.estimatedSemester;

                return (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-stone-900">
                        {est.name}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {est.formula}
                      </div>
                    </div>

                    <div className="text-right tabular-nums shrink-0">
                      <div className="text-xs">
                        Demanda: <strong className="text-stone-800">{est.estimatedSemester}</strong> {est.unit}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Saldo atual: {est.currentStock} {est.unit}
                      </div>
                    </div>

                    <div className="w-28 text-right shrink-0">
                      {hasEnough ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E4620] bg-[#EAF4EE] border border-[#CFE7D8] px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Abastecido
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#991B1B] bg-[#FFF5F5] border border-[#FED7D7] px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" /> Falta {deficit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              Cálculo baseado nas diretrizes oficiais de planejamento do MEC/FNDE.
            </span>
            <button
              onClick={() => {
                playBeep('click');
                onClose();
                onNavigateToPurchases();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D6A4F] text-white hover:bg-[#1E4620] rounded-xl font-semibold shadow-2xs transition-colors"
            >
              <span>Ir para Planejamento de Compras</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
