import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeStyleProvider } from '@/lib/theme-context'
import { I18nProvider } from '@/lib/i18n-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CommandMenu } from '@/components/command-menu'
import { siteConfig, getTwitterHandle } from '@/lib/config'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.author.name} - ${siteConfig.site.title}`,
    template: `%s | ${siteConfig.author.name}`
  },
  description: siteConfig.site.description,
  keywords: siteConfig.site.keywords,
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: siteConfig.site.locale,
    siteName: siteConfig.author.name,
    title: `${siteConfig.author.name} - ${siteConfig.site.title}`,
    description: siteConfig.site.description,
  },
  twitter: {
    card: 'summary_large_image',
    creator: `@${getTwitterHandle()}`,
  },
  // Icons are generated dynamically via app/icon.tsx
  alternates: {
    types: {
      'application/rss+xml': '/rss.xml',
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeStyleProvider>
          <I18nProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-16">
                {children}
              </main>
              <Footer />
            </div>
            <CommandMenu />
          </I18nProvider>
        </ThemeStyleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
