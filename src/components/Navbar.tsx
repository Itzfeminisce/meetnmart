import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 backdrop-blur-lg bg-market-deep-purple/70' : 'py-4 bg-transparent'
          }`}
      >
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between">
            <Logo />

            <nav className="hidden md:flex items-center space-x-8">
              <a href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="/#why-choose-us" className="text-gray-300 hover:text-white transition-colors">
                Why Choose Us
              </a>
              <a href="/#social-proof" className="text-gray-300 hover:text-white transition-colors">
                Testimonies
              </a>
              <a href="/#faq" className="text-gray-300 hover:text-white transition-colors">
                FAQ
              </a>
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    className="bg-market-purple hover:bg-market-purple/90 text-white"
                  >
                    <Link to="/feeds">Back to Market</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                    onClick={signOut}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="bg-market-purple hover:bg-market-purple/90 text-white"
                >
                  <Link to="/getting-started">Login</Link>
                </Button>
              )}
            </div>

            <button
              className="md:hidden text-gray-300 mr-4"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[60px] left-0 right-0 z-40 bg-market-deep-purple shadow-lg bg-background px-4 py-4  md:hidden"
          >
            <nav className="flex flex-col space-y-4 mr-4 border-t border-t-slate-200/10 my-4">
              <a
                href="/#how-it-works"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="/#why-choose-us"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Why Choose Us
              </a>
              <a
                href="/#social-proof"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonies
              </a>
              <a
                href="/#faq"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </a>
              {isAuthenticated ? (
                <>
                  <Button
                    asChild
                    className="bg-market-purple hover:bg-market-purple/90 text-white"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-white/10"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  className="bg-market-purple hover:bg-market-purple/90 text-white"
                >
                  <Link
                    to="/getting-started"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
