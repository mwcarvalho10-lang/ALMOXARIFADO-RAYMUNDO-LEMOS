'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f8f5] dark:bg-[#0c1711] text-[#172b20] dark:text-[#e4f6ec]">
      <h2 className="text-2xl font-bold mb-2">Algo deu errado</h2>
      <p className="text-sm text-stone-500 mb-4">{error.message || 'Erro inesperado'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-xl bg-[#348a57] text-white hover:bg-[#2b7147] transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}
