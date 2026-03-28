import type { Metadata } from 'next'
import { Orbitron } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({ 
  subsets: ['latin'],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: 'Solo Leveling Dashboard',
  description: 'The System is evolution. Become the Shadow Monarch.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
