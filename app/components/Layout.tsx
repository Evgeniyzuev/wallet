import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-[#1c2033] text-white min-h-screen flex flex-col">
      <main className="flex-grow p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
