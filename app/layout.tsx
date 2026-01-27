import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { TodoProvider } from '@/contexts/TodoContext';
import { FocusProvider } from '@/contexts/FocusContext';
import { StudyProvider } from '@/contexts/StudyContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Surgery Course',
  description: 'Surgery Course Learning Management System by Haider Alaa',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Surgery Course',
  },
  icons: {
    icon: '/app-icon.png',
    apple: '/app-icon.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TodoProvider>
            <StudyProvider>
              <FocusProvider>
                {children}
              </FocusProvider>
            </StudyProvider>
          </TodoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
