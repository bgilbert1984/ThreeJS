import React from 'react';
import './globals.css'; // Import global styles
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Go Anthropic API Dashboard',
  description: 'Dashboard for managing and viewing messages from the Go Anthropic API',
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <h1>Go Anthropic API Dashboard</h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>&copy; {new Date().getFullYear()} Go Anthropic API</p>
        </footer>
      </body>
    </html>
  );
};

export default Layout;