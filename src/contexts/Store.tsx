import { FeedItem, FeedOverviewStats } from '@/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type FeedInteractionType = 'bookmark' | 'share' | 'message' | 'call' | 'delivery' | 'comment';

export interface FeedStats {
  views: number;
  bookmarks: number;
  comments: number;
  messages: number;
  calls: number;
}

export interface FeedStoreState {
  feeds: FeedItem[];
  filteredFeeds: FeedItem[];
  activeCategoryId: string;
  bookmarkedFeeds: Set<string>;
  viewedFeeds: Set<string>;
  feedStats: Record<string, FeedStats>;
  getFeedStats: (id: string) => FeedStats;
  updateFeedStats: (id: string, updates: Partial<FeedStats>) => void;
  getFeedInteractions: (id: string) => FeedItem['interactions'] | undefined;
  getFeedInteractionsByType: (id: string, type: FeedInteractionType) => FeedItem['interactions']['items'];
}

type Actions = {
  setFeeds: (feeds: FeedItem[]) => void;
  addFeed: (feed: FeedItem) => void;
  removeFeed: (id: string) => void;
  toggleBookmark: (id: string) => void;
  incrementViews: (id: string) => void;
  incrementComments: (id: string) => void;
  addInteraction: (feedId: string, interaction: FeedItem['interactions']['items'][0]) => void;
  removeInteraction: (feedId: string, interactionIndex: number) => void;
  filterBy: (options?: {
    categoryId?: string;
    bookmarked?: boolean;
    viewed?: boolean;
    search?: string;
    type?: FeedItem['type'];
  }) => void;
};

const DEFAULT_STATS: FeedStats = { 
  views: 0, 
  bookmarks: 0, 
  comments: 0,
  messages: 0,
  calls: 0
};

interface InteractionStatsStore {
  data: FeedOverviewStats | null;
  setStats: (stats: FeedOverviewStats) => void;
  clearStats: () => void;
}

const defaultStats: FeedOverviewStats = {
  sellers_online: 0,
  buyer_needs: 0,
  delivery_pings: 0,
  trending_items: 0,
  urgent_requests: 0,
  saved_items: 0,
  active_chats: 0,
  views_today: 0,
};


export const useInteractionStatsStore = create<InteractionStatsStore>((set) => ({
  data: defaultStats,

  setStats: (stats) => set({ data: stats }),

  clearStats: () => set({ data: null }),
}));


