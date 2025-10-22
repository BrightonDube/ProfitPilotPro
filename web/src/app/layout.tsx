import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'BizPilot - Business Management Platform',
    template: '%s | BizPilot',
  },
  description: 'Comprehensive business management platform for inventory, sales, and operations',
  keywords: ['business', 'management', 'inventory', 'sales', 'POS', 'operations'],
  authors: [{ name: 'BizPilot Team' }],
  creator: 'BizPilot',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bizpilot.com',
    siteName: 'BizPilot',
    title: 'BizPilot - Business Management Platform',
    description: 'Comprehensive business management platform for inventory, sales, and operations',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BizPilot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizPilot - Business Management Platform',
    description: 'Comprehensive business management platform for inventory, sales, and operations',
    images: ['/twitter-image.png'],
    creator: '@bizpilot',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}