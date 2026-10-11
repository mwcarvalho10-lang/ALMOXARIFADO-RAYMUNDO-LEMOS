'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, School, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { playBeep } from '@/lib/audio';

interface AuthLockScreenProps {
  onUnlock: () => void;
  schoolName: string;
}

export const AuthLockScreen: React.FC<AuthLockScreenProps> = ({ onUnlock, schoolName }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAttemptUnlock = (pwdToTest = password) => {
    setError('');
    if (pwdToTest.trim() === '2026') {
      playBeep('success');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('almoxarifado_authenticated', 'true');
      }
      onUnlock();
    } else {
      playBeep('alert');
      setError('Senha incorreta! Digite a senha 2026 para acessar o almoxarifado.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAttemptUnlock();
    }
  };

  const handleKeypadPress = (val: string) => {
    setError('');
    if (val === 'C') {
      setPassword('');
      inputRef.current?.focus();
      return;
    }
    if (val === 'OK') {
      handleAttemptUnlock();
      return;
    }
    const next = password + val;
    setPassword(next);
    if (next === '2026') {
      setTimeout(() => handleAttemptUnlock(next), 120);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center p-4 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background subtle decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl"></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-transform ${isShaking ? 'animate-bounce' : ''}`}>
        <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
          {/* Header Banner */}
          <div className="px-6 pt-8 pb-6 text-center bg-gradient-to-b from-[#FAFBF9] to-white border-b border-stone-100 space-y-3">
            <div className="inline-flex p-3 bg-[#EAF4EE] text-[#1E4620] rounded-2xl border border-[#CFE7D8] shadow-2xs mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 font-medium">
                <School className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span className="truncate max-w-[280px]">{schoolName}</span>
              </div>
              <h1 className="font-cursive text-4xl text-[#1E4620] font-normal mt-1 leading-tight">
                Almoxarifado Escolar
              </h1>
              <p className="text-xs text-stone-600 mt-1">
                Controle de Estoque & Gestão Patrimonial
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-[#1E4620] text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Acesso Restrito ao Depósito</span>
            </div>
          </div>

          {/* Form and Keypad */}
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Senha de Acesso (Digite 2026)
              </label>

              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  value={password}
                  onChange={(e) => {
                    setError('');
                    setPassword(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite a senha..."
                  className="w-full pl-4 pr-11 py-3 text-sm font-semibold tracking-wider text-center text-stone-900 bg-[#F8FAF9] border border-stone-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-all shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 transition-colors"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-[#991B1B] bg-[#FFF5F5] border border-[#FED7D7] rounded-xl p-2.5 mt-2.5 font-medium text-center animate-in fade-in">
                  {error}
                </p>
              )}
            </div>

            {/* Numeric Keypad for fast touch or mouse entry */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-800 font-bold text-sm transition-all active:scale-95 shadow-2xs"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('C')}
                  className="py-2.5 rounded-xl bg-[#FFF5F5] hover:bg-rose-100 text-[#991B1B] border border-[#FED7D7] font-semibold text-xs transition-all active:scale-95"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 text-stone-800 font-bold text-sm transition-all active:scale-95 shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleAttemptUnlock()}
                  className="py-2.5 rounded-xl bg-[#EAF4EE] hover:bg-[#DCEEE2] text-[#1E4620] border border-[#CFE7D8] font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Entrar
                </button>
              </div>
            </div>

            {/* Direct Unlock Button */}
            <button
              type="button"
              onClick={() => handleAttemptUnlock()}
              className="w-full py-3 px-4 bg-[#2D6A4F] hover:bg-[#1E4620] text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-2xs flex items-center justify-center gap-2 transition-all"
            >
              <span>Acessar Depósito Escolar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Password Hint */}
            <div className="pt-2 border-t border-stone-100 text-center">
              <span className="text-[11px] text-stone-500 font-medium">
                Senha de acesso pré-configurada:{' '}
                <strong className="text-[#1E4620] font-mono font-bold bg-[#EAF4EE] px-1.5 py-0.5 rounded border border-[#CFE7D8]">
                  2026
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
