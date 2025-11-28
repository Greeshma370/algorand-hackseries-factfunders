import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Add padding so content doesn't hide behind fixed navbar */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Layout;
