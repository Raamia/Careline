import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { QueryProvider } from '@/components/providers/query-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareLine - Intelligent Medical Referrals',
  description: 'AI-powered medical referral system connecting patients with specialists',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <QueryProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </QueryProvider>
        </UserProvider>
      </body>
    </html>
  );
}
