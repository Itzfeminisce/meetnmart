
import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import Comparison from '@/components/Comparison';
import SocialProof from '@/components/SocialProof';
import JoinWaitlist from '@/components/JoinNewsletter';
import FAQ from '@/pages/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-market-deep-purple text-white">
      <Navbar />
      <main>
        <br /><br />
        <HeroSection />
        <HowItWorks />
        <Comparison />
        <SocialProof />
        <FAQ />
        <JoinWaitlist />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
