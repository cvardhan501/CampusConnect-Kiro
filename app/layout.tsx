import React from 'react';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CampusConnect — Campus Issue Reporting & Lost & Found',
  description: 'Central hub for campus maintenance requests and Lost & Found item management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-[#f8fafc] text-slate-900">{children}</body>
    </html>
  );
}
