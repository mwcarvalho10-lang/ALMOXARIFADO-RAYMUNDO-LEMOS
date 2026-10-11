'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, RotateCcw, X, Camera, Package, Sparkles } from 'lucide-react';

export interface DynamicIslandNotification {
  id: string;
  type: 'success' | 'alert' | 'scan' | 'undo';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  undoSecondsLeft?: number;
}

interface DynamicIslandProps {
  notification: DynamicIslandNotification | null;
  onDismiss: () => void;
}

const NotificationItem: React.FC<{
  notification: DynamicIslandNotification;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  const initialSeconds = notification.undoSecondsLeft ?? (notification.type === 'undo' ? 8 : 5);
  const [secondsLeft, setSecondsLeft] = React.useState<number>(initialSeconds);

  React.useEffect(() => {
    if (secondsLeft <= 0) {
      onDismiss();
      return;
    }
    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, onDismiss]);

  return (
    <motion.div
      key={notification.id}
      initial={{ opacity: 0, y: -20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className="pointer-events-auto bg-[#10281b]/95 text-white backdrop-blur-xl border border-[#275338] shadow-2xl rounded-full px-4 py-2 sm:px-5 sm:py-2.5 flex items-center gap-3.5 max-w-md w-auto"
    >
      {/* Status icon with animated pulse */}
      <div className="shrink-0">
        {notification.type === 'undo' && (
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
          </div>
        )}
        {notification.type === 'success' && (
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-[#a0e2ba] flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        )}
        {notification.type === 'alert' && (
          <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        )}
        {notification.type === 'scan' && (
          <div className="w-6 h-6 rounded-full bg-[#348a57]/30 text-[#8ee2ae] flex items-center justify-center">
            <Camera className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Text message */}
      <div className="min-w-0 pr-1 text-left">
        <div className="text-xs font-bold leading-tight truncate text-white">
          {notification.title}
        </div>
        <div className="text-[11px] text-[#bde3cb] truncate max-w-xs leading-tight">
          {notification.message}
        </div>
      </div>

      {/* Undo or Custom Action Button */}
      {notification.onAction && (
        <button
          onClick={() => {
            notification.onAction?.();
            onDismiss();
          }}
          className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          {notification.actionLabel || 'Desfazer'}
          <span className="font-mono text-[10px] opacity-80">
            ({secondsLeft}s)
          </span>
        </button>
      )}

      {/* Close */}
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  notification,
  onDismiss,
}) => {
  return (
    <div className="fixed top-3 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        {notification && (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
