
import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import VideoPlayer from './VideoPlayer';
import { Link } from 'react-router-dom';
import Showcase from './Showcase';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth()
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden">
      {/* <div className="">
        <p>Last Updated: </p>
      </div> */}
      {/* Abstract market background animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-market-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-market-orange/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-market-light-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="container px-4 md:px-6 space-y-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
            Your local market, now just a
            <span className="gradient-text"> call away.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            MeetnMart brings your neighborhood market online, connect in real-time with trusted sellers, explore products LIVE, and get what you need delivered fast.
          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="bg-market-purple hover:bg-market-purple/90 text-white px-8 py-6 text-lg rounded-lg"
          >
            <Link to={isAuthenticated ? "/feeds" : "/getting-started"}>
              {isAuthenticated ? "Dashboard" : "Get Started"}
            </Link>
          </Button>
          {/* <Button
            variant="outline"
            size="lg"
            className="border-market-purple/50 hover:border-market-purple text-white px-8 py-6 text-lg rounded-lg"
          >
            Learn More
          </Button> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative w-full max-w-4xl mx-auto mt-16"
        >
          {/* <Showcase /> */}

          {/* <VideoPlayer /> */}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
