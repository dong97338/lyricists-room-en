import './globals.css'
import {Analytics} from '@vercel/analytics/react'
import {GoogleAnalytics} from '@next/third-parties/google'

export const metadata = {
  title: "Lyricist's Room",
  description: "Lyricist's Room, a creative space for songwriters.",
  canonical: 'https://www.roomforcreator.com/',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.roomforcreator.com/',
    images: [
      {
        url: 'https://www.roomforcreator.com/seo.jpg',
        width: 800,
        height: 600,
        alt: 'Og Image Alt',
        type: 'image/jpeg'
      }
    ],
    siteName: "Lyricist's Room"
  },
  twitter: {
    handle: '@example',
    site: '@example',
    cardType: 'summary_large_image'
  }
}

export default ({children}) => (
  <html lang="en">
    <body className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-gray-100">
      {children}
      <a href="https://github.com/dong97338/lyricists-room" target="_blank" rel="noopener noreferrer" className="fixed bottom-4 left-4 hover:opacity-75">
        <img src="github-mark.svg" alt="깃허브" className="w-10" />
      </a>
      <Analytics />
      <GoogleAnalytics gaId="G-57E30SFWTT" />
    </body>
  </html>
)
