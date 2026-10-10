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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Dancing+Script:wght@500;600;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body suppressHydrationWarning className="bg-[#FAFBF9] text-stone-800 antialiased min-h-screen selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
