import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TikTok Profile Review — Free Profile Score | ttPageReview',
  description: 'Get a free TikTok profile review in seconds. Enter your username and see how your profile scores across 6 key categories.',
  openGraph: {
    title: 'TikTok Profile Review — Free Profile Score',
    description: 'Enter your TikTok username and get a scored profile report card in seconds.',
    url: 'https://ttpagereview.com',
    siteName: 'ttPageReview',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