export const useFeedStore = create<FeedStoreState & Actions>()(
  devtools((set, get) => ({
    feeds: [],
    filteredFeeds: [],
    activeCategoryId: 'all',
    bookmarkedFeeds: new Set(),
    viewedFeeds: new Set(),
    feedStats: {},

    getFeedStats: (id: string): FeedStats => {
      return get().feedStats[id] || DEFAULT_STATS;
    },


    getFeedInteractions: (id: string) => {
      const feed = get().feeds.find(f => f.id === id);
      return feed?.interactions;
    },

    getFeedInteractionsByType: (id: string, type: FeedInteractionType) => {
      const feed = get().feeds.find(f => f.id === id);
      return feed?.interactions.items.filter(item => item.type === type) || [];
    },

    updateFeedStats: (id: string, updates: Partial<FeedStats>) => {
      set((state) => ({
        feedStats: {
          ...state.feedStats,
          [id]: {
            ...(state.feedStats[id] || DEFAULT_STATS),
            ...updates,
          },
        },
      }));
    },

    setFeeds: (feeds) => {
      // Initialize feed stats for all feeds in one update
      const feedStats = feeds.reduce((acc, feed) => ({
        ...acc,
        [feed.id]: {
          ...DEFAULT_STATS,
          comments: feed.interactions.stats.commentCount,
          messages: feed.interactions.stats.messageCount,
          calls: feed.interactions.stats.callCount,
          views: feed.interactions.stats.viewCount,
          bookmarks: feed.interactions.stats.bookmarkCount,
        },
      }), {});

      set({
        feeds,
        filteredFeeds: feeds,
        feedStats,
      });
    },

    addFeed: (feed) => {
      set((state) => ({
        feeds: [feed, ...state.feeds],
        filteredFeeds: [feed, ...state.filteredFeeds],
        feedStats: {
          ...state.feedStats,
          [feed.id]: {
            ...DEFAULT_STATS,
            comments: feed.interactions.stats.commentCount,
            messages: feed.interactions.stats.messageCount,
            calls: feed.interactions.stats.callCount,
            views: feed.interactions.stats.viewCount,
            bookmarks: feed.interactions.stats.bookmarkCount,
          },
        },
      }));
    },

    removeFeed: (id) => {
      set((state) => {
        const { [id]: removed, ...remainingStats } = state.feedStats;
        return {
          feeds: state.feeds.filter((f) => f.id !== id),
          filteredFeeds: state.filteredFeeds.filter((f) => f.id !== id),
          feedStats: remainingStats,
        };
      });
    },

    toggleBookmark: (id) => {
      set((state) => {
        const bookmarked = new Set(state.bookmarkedFeeds);
        const isBookmarked = bookmarked.has(id);
        
        // Update bookmarked feeds
        isBookmarked ? bookmarked.delete(id) : bookmarked.add(id);

        // Update stats in a single operation
        const currentStats = state.feedStats[id] || DEFAULT_STATS;
        const newStats = {
          ...state.feedStats,
          [id]: {
            ...currentStats,
            bookmarks: currentStats.bookmarks + (isBookmarked ? -1 : 1),
          },
        };

        return {
          bookmarkedFeeds: bookmarked,
          feedStats: newStats,
        };
      });
    },

    incrementViews: (id) => {
      set((state) => {
        const currentStats = state.feedStats[id] || DEFAULT_STATS;
        const viewedFeeds = new Set(state.viewedFeeds).add(id);

        return {
          viewedFeeds,
          feedStats: {
            ...state.feedStats,
            [id]: {
              ...currentStats,
              views: currentStats.views + 1,
            },
          },
        };
      });
    },

    incrementComments: (id) => {
      set((state) => {
        const currentStats = state.feedStats[id] || DEFAULT_STATS;
        return {
          feedStats: {
            ...state.feedStats,
            [id]: {
              ...currentStats,
              comments: currentStats.comments + 1,
            },
          },
        };
      });
    },

    addInteraction: (feedId, interaction) => {
      set((state) => {
        const feed = state.feeds.find(f => f.id === feedId);
        if (!feed) return state;

        const isEqual = (a: any, b: any): boolean => {
            if (a === b) return true;
            if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => isEqual(a[key], b[key]));
          }

        // Check if interaction already exists using a more efficient comparison
        const existingIndex = feed.interactions.items.findIndex(item => 
            isEqual(item.type, "bookmark") &&  
            isEqual(item.author?.id, interaction.author?.id) &&  
            isEqual(item.metadata, interaction.metadata) 
        );

        let newItems;
        const stats = { ...feed.interactions.stats };
        
        // Update stats based on interaction type
        const DEFAULT_STATS = {
          commentCount: 0,
          messageCount: 0, 
          callCount: 0,
          viewCount: 0,
          bookmarkCount: 0
        };

        const updatedStats = { ...DEFAULT_STATS, ...stats };

        if (existingIndex !== -1) {
          // Remove existing interaction if it exists (toggle off)
          newItems = [...feed.interactions.items];
          newItems.splice(existingIndex, 1);
          updatedStats[`${interaction.type}Count`] = Math.max(0, (updatedStats[`${interaction.type}Count`] || 0) - 1);
        } else {
          // Add new interaction (toggle on)
          newItems = [interaction, ...feed.interactions.items];
          updatedStats[`${interaction.type}Count`] = (updatedStats[`${interaction.type}Count`] || 0) + 1;
        }

        Object.assign(stats, updatedStats);

        const updatedFeed = {
          ...feed,
          interactions: {
            items: newItems,
            stats
          }
        };

        return {
          feeds: state.feeds.map(f => f.id === feedId ? updatedFeed : f),
          filteredFeeds: state.filteredFeeds.map(f => f.id === feedId ? updatedFeed : f),
          feedStats: {
            ...state.feedStats,
            [feedId]: {
              ...state.feedStats[feedId],
              comments: stats.commentCount,
              messages: stats.messageCount,
              calls: stats.callCount,
              views: stats.viewCount,
              bookmarks: stats.bookmarkCount
            }
          }
        };
      });
    },

    removeInteraction: (feedId, interactionIndex) => {
      set((state) => {
        const feed = state.feeds.find(f => f.id === feedId);
        if (!feed) return state;

        const newItems = [...feed.interactions.items];
        const removedItem = newItems.splice(interactionIndex, 1)[0];
        const stats = { ...feed.interactions.stats };
        
        // Update stats based on removed interaction type
        if (removedItem.type === 'comment') {
          stats.commentCount = Math.max(0, stats.commentCount - 1);
        } else if (removedItem.type === 'message') {
          stats.messageCount = Math.max(0, stats.messageCount - 1);
        } else if (removedItem.type === 'call') {
          stats.callCount = Math.max(0, stats.callCount - 1);
        }

        const updatedFeed = {
          ...feed,
          interactions: {
            items: newItems,
            stats
          }
        };

        return {
          feeds: state.feeds.map(f => f.id === feedId ? updatedFeed : f),
          filteredFeeds: state.filteredFeeds.map(f => f.id === feedId ? updatedFeed : f),
          feedStats: {
            ...state.feedStats,
            [feedId]: {
              ...state.feedStats[feedId],
              comments: stats.commentCount,
              messages: stats.messageCount,
              calls: stats.callCount,
            }
          }
        };
      });
    },

    filterBy: ({ categoryId, bookmarked, viewed, search, type } = {}) => {
      set((state) => {
        let filtered = state.feeds;

        // Apply filters in order of most restrictive first
        if (search) {
          const term = search.toLowerCase();
          filtered = filtered.filter(
            (f) =>
              f.title.toLowerCase().includes(term) ||
              f.content.toLowerCase().includes(term) || 
              f.category.name.toLowerCase().includes(term) ||
              f.urgency.toLowerCase().includes(term) ||
              f.location.toLowerCase().includes(term)
          );
        }

        if (type) {
          filtered = filtered.filter((f) => f.type === type);
        }

        if (categoryId && categoryId !== 'all') {
          filtered = filtered.filter((f) => f.category.id === categoryId);
        }

        if (bookmarked !== undefined) {
          filtered = filtered.filter((f) =>
            bookmarked
              ? state.bookmarkedFeeds.has(f.id)
              : !state.bookmarkedFeeds.has(f.id)
          );
        }

        if (viewed !== undefined) {
          filtered = filtered.filter((f) =>
            viewed ? state.viewedFeeds.has(f.id) : !state.viewedFeeds.has(f.id)
          );
        }

        return {
          filteredFeeds: filtered,
          activeCategoryId: categoryId || state.activeCategoryId,
        };
      });
    },
  }))
);
