import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAFBF9] text-stone-800">
      <h2 className="text-2xl font-bold mb-2">Página não encontrada (404)</h2>
      <p className="text-sm text-stone-500 mb-4">A página solicitada não foi encontrada.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#1E4620] transition-colors font-medium shadow-2xs"
      >
        Voltar ao Início
      </Link>
    </div>
  );
}
