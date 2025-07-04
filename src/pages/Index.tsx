import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import Comparison from '@/components/Comparison';
import SocialProof from '@/components/SocialProof';
import JoinNewsletter from '@/components/JoinNewsletter';
import FAQ from '@/pages/FAQ';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const Index = () => {
  return (
    <div className="min-h-screen bg-market-deep-purple text-white">
      <SEO 
        title="MeetnMart |  Connect with Local Sellers and Buyers"
        description="Join MeetnMart to connect with verified local sellers and buyers. Find services, products, and opportunities in your area. Start buying and selling today!"
      />
      <Navbar />
      <main>
        <br /><br />
        <HeroSection />
        <HowItWorks />
        <Comparison />
        <SocialProof />
        <FAQ />
        <JoinNewsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
