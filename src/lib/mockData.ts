
import { Market, Category, Seller, DeliveryAgent } from '../types';

export const markets: Market[] = [
  {
    id: '1',
    name: 'Central Market',
    location: 'Downtown',
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  },
  {
    id: '2',
    name: 'Harbor Exchange',
    location: 'Waterfront',
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
  },
  {
    id: '3',
    name: 'Uptown Plaza',
    location: 'North District',
    distance: '2.7 km',
    image: 'https://images.unsplash.com/photo-1524230572899-a752b3835840',
  },
  {
    id: '4',
    name: 'Riverside Bazaar',
    location: 'East Side',
    distance: '3.5 km',
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81',
  },
];



export const categories: Category[] = [
  // Food & Grocery
  {belongs_to_category: false, id: '1', name: 'Fresh Produce', icon: '🍎', description: 'Fruits, vegetables, organic', color: 'bg-green-500/10 text-green-600', popular: true },
  {belongs_to_category: false, id: '2', name: 'Bakery', icon: '🥖', description: 'Bread, pastries, desserts', color: 'bg-amber-500/10 text-amber-600', popular: false },
  {belongs_to_category: false, id: '3', name: 'Dairy & Eggs', icon: '🥛', description: 'Milk, cheese, yogurt, eggs', color: 'bg-yellow-500/10 text-yellow-600', popular: false },
  {belongs_to_category: false, id: '4', name: 'Meat & Seafood', icon: '🥩', description: 'Fresh meat, poultry, fish', color: 'bg-red-500/10 text-red-600', popular: false },
  {belongs_to_category: false, id: '5', name: 'Beverages', icon: '🧃', description: 'Juices, sodas, waters', color: 'bg-blue-500/10 text-blue-600', popular: false },

  // Household & Living
  {belongs_to_category: false, id: '6', name: 'Home Decor', icon: '🖼️', description: 'Wall art, vases, candles', color: 'bg-purple-500/10 text-purple-600', popular: false },
  {belongs_to_category: false, id: '7', name: 'Kitchenware', icon: '🍴', description: 'Cookware, utensils, gadgets', color: 'bg-pink-500/10 text-gray-600', popular: false },
  {belongs_to_category: false, id: '8', name: 'Bed & Bath', icon: '🛏️', description: 'Linens, towels, bath accessories', color: 'bg-teal-500/10 text-teal-600', popular: false },
  {belongs_to_category: false, id: '9', name: 'Garden', icon: '🌻', description: 'Plants, tools, outdoor decor', color: 'bg-lime-500/10 text-lime-600', popular: false },

  // Fashion & Accessories
  {belongs_to_category: false, id: '10', name: "Women's Clothing", icon: '👗', description: 'Dresses, tops, pants', color: 'bg-pink-500/10 text-pink-600', popular: true },
  {belongs_to_category: false, id: '11', name: "Men's Clothing", icon: '👔', description: 'Shirts, jeans, suits', color: 'bg-blue-500/10 text-blue-600', popular: false },
  {belongs_to_category: false, id: '12', name: 'Jewelry', icon: '💍', description: 'Necklaces, rings, bracelets', color: 'bg-amber-500/10 text-amber-600', popular: false },
  {belongs_to_category: false, id: '13', name: 'Bags & Wallets', icon: '👜', description: 'Handbags, backpacks, wallets', color: 'bg-brown-500/10 text-brown-600', popular: false },
  {belongs_to_category: false, id: '14', name: 'Shoes', icon: '👟', description: 'Sneakers, boots, sandals', color: 'bg-orange-500/10 text-orange-600', popular: true },

  // Electronics & Gadgets
  {belongs_to_category: false, id: '15', name: 'Mobile Phones', icon: '📱', description: 'Smartphones, accessories', color: 'bg-indigo-500/10 text-indigo-600', popular: true },
  {belongs_to_category: false, id: '16', name: 'Computers', icon: '💻', description: 'Laptops, desktops, tablets', color: 'bg-orange-500/10 text-slate-600', popular: false },
  {belongs_to_category: false, id: '17', name: 'Audio', icon: '🎧', description: 'Headphones, speakers', color: 'bg-black/10 text-green-500', popular: false },
  {belongs_to_category: false, id: '18', name: 'Gaming', icon: '🎮', description: 'Consoles, games, accessories', color: 'bg-purple-500/10 text-purple-600', popular: false },

  // Health & Beauty
  {belongs_to_category: false, id: '19', name: 'Skincare', icon: '🧴', description: 'Creams, serums, cleansers', color: 'bg-pink-500/10 text-pink-600', popular: true },
  {belongs_to_category: false, id: '20', name: 'Makeup', icon: '💄', description: 'Cosmetics, brushes, palettes', color: 'bg-rose-500/10 text-rose-600', popular: false },
  {belongs_to_category: false, id: '21', name: 'Hair Care', icon: '🧴', description: 'Shampoos, conditioners, stylers', color: 'bg-yellow-500/10 text-yellow-600', popular: false },
  {belongs_to_category: false, id: '22', name: 'Fragrances', icon: '🌸', description: 'Perfumes, colognes, oils', color: 'bg-purple-500/10 text-purple-600', popular: false },

  // Kids & Baby
  {belongs_to_category: false, id: '23', name: 'Baby Clothing', icon: '👶', description: 'Onesies, rompers, sleepwear', color: 'bg-blue-500/10 text-blue-600', popular: false },
  {belongs_to_category: false, id: '24', name: 'Toys', icon: '🧸', description: 'Educational, plush, games', color: 'bg-red-500/10 text-red-600', popular: false },
  {belongs_to_category: false, id: '25', name: 'Nursery', icon: '🚼', description: 'Cribs, strollers, carriers', color: 'bg-green-500/10 text-green-600', popular: false },

  // Specialty
  {belongs_to_category: false, id: '26', name: 'Pet Supplies', icon: '🐕', description: 'Food, toys, accessories', color: 'bg-brown-500/10 text-brown-600', popular: false },
  {belongs_to_category: false, id: '27', name: 'Sports Equipment', icon: '⚽', description: 'Balls, rackets, gear', color: 'bg-orange-500/10 text-orange-600', popular: false },
  {belongs_to_category: false, id: '28', name: 'Art Supplies', icon: '🎨', description: 'Paints, brushes, canvas', color: 'bg-blue-500/10 text-blue-600', popular: false },
  {belongs_to_category: false, id: '29', name: 'Craft Supplies', icon: '🧵', description: 'Yarn, fabric, DIY kits', color: 'bg-pink-500/10 text-pink-600', popular: false },
  {belongs_to_category: false, id: '30', name: 'Local Specialties', icon: '🏺', description: 'Regional crafts, foods', color: 'bg-amber-500/10 text-amber-600', popular: false }
];

