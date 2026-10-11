'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle2, AlertCircle, Plus, Minus, MapPin } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { playBeep } from '@/lib/audio';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onQuickMovement: (itemId: string, type: 'entrada' | 'saida') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  onQuickMovement,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [matchedItem, setMatchedItem] = useState<InventoryItem | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const currentVideo = videoRef.current;

    if (isOpen) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: 'environment' } })
          .then((mediaStream) => {
            stream = mediaStream;
            if (currentVideo) {
              currentVideo.srcObject = mediaStream;
              setCameraActive(true);
            }
          })
          .catch(() => {
            setCameraActive(false);
          });
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (currentVideo) {
        currentVideo.srcObject = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanCode = (codeToSearch: string) => {
    const clean = codeToSearch.trim().toUpperCase();
    if (!clean) return;

    const found = items.find(
      (i) =>
        i.code.toUpperCase() === clean ||
        i.patrimonyNumber?.toUpperCase() === clean ||
        i.name.toLowerCase().includes(clean.toLowerCase())
    );

    if (found) {
      playBeep('scan');
      setMatchedItem(found);
      setScanStatus(`Material identificado com sucesso: ${found.name}`);
    } else {
      playBeep('alert');
      setMatchedItem(null);
      setScanStatus(`Código "${clean}" não cadastrado no almoxarifado.`);
    }
  };

  const handleSimulateQuickBip = (sampleItem: InventoryItem) => {
    setManualCode(sampleItem.code);
    handleScanCode(sampleItem.code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#FAFBF9] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#EAF6ED] text-[#14532D] border border-[#CDE5D5] rounded-xl shadow-2xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-bold text-base text-stone-900">Leitor de Código de Barras</h3>
                <span className="hidden sm:inline font-cursive text-lg text-emerald-800 font-normal">
                  ~ bipagem ágil ~
                </span>
              </div>
              <p className="text-xs text-stone-500">Conferência e Bipagem Rápida no Almoxarifado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Camera Viewport or Mock Frame */}
          <div className="relative w-full h-44 bg-stone-100 rounded-2xl overflow-hidden border border-stone-300 flex items-center justify-center">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4 text-stone-500 space-y-1.5">
                <Camera className="w-8 h-8 mx-auto text-stone-400 stroke-[1.5]" />
                <p className="font-semibold text-xs">Câmera em Standby ou Leitor USB Conectado</p>
                <p className="text-[11px] text-stone-400">Você pode usar um leitor de código de barras físico ou digitar o código abaixo.</p>
              </div>
            )}

            {/* Scanning overlay laser line */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-sm animate-pulse" />
          </div>

          {/* Manual Input Search */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700 block">
              Digitar ou Bipar Código de Barras:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanCode(manualCode)}
                placeholder="Ex: PAP-001 ou digite o nome do item..."
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-[#FAFBF9] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={() => handleScanCode(manualCode)}
                className="px-4 py-2 bg-[#2D6A4F] hover:bg-[#23563F] text-white font-semibold rounded-xl transition-colors shadow-2xs shrink-0"
              >
                Localizar
              </button>
            </div>
          </div>

          {/* Quick Simulation Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-stone-500 font-medium">Bipagem Rápida de Teste:</span>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 4).map((it) => (
                <button
                  key={it.id}
                  onClick={() => handleSimulateQuickBip(it)}
                  className="px-2.5 py-1 text-[11px] bg-stone-100 hover:bg-[#EAF6ED] text-stone-700 hover:text-[#14532D] rounded-lg border border-stone-200/80 transition-colors font-mono"
                >
                  ⚡ {it.code}
                </button>
              ))}
            </div>
          </div>

          {/* Scan result feedback */}
          {scanStatus && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              matchedItem 
                ? 'bg-[#EAF6ED] border-[#CDE5D5] text-[#14532D]' 
                : 'bg-[#FFF5F5] border-[#FED7D7] text-[#991B1B]'
            }`}>
              {matchedItem ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span className="font-medium">{scanStatus}</span>
            </div>
          )}

          {/* Matched Item Card with Quick Actions */}
          {matchedItem && (
            <div className="p-4 bg-[#FAFBF9] border border-stone-200 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                    {matchedItem.code}
                  </span>
                  <h4 className="font-bold text-stone-900 text-sm mt-1">
                    {matchedItem.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span>{matchedItem.location || 'Depósito Central'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 uppercase block font-medium">Estoque Atual</span>
                  <span className="text-lg font-bold text-stone-900 tabular-nums">
                    {matchedItem.quantity} {matchedItem.unit}
                  </span>
                </div>
              </div>

              {/* Quick in/out directly from scanner */}
              <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80">
                <button
                  onClick={() => {
                    playBeep('success');
                    onQuickMovement(matchedItem.id, 'entrada');
                    setMatchedItem({ ...matchedItem, quantity: matchedItem.quantity + 1 });
                  }}
                  className="flex-1 py-1.5 px-3 bg-[#EAF6ED] hover:bg-[#D2EEDA] text-[#14532D] border border-[#CDE5D5] font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  +1 Entrada Rápida
                </button>
                <button
                  disabled={matchedItem.quantity <= 0}
                  onClick={() => {
                    playBeep('click');
                    onQuickMovement(matchedItem.id, 'saida');
                    setMatchedItem({ ...matchedItem, quantity: Math.max(0, matchedItem.quantity - 1) });
                  }}
                  className="flex-1 py-1.5 px-3 bg-[#FFF7ED] hover:bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] font-semibold rounded-xl flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                  -1 Baixa Rápida
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-stone-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Fechar Leitor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
