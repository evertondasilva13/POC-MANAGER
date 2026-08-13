import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'POC Manager — MTM | Mercado Livre',
  description: 'Gestão de Provas de Conceito',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
