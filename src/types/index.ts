
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

  // Newly Added
  location?: string;
}

export type CallType = 'audio' | 'video';

export interface PaymentRequest {
  id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}

export interface Call {
  id: string;
  sellerId: string;
  type: CallType;
  timestamp: Date;
  duration?: number;
  paymentRequest?: PaymentRequest;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  isSeller: boolean;
}


// // Newly Added
// export interface Seller {
//   id: string;
//   name: string;
//   avatar?: string;
//   description: string;
//   rating?: number;
//   location: string;
// }

export interface DeliveryAgent {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  completedDeliveries: number;
  distanceAway: string;
  estimatedArrival: string;
  transportType: string;
  specialties?: string[];
  location?: string;
}

export interface DeliveryOrder {
  id: string;
  pickupLocation: string;
  deliveryAddress: string;
  goodsDescription?: string;
  priceOffer?: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  sellerId: string;
  deliveryAgentId?: string;
  buyerId: string;
  escrowAmount?: number;
  timestamp: string;
}