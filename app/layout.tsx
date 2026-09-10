import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HAND SHOOTER - Real-Time Hand Gesture Game',
  description:
    'Arcade shooting game controlled entirely via real-time hand gestures using MediaPipe Computer Vision in the browser. ₹0 cost, zero API keys.',
  keywords: [
    'Hand Shooter',
    'MediaPipe',
    'Computer Vision',
    'Gesture Game',
    'Arcade',
    'Next.js',
    'Canvas Game',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030712] text-slate-100 antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
