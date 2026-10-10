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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c1711]/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f1d16] rounded-3xl shadow-2xl border border-[#d8eadc] dark:border-[#1d3827] w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#eaf5ee] dark:bg-[#142d1f] border-b border-[#d2ebdc] dark:border-[#1d3827] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#348a57] text-white rounded-xl shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#143e26] dark:text-[#e4f6ec]">Leitor de Código de Barras / Câmera</h3>
              <p className="text-xs text-[#527d63] dark:text-[#8eb89e]">Conferência e Bipagem Rápida no Almoxarifado</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#527d63] dark:text-[#8eb89e] hover:text-[#184f2f] p-1.5 rounded-lg hover:bg-[#e4f3e8] dark:hover:bg-[#163122]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Camera Viewfinder Screen */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-slate-800 shadow-inner">
            {cameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-slate-400 space-y-2">
                <Camera className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs">
                  Modo Scanner Ativo. Aponte o código para a câmera ou digite/bipe abaixo.
                </p>
              </div>
            )}

            {/* Viewfinder Target Graphic */}
            <div className="absolute inset-8 border-2 border-dashed border-red-500/70 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-red-500/80 shadow-md shadow-red-500 animate-pulse"></div>
            </div>
          </div>

          {/* Manual Input or USB Gun input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Código Escaneado / Digitação Rápida:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScanCode(manualCode)}
                placeholder="Ex: PAP-001 ou PAT-2023-0182..."
                className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500"
                autoFocus
              />
              <button
                onClick={() => handleScanCode(manualCode)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Bipar
              </button>
            </div>
            {scanStatus && (
              <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                matchedItem ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {matchedItem ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {scanStatus}
              </p>
            )}
          </div>

          {/* Quick Simulation Badges */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Simular Bip em Material de Teste:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 4).map((i) => (
                <button
                  key={i.id}
                  onClick={() => handleSimulateQuickBip(i)}
                  className="px-2.5 py-1 text-xs font-mono rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  ⚡ {i.code}
                </button>
              ))}
            </div>
          </div>

          {/* Matched Item Card with Quick Actions */}
          {matchedItem && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      {matchedItem.code}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{matchedItem.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {matchedItem.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {matchedItem.location || 'Depósito Central'}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Saldo Atual:</span>
                  <span className="text-lg font-extrabold text-blue-700 dark:text-blue-300">
                    {matchedItem.quantity}
                  </span>{' '}
                  <span className="text-xs text-slate-500">{matchedItem.unit}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200 dark:border-blue-900">
                <button
                  onClick={() => {
                    onClose();
                    onQuickMovement(matchedItem.id, 'entrada');
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Dar Entrada (+)
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onQuickMovement(matchedItem.id, 'saida');
                  }}
                  className="py-2 px-3 rounded-lg text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Dar Saída (-)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
