import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: {
    default: 'Hong Kong Through Film',
    template: '%s | Hong Kong Through Film',
  },
  description:
    'Two one-day narratives through nineteen Hong Kong film locations: a historical timeline and a cinematic food trail.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="postwar_cha_chaan_teng_1950_1999" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('hong-kong-through-film-theme');if(t==='printed_hong_kong_1910_1949'||t==='postwar_cha_chaan_teng_1950_1999')document.documentElement.dataset.theme=t}catch(e){}" }} />
      </head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
