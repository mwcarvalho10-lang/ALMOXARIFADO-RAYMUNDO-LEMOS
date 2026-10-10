'use client';

import React from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  Leaf, 
  Tag, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface SchoolHelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolHelpGuideModal: React.FC<SchoolHelpGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const topics = [
    {
      icon: Clock,
      title: '1. Prazos & Retiradas de Recursos Audiovisuais',
      desc: 'Projetores multimídia, caixas acústicas amplificadas e notebooks devem ser solicitados com no mínimo 24h de antecedência. Ao término da aula, devolver na bancada de recarga do almoxarifado para teste de cabos.',
    },
    {
      icon: BookOpen,
      title: '2. Requisição de Sulfite & Apostilas Didáticas',
      desc: 'Para provas bimestrais e simulados, favor agrupar os pedidos pela coordenação pedagógica. O consumo recomendado é de 1 resma por turma a cada 15 dias letivos.',
    },
    {
      icon: Leaf,
      title: '3. Depósito Sustentável & Sucata Pedagógica',
      desc: 'Sobrantes de EVA, retalhos de cartolina e caixas de papelão em bom estado devem ser direcionados à Estante de Artes Maker para reuso em projetos pedagógicos.',
    },
    {
      icon: Tag,
      title: '4. Tombamento Patrimonial (Itens de Capital)',
      desc: 'Equipamentos permanentes contêm número de patrimônio (ex: CAP-2024-001). Nunca remova as etiquetas de identificação nem transfira itens entre salas sem registro no sistema.',
    },
    {
      icon: ShieldCheck,
      title: '5. Produtos Não-Tóxicos na Educação Infantil',
      desc: 'Materiais com o selo "Atóxico" (tintas guache, colas líquidas e massinhas) têm prioridade para turmas de creche e pré-escola por conformidade com as normas do Inmetro.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1A2024] rounded-3xl shadow-xl border border-stone-200/80 dark:border-stone-800 w-full max-w-xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBF9] dark:bg-[#151A1D] border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#EAF4EE] dark:bg-emerald-950/60 text-[#245D40] dark:text-emerald-300 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Guia Rápido do Almoxarifado Escolar
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Boas práticas, conservação e normas internas para o corpo docente
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

        {/* Content */}
        <div className="p-6 space-y-3.5 text-xs">
          {topics.map((t, idx) => {
            const Icon = t.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#FBFBFA] dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 flex items-start gap-3"
              >
                <div className="p-1.5 rounded-xl bg-white dark:bg-stone-800 text-[#245D40] dark:text-emerald-300 shrink-0 border border-stone-200/60 dark:border-stone-700 shadow-2xs mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">
                    {t.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#23563F] font-semibold"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
