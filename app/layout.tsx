import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Will You Be My Valentine?',
  description: 'An interactive Valentine\'s Day proposal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

