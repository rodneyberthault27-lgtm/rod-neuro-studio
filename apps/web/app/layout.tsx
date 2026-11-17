import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={
  title:'ROD Neuro Studio 3.0',description:'Da intenção criativa à decisão validada.'
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
