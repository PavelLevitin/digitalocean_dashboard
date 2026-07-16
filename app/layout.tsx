import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pavel Levitin — Projects',
  description:
    'Personal site of Pavel Levitin hosting a set of web tools and projects, including HBS Studio, payRase, ternerClock, and Fields.',
  verification: {
    google: 'WNwl2IXz1LV_bvYpsOnMIRYWbqquBBX4RHIa_VrGadE',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
