import './globals.css';

export const metadata = {
  title: 'BEREIA — Estudo Bíblico com Profundidade',
  description: 'Estudo bíblico com contexto histórico, perspectivas teológicas e aplicação prática. Inspirado em Atos 17:11. 100% gratuito.',
  keywords: ['bíblia', 'estudo bíblico', 'teologia', 'bereia', 'atos 17:11', 'bible study'],
  metadataBase: new URL('https://www.bereiaestudos.com.br'),
  openGraph: {
    title: 'BEREIA — Estudo Bíblico com Profundidade',
    description: 'Examine as Escrituras com contexto, perspectivas e aplicação. Inspirado em Atos 17:11.',
    url: 'https://www.bereiaestudos.com.br',
    siteName: 'BEREIA',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#faf6f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-bereia-50 via-bereia-200 to-bereia-300">
        {children}
      </body>
    </html>
  );
}
