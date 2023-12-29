import './globals.css'
import Provider from '@/components/Providers';

export const metadata = {
  title: 'AniDubsBD',
  description: "Welcome to Bangladesh's most popular anime fandubbing platform - AniDubsBD",
  metadataBase: process.env.baseURL,
  openGraph:{
    title: 'AniDubsBD',
    description: "Welcome to Bangladesh's most popular anime fandubbing platform - AniDubsBD",
  }
}

export default function RootLayout({ children }) {
  const year = new Date();
  return (
    <html lang="en">

      <body className='font-body'>
        <Provider>
            {children}
        </Provider>
      </body>
    </html>
  )
}
