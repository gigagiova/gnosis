import './globals.css'
import { Playfair_Display } from 'next/font/google'

const serif = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair'
})

export const metadata = {
  title: 'Gnosis - Essay Writing',
  description: 'Write and manage your essays'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`min-h-screen bg-background text-foreground antialiased ${serif.variable}`}>
        {children}
      </body>
    </html>
  )
}
