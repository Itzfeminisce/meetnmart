
import { Market, Category, Seller } from '../types';

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
    isOnline: true,
    rating: 4.8,
    description: 'Fresh local produce, fruits and vegetables.',
  },
  {
    id: '2',
    name: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    category: '1',
    isOnline: true,
    rating: 4.5,
    description: 'Homemade pastries and baked goods.',
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    avatar: '',
    category: '2',
    isOnline: false,
    rating: 4.9,
    description: 'Fast delivery service within the city.',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: '',
    category: '3',
    isOnline: true,
    rating: 4.7,
    description: 'Phone accessories and repairs.',
  },
  {
    id: '5',
    name: 'Emma Wilson',
    avatar: '',
    category: '4',
    isOnline: false,
    rating: 4.6,
    description: 'Plumbing and electrical services.',
  },
];
