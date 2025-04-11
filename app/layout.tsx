import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
const inter = Inter({ subsets: ['latin'] });
import {ClerkProvider} from '@clerk/nextjs'

export const metadata: Metadata = {
  title: 'Ticket Booking System',
  description: 'Book your tickets online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
    </ClerkProvider>
  );
}
