
import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    title: "Pick a Market",
    description: "Choose your real-world location and browse local vendors",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ),
  },
  {
    title: "Talk to Sellers",
    description: "Browse and call in real-time via live video/audio",
    icon: (
      <svg fill="#FFFFFF" height="64px" width="64px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 484.909 484.909" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M204.993,438.478c-6.347,6.349-6.347,16.639,0,22.978c3.173,3.174,7.332,4.761,11.488,4.761 c4.158,0,8.316-1.587,11.489-4.761l49.747-49.754l-22.979-22.978L204.993,438.478z"></path> <polygon points="317.642,325.807 300.695,342.761 323.671,365.738 363.597,325.807 "></polygon> <path d="M260.77,325.807h-45.954l135.627,135.648c3.173,3.174,7.331,4.761,11.487,4.761c4.158,0,8.315-1.587,11.488-4.761 c6.349-6.339,6.349-16.629,0-22.978L260.77,325.807z"></path> <path d="M102.294,107.658c21.471,0,38.878-19.915,38.878-44.478c0-24.564-17.407-44.487-38.878-44.487 c-21.486,0-38.877,19.923-38.877,44.487C63.417,87.743,80.808,107.658,102.294,107.658z"></path> <path d="M87.124,123.517v32.269c0,3.396,2.761,6.157,6.157,6.157h18.026c3.396,0,6.156-2.761,6.156-6.157v-32.269 C107.784,123.454,96.804,123.454,87.124,123.517z"></path> <path d="M77.762,296.157h-7.173c-6.87,0-12.44-5.57-12.44-12.442v-41.058H41.28l2.714-13.06h30.53V123.66 c-7.062,0.128-11.934,0.302-12.44,0.539c-5.554,1.365-10.505,4.951-12.885,10.656L1.421,250.377 c-3.937,9.521,0.586,20.439,10.107,24.382c2.332,0.958,4.76,1.42,7.14,1.42c7.315,0,14.266-4.34,17.249-11.537l1.635-3.966 l-11.251,54.167c-0.856,4.109,0.192,8.386,2.825,11.639c2.65,3.253,6.617,5.141,10.822,5.141h13.076v112.196 c0,12.369,10.028,22.398,22.389,22.398c12.361,0,22.39-10.029,22.39-22.398V331.622h8.982v112.196 c0,12.369,10.029,22.398,22.39,22.398c12.361,0,22.39-10.029,22.39-22.398V331.622h13.076c4.205,0,8.171-1.888,10.821-5.141 c0.159-0.198,0.19-0.468,0.334-0.674h-63.789C94.582,325.807,80.255,312.889,77.762,296.157z"></path> <path d="M130.064,229.597h30.515l2.714,13.06h-16.819v13.662h57.838c-0.127-1.992-0.349-3.999-1.158-5.942l-47.778-115.521 c-2.365-5.705-7.316-9.291-12.869-10.663c-0.508-0.231-5.379-0.413-12.441-0.533V229.597z"></path> <path d="M466.406,272.568h-14.13c4.088-4.887,6.552-11.18,6.552-18.05c0-15.549-12.604-28.154-28.153-28.154 c-15.549,0-28.154,12.605-28.154,28.154c0,6.87,2.464,13.163,6.553,18.05h-22.131c4.089-4.887,6.553-11.18,6.553-18.05 c0-15.549-12.604-28.154-28.154-28.154c-15.549,0-28.153,12.605-28.153,28.154c0,6.87,2.464,13.163,6.553,18.05h-22.491 c4.088-4.887,6.552-11.18,6.552-18.05c0-2.477-0.322-4.877-0.923-7.165c-1.349-5.322-4.256-10.023-8.209-13.587 c-5.01-4.595-11.688-7.402-19.022-7.402c-15.549,0-28.154,12.605-28.154,28.154c0,6.87,2.464,13.163,6.553,18.05H112.007 c-10.22,0-18.504,8.284-18.504,18.495c0,10.211,8.284,18.495,18.504,18.495h354.399c10.22,0,18.503-8.284,18.503-18.495 C484.909,280.852,476.626,272.568,466.406,272.568z"></path> <path d="M370.467,205.351c0,15.115,12.25,27.373,27.374,27.373c15.121,0,27.371-12.258,27.371-27.373 c0-15.115-12.25-27.373-27.371-27.373C382.717,177.978,370.467,190.236,370.467,205.351z"></path> <path d="M365.342,183.977c15.122,0,27.372-12.258,27.372-27.373c0-15.115-12.25-27.373-27.372-27.373 c-15.123,0-27.373,12.258-27.373,27.373C337.969,171.718,350.219,183.977,365.342,183.977z"></path> <path d="M332.844,232.724c15.122,0,27.372-12.258,27.372-27.373c0-15.115-12.25-27.373-27.372-27.373 c-15.123,0-27.373,12.258-27.373,27.373C305.471,220.465,317.721,232.724,332.844,232.724z"></path> </g> </g></svg>
    ),
  },
  {
    title: "Get it Delivered",
    description: "Invite a delivery agent into the call and seal the deal",
    icon: (
      <svg fill="#FFFFFF" width="64px" height="64px" viewBox="-4.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>delivery</title> <path d="M18.080 16.8c-2.64 0-4.8 2.16-4.8 4.8s2.16 4.8 4.8 4.8 4.8-2.16 4.8-4.8-2.080-4.8-4.8-4.8zM18.080 24.76c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.32 3.12-3.12 3.12zM15.96 15.080c0.32 0.32 0.88 0.32 1.2 0s0.32-0.88 0-1.2l-3.56-3.44c-0.28-0.28-0.76-0.32-1.080-0.080l-5 3.8c-0.2 0.16-0.32 0.4-0.32 0.68s0.12 0.52 0.36 0.68l2.24 1.64-1.52 1.080c-0.96-0.88-2.16-1.44-3.48-1.44-2.64 0-4.8 2.16-4.8 4.8s2.16 4.8 4.8 4.8 4.8-2.16 4.8-4.8c0-0.72-0.16-1.4-0.44-2.040l2.48-1.72c0.24-0.16 0.36-0.4 0.36-0.68s-0.12-0.52-0.36-0.68l-2.28-1.68 3.52-2.68 3.080 2.96zM7.88 21.64c0 1.72-1.4 3.12-3.12 3.12s-3.12-1.4-3.12-3.12 1.4-3.12 3.12-3.12c0.76 0 1.44 0.28 2 0.72l-2.48 1.72c-0.36 0.28-0.48 0.8-0.2 1.16 0.16 0.24 0.44 0.36 0.68 0.36 0.16 0 0.32-0.040 0.48-0.16l2.48-1.72c0.12 0.32 0.16 0.64 0.16 1.040zM16.88 10.88c1.48 0 2.68-1.2 2.68-2.68s-1.2-2.68-2.68-2.68-2.68 1.2-2.68 2.68 1.2 2.68 2.68 2.68zM16.88 7.24c0.56 0 1 0.44 1 1s-0.44 1-1 1-1-0.44-1-1 0.44-1 1-1z"></path> </g></svg>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 relative">
      {/* Background accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-market-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-market-orange/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-gray-300">
            Experience the charm of local markets with modern convenience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass p-8 rounded-xl h-full flex flex-col items-center text-center">
                <div className="bg-gradient-to-br from-market-purple to-market-orange p-0.5 rounded-full mb-6">
                  <div className="bg-market-deep-purple rounded-full p-4 text-white">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-market-purple" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
