import './globals.css'
import {Analytics} from '@vercel/analytics/react'
import {GoogleAnalytics} from '@next/third-parties/google'

export const metadata = {
  title: "Lyricist's Room",
  description: "작사가를 위한 창작 공간, Lyricist's Room입니다!",
  canonical: 'https://www.lyricistsroom.com/',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.lyricistsroom.com/',
    images: [
      {
        url: 'https://www.lyricistsroom.com/seo.jpg',
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
      <GoogleAnalytics gaId="G-LR5133HTDQ" />
    </body>
  </html>
)
