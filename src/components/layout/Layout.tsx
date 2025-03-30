
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 animate-fade-in">
        <div className="container mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
      <Toaster />
      <SonnerToaster position="top-right" />
    </div>
  );
};
