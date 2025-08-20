export const markets = [
  "Balogun Market",
  "Alaba Market",
  "Computer Village",
  "Oke Arin Market"
];

export const locations = [
  "Balogun Market, Lagos",
  "Alaba Market, Lagos",
  "Computer Village, Lagos",
  "Oke Arin Market, Lagos"
];

export const categories = [
  "Fish",
  "Tomatoes",
  "Fashion",
  "Electronics",
  "Logistics",
  "Grains"
];

export const urgencyLevels = [
  {
    value: "low",
    label: "No rush",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
  },
  {
    value: "medium",
    label: "Today",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
  },
  {
    value: "high",
    label: "Urgent",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  }
];


export const quickActions = {
  buyer_request: [
    {
      text: "I'm Available",
      tooltip: "Let them know you can help with this request",
      icon: "✓",
      message: "Hi, I saw your request — I'm available and can help out. Let’s connect!"
    },
    {
      text: "Request Call",
      tooltip: "Inform this buyer to call you back",
      icon: "📞",
      message: "Hey, I’m interested in your request. Can you give me a quick call when free?"
    },
    {
      text: "Offer Price",
      tooltip: "Make a price offer for this item",
      icon: "₦",
      message: "I can offer a fair deal on what you need — let's discuss price?"
    },
    {
      text: "Can Deliver",
      tooltip: "Offer delivery service for this item",
      icon: "🚚",
      message: "I can help deliver this item to your location — let me know the details."
    }
  ],
  seller_offer: [
    {
      text: "I'm Interested",
      tooltip: "Let the seller know you're considering this offer",
      icon: "👋",
      message: "Hi, I’m interested in what you’re offering. Is it still available?"
    },
    {
      text: "Buy Now",
      tooltip: "Ready to purchase — let's close the deal",
      icon: "🛒",
      message: "I’d like to buy this now. How do we proceed?"
    },
    {
      text: "Negotiate",
      tooltip: "Start a conversation about price or terms",
      icon: "💬",
      message: "Looks good! Can we talk about the price or any available discount?"
    },
    {
      text: "Request Delivery",
      tooltip: "Ask if this item can be delivered",
      icon: "📦",
      message: "Can this item be delivered to my area? Let me know your delivery options."
    }
  ],
  delivery_ping: [
    {
      text: "Request Delivery",
      tooltip: "Ask this dispatch to handle a delivery",
      icon: "📦",
      message: "Hi, can you help me with a delivery job right now?"
    },
    {
      text: "Send Package",
      tooltip: "Initiate a pickup or send-out request",
      icon: "📤",
      message: "I’ve got a package ready. Can you come pick it up and deliver?"
    },
    {
      text: "Share Location",
      tooltip: "Send your current location for pickup",
      icon: "📍",
      message: "Here’s my pickup location — let me know once you’re on your way."
    },
    {
      text: "Chat Now",
      tooltip: "Start a chat to discuss the delivery details",
      icon: "💬",
      message: "Hey, I’d like to talk about a delivery job. Are you free to chat?"
    }
  ]
};


const placeholders = [
  "50 bundles of ugu just harvested — 1-day shelf life, Ogba pickup only, priced to move fast.",
  "8 minimalist wall clocks, boxed and ready — Surulere pickup, ₦3k each till 6 PM today.",
  // "Instant 100GB MTN data bundles available — auto-delivery, valid 7 days, best rate in town.",
  "Freshly baked meat pies (40pcs) available — Lekki dispatch before 2 PM, ₦500 each, hot and moving.",
  "Urgent sale: 10 used but clean HP laptops — Alaba pickup, tested and trusted, ₦85k flat per unit."
];
export const placeholderExample = placeholders[Math.floor(Math.random() * placeholders.length)]