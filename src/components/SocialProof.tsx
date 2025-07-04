
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
  {
    text: "Finally found fresh tomatoes from my local market without leaving home. The video call with the seller was so helpful!",
    name: "Adeolu J.",
    location: "Akure"
  },
  {
    text: "Got a great deal on yam tubers after negotiating with the seller. Much better than just clicking 'buy now'.",
    name: "Michael O.",
    location: "Ibadan"
  },
  {
    text: "The seller showed me exactly which fish was freshest through video. Delivery arrived in 2 hours. Perfect!",
    name: "Sola A.",
    location: "Lagos"
  }
];

const SocialProof = () => {
  return (
    <section className="py-20 relative" id='social-proof'>
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-market-purple/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Real people, Real experiences</span>
          </h2>
          <p className="text-xl text-gray-300">
            See how MeetnMart is transforming local shopping
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="glass rounded-xl h-full flex flex-col">
                <div className="flex mb-4 text-market-orange">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="italic text-gray-300 mb-6">"{testimonial.text}"</p>
                <div className="mt-auto">
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
