import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth/AuthContext';

export const metadata: Metadata = {
  title: 'Echo-Flow | AI Assessment & Training Command Center',
  description: 'AI-powered employee assessment and training platform for call centers and sales teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-background font-sans antialiased text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
