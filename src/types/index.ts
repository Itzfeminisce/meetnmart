
export interface Market {
  id: string;
  name: string;
  location: string;
  distance?: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  category: string;
  isOnline: boolean;
  rating: number;
  description: string;
}

export type CallType = 'audio' | 'video';

export interface Call {
  id: string;
  sellerId: string;
  type: CallType;
  timestamp: Date;
  duration?: number;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isSeller: boolean;
}