export const sellers: Seller[] = [
  {
    id: '1',
    name: 'Maya Johnson',
    avatar: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    category: '1',
    is_online: true,
    rating: 4.8,
    description: 'Fresh local produce, fruits and vegetables.',
  },
  {
    id: '2',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    category: '1',
    is_online: true,
    rating: 4.5,
    description: 'Homemade pastries and baked goods.',
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    avatar: '',
    category: '2',
    is_online: false,
    rating: 4.9,
    description: 'Fast delivery service within the city.',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: '',
    category: '3',
    is_online: true,
    rating: 4.7,
    description: 'Phone accessories and repairs.',
  },
  {
    id: '5',
    name: 'Emma Wilson',
    avatar: '',
    category: '4',
    is_online: false,
    rating: 4.6,
    description: 'Plumbing and electrical services.',
  },
];

// Mock data
export const mockAgents: DeliveryAgent[] = [
  {
    id: '1',
    name: 'Michael Rodriguez',
    avatar: 'https://plus.unsplash.com/premium_photo-1664303727151-4c345687204a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmlkZXJzfGVufDB8fDB8fHww',
    rating: 4.8,
    completedDeliveries: 243,
    distanceAway: '0.8 miles',
    estimatedArrival: '5-10 mins',
    transportType: 'Car',
    specialties: ['Furniture', 'Electronics']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: "https://images.unsplash.com/photo-1652856033313-26e48413243f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmlkZXJzfGVufDB8fDB8fHww",
    rating: 4.9,
    completedDeliveries: 378,
    distanceAway: '1.2 miles',
    estimatedArrival: '7-12 mins',
    transportType: 'Van',
    specialties: ['Heavy items', 'Multiple packages']
  },
  {
    id: '3',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1640785450406-3f26f2af2e40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHJpZGVyc3xlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.7,
    completedDeliveries: 156,
    distanceAway: '0.5 miles',
    estimatedArrival: '3-8 mins',
    transportType: 'Motorbike',
    specialties: ['Quick delivery', 'Small packages']
  }
];

// Mock transactions data
export const mockTransactions = [
  { id: 1, type: 'payment', amount: 52.50, description: 'Fresh vegetables', status: 'completed', date: new Date('2025-04-28') },
  { id: 2, type: 'escrow', amount: 120.00, description: 'Electronic goods', status: 'pending', date: new Date('2025-04-27') },
  { id: 3, type: 'payment', amount: 35.75, description: 'Local spices', status: 'completed', date: new Date('2025-04-25') },
];

// Mock calls data
export const mockCalls = [
  {
    id: 1,
    seller: 'Aisha M.',
    duration: '12:45',
    date: '2025-04-28',
    category: 'Vegetables',
    transaction: {
      status: "success",
      ref: "Ref_32948269832",
      amount: "200",
    }
  },
  {
    id: 2, seller: 'Kofi Electronics', duration: '08:20', date: '2025-04-26', category: 'Electronics', transaction: {
      status: "pending",
      ref: "Ref_32948269832",
      amount: "200",
    }
  },
  {
    id: 3, seller: 'Mama Spices', duration: '05:30', date: '2025-04-24', category: 'Food'
  },
];

export const mockProducts = [
  {
    id: "1",
    name: "Organic Fresh Tomatoes",
    description: "Farm-fresh organic tomatoes, locally grown with no pesticides. Perfect for salads and cooking.",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop",
    category: "Vegetables",
    in_stock: true,
    // likes: 24
  },
  {
    id: "2",
    name: "Artisan Bread Collection",
    description: "Handcrafted sourdough and whole grain breads baked fresh daily in our local bakery.",
    price: 8.50,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop",
    category: "Bakery",
    in_stock: true,
    // likes: 18
  },
  {
    id: "3",
    name: "Premium Coffee Beans",
    description: "Single-origin coffee beans from Ethiopian highlands. Rich flavor with chocolate undertones.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
    category: "Beverages",
    in_stock: false,
    // likes: 31
  },
  {
    id: "4",
    name: "Handmade Pottery Set",
    description: "Beautiful ceramic dinnerware set, hand-thrown and glazed by local artisans.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    category: "Crafts",
    in_stock: true,
    // likes: 12
  },
  {
    id: "5",
    name: "Local Honey Collection",
    description: "Pure wildflower honey harvested from our local apiaries. Raw and unfiltered.",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=200&fit=crop",
    category: "Food",
    in_stock: true,
    // likes: 28
  }
];
