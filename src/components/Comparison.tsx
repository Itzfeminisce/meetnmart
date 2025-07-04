import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Video, Handshake, MapPin, Zap } from 'lucide-react';

const comparisonFeatures = [
  {
    title: "Real-time Interaction",
    icon: <Zap size={18} className="text-market-purple" />,
    meetnmart: true,
    competitors: false,
    benefit: "Get instant answers, build trust, and make decisions faster."
  },
  {
    title: "Video Calls with Sellers",
    icon: <Video size={18} className="text-market-purple" />,
    meetnmart: true,
    competitors: false,
    benefit: "See who you're buying from, inspect products live, and negotiate face-to-face."
  },
  {
    title: "Secure Escrow Payments",
    icon: <Shield size={18} className="text-market-orange" />,
    meetnmart: true,
    competitors: false,
    benefit: "Your money is safe until you receive your order—no scams, no worries."
  },
  {
    title: "Negotiate Prices",
    icon: <Handshake size={18} className="text-market-purple" />,
    meetnmart: true,
    competitors: false,
    benefit: "Get the best deals by bargaining directly with sellers."
  },
  {
    title: "Local Market Experience",
    icon: <MapPin size={18} className="text-market-purple" />,
    meetnmart: true,
    competitors: false,
    benefit: "Shop as if you're physically at the market—support local businesses."
  },
];

const Comparison = () => {
  return (
    <section className="py-20 relative" id='why-choose-us'>
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-0 w-64 h-64 bg-market-orange/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-market-purple/10 rounded-full blur-3xl"></div>
      </div>
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Why MeetnMart Stands Out?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-2">
            Not all marketplaces are created equal. Here's how MeetnMart redefines your online shopping experience:
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="overflow-x-auto w-full">
            <div className="glass rounded-xl min-w-[600px] md:min-w-0 overflow-hidden border border-white/10">
              <div className="grid grid-cols-5 text-center py-4 border-b border-white/10 bg-white/5 text-xs md:text-base">
                <div className="col-span-2 font-bold text-gray-200 text-left pl-4">Feature</div>
                <div className="col-span-1 font-bold text-market-purple flex items-center justify-center gap-2">
                  MeetnMart
                </div>
                <div className="col-span-1 font-bold text-gray-400">Others</div>
                <div className="col-span-1 font-bold text-gray-300 text-left">Why it matters</div>
              </div>
              {comparisonFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-5 py-4 items-center text-xs md:text-base ${index !== comparisonFeatures.length - 1 ? 'border-b border-white/10' : ''} ${feature.meetnmart && !feature.competitors ? 'bg-market-purple/5' : ''}`}
                >
                  <div className="col-span-2 px-4 flex items-center gap-2 font-medium">
                    {feature.icon} {feature.title}
                  </div>
                  <div className="col-span-1 flex justify-center items-center">
                    {feature.meetnmart ? (
                      <Check className="h-6 w-6 text-market-purple" />
                    ) : (
                      <X className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="col-span-1 flex justify-center items-center">
                    {feature.competitors ? (
                      <Check className="h-6 w-6 text-gray-400" />
                    ) : (
                      <X className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div className="col-span-1 text-left text-gray-300 text-xs md:text-sm">
                    {feature.benefit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Comparison;
