import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { CreatePostFAB } from '@/components/layout/CreatePostFAB';

export const metadata: Metadata = {
  title: 'Tungsten Learn — Academic Knowledge Platform',
  description:
    'Share, discover, and collaborate on study notes and academic materials with your peers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <CreatePostFAB />
        </AuthProvider>
      </body>
    </html>
  );
}
