import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-[#1c2033] text-white min-h-screen flex flex-col">
      <main className="flex-grow p-4">
        {children}
      </main>
      <Navigation />
    </div>
  );
};

export default Layout;
