import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Button } from '@/components/ui/button';

import 'swiper/css';
// Placeholder data
const showcaseSections = [
  {
    title: 'Live Now',
    description: 'Connect instantly with sellers who are live and ready to help you shop.',
    cta: 'Explore Live Sellers',
    image: '/public/live-sellers.png', // Replace with actual asset
    bg: 'bg-market-purple/90',
  },
  {
    title: 'Trending Products',
    description: 'Discover what\'s hot in your local market right now. Fresh, popular, and in-demand.',
    cta: 'See Trending',
    image: '/public/trending-products.png', // Replace with actual asset
    bg: 'bg-market-orange/90',
  },
  {
    title: 'Top Markets',
    description: 'Browse the most trusted and top-rated markets in your area.',
    cta: 'Browse Markets',
    image: '/public/top-markets.png', // Replace with actual asset
    bg: 'bg-market-light-purple/90',
  },
];

const Showcase: React.FC = () => {
  return (
    <section className="w-full py-16 px-4 md:px-0 flex flex-col items-center">
      <h2 className="text-3xl md:text-5xl font-bold mb-8 text-center gradient-text">Showcase</h2>
      <Swiper
        spaceBetween={32}
        slidesPerView={1}
        loop
        className="w-full max-w-4xl"
      >
        {showcaseSections.map((section, idx) => (
          <SwiperSlide key={idx}>
            <div className={`rounded-3xl shadow-xl flex flex-col md:flex-row items-center p-8 gap-8 ${section.bg} text-white transition-all duration-500`}>  
              <img
                src={section.image}
                alt={section.title}
                className="w-48 h-48 object-contain rounded-2xl bg-white/10"
              />
              <div className="flex-1 text-center md:text-left space-y-4">
                <h3 className="text-2xl md:text-4xl font-semibold">{section.title}</h3>
                <p className="text-lg md:text-xl opacity-90">{section.description}</p>
                <Button className="mt-4 bg-white text-market-purple hover:bg-market-purple/90 hover:text-white transition">
                  {section.cta}
                </Button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Showcase; 