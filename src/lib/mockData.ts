
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
  { id: '1', name: 'Food & Produce', icon: '🍎', color: 'market-orange' },
  { id: '2', name: 'Delivery Services', icon: '🚚', color: 'market-blue' },
  { id: '3', name: 'Gadgets & Tech', icon: '📱', color: 'market-green' },
  { id: '4', name: 'Home Services', icon: '🔧', color: 'market-purple' },
  { id: '5', name: 'Fashion', icon: '👕', color: 'market-pink' },
  { id: '6', name: 'Transportation', icon: '🏍️', color: 'market-orange' },
  { id: '7', name: 'Health & Beauty', icon: '💄', color: 'market-blue' },
  { id: '8', name: 'Art & Crafts', icon: '🎨', color: 'market-green' },
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
