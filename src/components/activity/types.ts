// types/activity.ts
export interface ActivityItem {
    id: string;
    type: 'feedback' | 'order' | 'system' | 'promotion' | 'achievement' | 'community';
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
    metadata?: {
      rating?: number;
      amount?: number;
      currency?: string;
      orderId?: string;
      userId?: string;
      userName?: string;
      userAvatar?: string;
      productName?: string;
      productImage?: string;
      callDuration?: number;
      badges?: string[];
      link?: string;
    };
  }
  
  export interface ActivityStats {
    totalUnread: number;
    todayCount: number;
    weekCount: number;
    monthCount: number;
  }
  
  // data/sampleActivity.ts
  export const sampleActivityData: ActivityItem[] = [
    {
      id: '1',
      type: 'feedback',
      title: 'New 5-Star Review',
      description: 'Sarah Chen left an amazing review for your Premium Consultation package',
      timestamp: '2024-06-16T10:30:00Z',
      isRead: false,
      priority: 'high',
      metadata: {
        rating: 5,
        userName: 'Sarah Chen',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
        productName: 'Premium Business Consultation',
        callDuration: 3600,
      }
    },
    {
      id: '2',
      type: 'order',
      title: 'New Order Received',
      description: 'Marcus Rodriguez purchased your Digital Marketing Strategy package',
      timestamp: '2024-06-16T09:15:00Z',
      isRead: false,
      priority: 'high',
      metadata: {
        amount: 299.99,
        currency: 'USD',
        orderId: 'ORD-2024-001234',
        userName: 'Marcus Rodriguez',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
        productName: 'Digital Marketing Strategy',
        productImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&h=80&fit=crop',
      }
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Milestone Achieved!',
      description: 'Congratulations! You\'ve completed 100 successful consultations',
      timestamp: '2024-06-16T08:45:00Z',
      isRead: false,
      priority: 'medium',
      metadata: {
        badges: ['100 Consultations', 'Expert Level'],
      }
    },
    {
      id: '4',
      type: 'system',
      title: 'Platform Update',
      description: 'New analytics dashboard features are now available in your seller portal',
      timestamp: '2024-06-16T07:00:00Z',
      isRead: true,
      priority: 'medium',
      metadata: {
        link: '/dashboard/analytics',
      }
    },
    {
      id: '5',
      type: 'feedback',
      title: 'Feedback Received',
      description: 'Jennifer Park shared feedback about your consultation session',
      timestamp: '2024-06-15T16:20:00Z',
      isRead: true,
      priority: 'medium',
      metadata: {
        rating: 4,
        userName: 'Jennifer Park',
        userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
        productName: 'Career Coaching Session',
        callDuration: 2700,
      }
    },
    {
      id: '6',
      type: 'promotion',
      title: 'Featured Seller Spotlight',
      description: 'Your profile has been selected for this week\'s featured seller spotlight',
      timestamp: '2024-06-15T14:30:00Z',
      isRead: true,
      priority: 'high',
      metadata: {
        badges: ['Featured Seller'],
      }
    },
    {
      id: '7',
      type: 'order',
      title: 'Order Completed',
      description: 'Elena Vasquez marked your Brand Strategy consultation as completed',
      timestamp: '2024-06-15T12:10:00Z',
      isRead: true,
      priority: 'low',
      metadata: {
        amount: 149.99,
        currency: 'USD',
        orderId: 'ORD-2024-001233',
        userName: 'Elena Vasquez',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=face',
        productName: 'Brand Strategy Consultation',
      }
    },
    {
      id: '8',
      type: 'community',
      title: 'New Follower',
      description: 'Alex Thompson started following your profile and services',
      timestamp: '2024-06-15T10:45:00Z',
      isRead: true,
      priority: 'low',
      metadata: {
        userName: 'Alex Thompson',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
      }
    },
    {
      id: '9',
      type: 'system',
      title: 'Payment Processed',
      description: 'Your weekly earnings of $1,247.50 have been processed to your account',
      timestamp: '2024-06-14T18:00:00Z',
      isRead: true,
      priority: 'medium',
      metadata: {
        amount: 1247.50,
        currency: 'USD',
      }
    },
    {
      id: '10',
      type: 'feedback',
      title: 'Review Update',
      description: 'David Kim updated his review and increased rating to 5 stars',
      timestamp: '2024-06-14T15:30:00Z',
      isRead: true,
      priority: 'medium',
      metadata: {
        rating: 5,
        userName: 'David Kim',
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face',
        productName: 'Business Strategy Session',
      }
    }
  ];
  
  export const sampleStats: ActivityStats = {
    totalUnread: 3,
    todayCount: 4,
    weekCount: 8,
    monthCount: 25,
  };