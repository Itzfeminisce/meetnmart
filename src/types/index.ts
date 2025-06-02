export interface Market {
  id: string;
  name: string;
  location: string;
  distance?: string;
  image?: string;
}

export type MarketWithAnalytics = {
  id: string;
  place_id: string;
  name: string;
  address: string;
  location: string;
  user_count: number | null;
  created_at: string;
  updated_at: string;
  impressions: number | null;
  recent_count: number;
  last_24hrs: boolean;
  impressions_per_user: number;
  age_hours: number;
  updated_recently: boolean;
  belongs_to_market: boolean;
};

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  popular?: boolean
  belongs_to_category: boolean;
}

export interface SellerMarketAndCategory {
  "markets": (Pick<MarketWithAnalytics, "id" | "name" | "address" | "place_id"> & { impressions: number })[];
  "categories": Pick<Category, "id" | "name">[],
  "total_markets": number,
  "total_categories": number
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  is_online: boolean;
  rating: number;

  category: string;
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

export interface WalletData {
  balance: number;
  escrowed_balance: number;
}

export interface LiveKitRoom {
  id: string;
  name: string;
  created_at: string;
  participants: number;
  active: boolean;
}

export interface CallRequest {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  room_name?: string;
  created_at: string;
}

export interface CallSession {
  id: string;
  room_name: string;
  token: string;
  participants: string[];
}


export interface Transaction {
  id: string,
  type: string,
  amount: number,
  description: string,
  status: string,
  date: Date
}

export type ExpandedTransaction = {
  call_session_id: string;
  duration: string; // ISO 8601 duration string or custom format
  started_at: string; // ISO date string
  ended_at: string;   // ISO date string

  seller_id: string;
  seller_name: string;
  seller_avatar: string;

  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string;

  agent_id: string | null;
  agent_name: string | null;
  agent_avatar: string | null;

  transaction_id: string;
  amount: number;
  status: 'held' | 'completed' | 'cancelled' | string; // Expand as needed
  reference: string;

  description: {
    feedback?: string;
    metadata: {
      itemTitle: string;
      itemDescription: string;
    };
  }
  transaction_created_at: string; // ISO date string
};



export type ProductCRUDAction = "create" | "read" | "update" | "delete";

export type ProductCrudData<A extends ProductCRUDAction> =
  A extends "create" ? Omit<Product, "id"> :
  A extends "read" ? never :
  A extends "update" ? Required<Pick<Product, "id">> & Partial<Omit<Product, "id">> :
  A extends "delete" ? Pick<Product, "id"> :
  never;

export type ProductCrud<A extends ProductCRUDAction> = {
  action: A;
  data: ProductCrudData<A>;
};

export interface Product {
  id: string; // UUID
  name: string;
  description: string;
  price: number;
  image: string;
  category: string; // UUID
  in_stock: boolean;
  seller_id: string; // UUID
  created_at: Date;
}

export interface Feedback {
  id: string; // UUID
  feedback_text: string;
  rating: number;
  call_duration: string; // ISO 8601 duration format e.g. "00:06:00"
  created_at: string; // ISO timestamp
  buyer_id: string;
  buyer_name: string;
  buyer_avatar: string;
  seller_id: string;
  seller_name: string;
  seller_avatar: string;
}


export interface WeeklyStatusChart {
  week: string; // e.g., "2025-W20"
  status: 'released' | 'disputed' | 'rejected' | 'held'; // add more if needed
  occurrence: number;
}

export interface StatsOverview {
  calls: number;
  charts: WeeklyStatusChart[];
  feedbacks: number;
  this_week: number;
  transactions: number;
}


// TypeScript interfaces for get_nearby_sellers RPC response

export interface SellerStatus {
  is_online: boolean;
  is_reachable: boolean;
  is_premium: boolean;
  is_verified: boolean;
  description: string;
}


export type NearbySellerProduct  = Omit<Product, "seller_id">;

export interface NearbySellerProductProductsResponse {
  items: NearbySellerProduct[];
  total_count: number;
  has_more: boolean;
}

export interface NearbySellerProductReview {
  rating: number;
  feedback_text: string | null;
  created_at: string; // ISO datetime string
}

export interface NearbySellerProductReviewsSummary {
  total_reviews: number;
  average_rating: number;
  recent_reviews: NearbySellerProductReview[];
}

export interface NearbySellerResponse {
  seller_id: string;
  name: string;
  avatar: string | null;
  distance_km: number;
  seller_status: SellerStatus;
  products: NearbySellerProductProductsResponse;
  reviews_summary: NearbySellerProductReviewsSummary;
  avg_response_time_minutes: number;
}


export interface WhispaResponse {
  intent: string;
  entities: Record<string, any>;
  response: string;
  confidence: number;
  actions: Array<{
    name: string;
    params: Record<string, any>;
    priority: number;
  }>;
  data_requests: any[];
  session_id: string;
  user_guidance: {
    suggestions: string[];
    quick_actions: string[];
  };
}