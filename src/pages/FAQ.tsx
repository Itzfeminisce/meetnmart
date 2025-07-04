
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Is it safe?",
    answer: "MeetnMart prioritizes safety with verified sellers, secure escrow payment options, and a reputation system. Our AI moderation system also monitors calls to ensure a positive experience."
  },
  {
    question: "How do I join a market?",
    answer: "Simply create an account, choose your local market from our list of available locations, and start browsing sellers. Click on any seller to initiate a video call."
  },
  {
    question: "Can I sell on MeetnMart?",
    answer: "Yes! We welcome sellers to join our platform. You'll need to complete a verification process, set up your virtual stall, and you'll be ready to connect with customers through video calls."
  },
  {
    question: "How does delivery work?",
    answer: "When you're ready to make a purchase, you can invite a delivery agent into your call. They'll pick up your items from the seller and deliver them to your specified location."
  },
  {
    question: "What cities are currently supported?",
    answer: "We're launching in Lagos, Ondo State, and Ibadan initially. We'll be expanding to more locations soon after our initial launch."
  },
  {
    question: "How does the escrow payment system work?",
    answer: "Our secure escrow system holds payment until both buyer and seller confirm the transaction is complete. This ensures safe transactions for both parties and builds trust in our marketplace."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-market-purple/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-market-orange/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Frequently Asked Questions</span>
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to know about MeetnMart
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                <AccordionTrigger className="text-left text-lg py-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-300">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
