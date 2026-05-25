import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TTPageReview by RCN — Free TikTok Profile Score',
  description: 'Get a free TikTok profile review in seconds. Enter your username and see how your profile scores across 6 key categories. By Rise Creator Network.',
  openGraph: {
    title: 'TTPageReview by RCN — Free TikTok Profile Score',
    description: 'Enter your TikTok username and get a scored profile report card in seconds. By Rise Creator Network.',
    url: 'https://ttpagereview.com',
    siteName: 'TTPageReview by RCN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
