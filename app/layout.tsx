import './globals.css'
import { VT323 } from 'next/font/google'

const vt323 = VT323({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'RetroTask',
  description: 'A retro-styled task management application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${vt323.className} bg-black`}>{children}</body>
    </html>
  )
}

