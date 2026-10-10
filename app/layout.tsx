import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Almoxarifado Escolar - Gestão de Estoque',
  description: 'Sistema completo de controle de estoque do depósito escolar: papelaria, jogos, itens de capital e limpeza, registro de entradas/saídas, alertas de reposição e lista semestral de compras.',
  openGraph: {
    title: 'Almoxarifado Escolar - Gestão de Estoque',
    description: 'Sistema completo de controle de estoque do depósito escolar: papelaria, jogos, itens de capital e limpeza, registro de entradas/saídas, alertas de reposição e lista semestral de compras.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Almoxarifado Escolar - Gestão de Estoque',
    description: 'Sistema completo de controle de estoque do depósito escolar: papelaria, jogos, itens de capital e limpeza, registro de entradas/saídas, alertas de reposição e lista semestral de compras.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning className="bg-[#F7F9F8] dark:bg-[#121618] text-stone-800 dark:text-stone-100 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
