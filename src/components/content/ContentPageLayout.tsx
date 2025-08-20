import React from 'react';
import { motion } from 'framer-motion';

interface ContentPageLayoutProps {
  title: string;
  updatedDate?: string;
  children: React.ReactNode;
  background?: string;
  accentColor?: string;
}

const ContentPageLayout: React.FC<ContentPageLayoutProps> = ({ 
  title, 
  updatedDate,
  children,
  background = 'bg-content-primary',
  accentColor = 'text-accent-primary'
}) => {
  return (
    <div className={`min-h-screen ${background} text-content-contrast`}>
      {/* <Navbar /> */}
      <main className="pt-28 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <header className="mb-10 text-center">
              <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${accentColor}`}>
                {title}
              </h1>
              {updatedDate && (
                <p className="text-content-secondary">Last updated: {updatedDate}</p>
              )}
            </header>
            
            <div className="content-container prose prose-invert max-w-none">
              {children}
            </div>
          </motion.div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default ContentPageLayout;