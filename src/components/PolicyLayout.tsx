
import React from 'react';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import SEO from './SEO';

interface PolicyLayoutProps {
  title: string;
  updatedDate?: string;
  children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({ 
  title, 
  updatedDate,
  children 
}) => {
  return (
    <div className="min-h-screen bg-market-deep-purple text-white">
      <SEO 
        title={`${title} | MeetnMart`}
        description={`Read our ${title.toLowerCase()} to understand how we protect your data and ensure transparency in our services.`}
      />
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container px-4 md:px-6 mx-auto">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <header className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
              {updatedDate && (
                <p className="text-gray-400">Last updated: {updatedDate}</p>
              )}
            </header>
            
            <div className="policy-content prose prose-invert max-w-none">
              {children}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PolicyLayout;
