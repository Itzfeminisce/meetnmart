import { SearchedMarket } from '@/types';
import { create } from 'zustand';


export interface ExpandedResult {
    type: string,
    id: "PRODUCT" | "FEED" | "SELLER" | "MARKET",
    count: number,
    key: string
  }

export interface SearchedMarketMeta {
    page?: number;
    per_page?: number;
    total_count?: number;
    total_pages?: number;
    has_next_page?: boolean;
    has_prev_page?: boolean;
    extended?: ExpandedResult
}


interface MarketSearchStore {
    data: SearchedMarket[];
    meta: SearchedMarketMeta;

    setData: (payload: SearchedMarket[]) => void;
    append: (payload: SearchedMarket[]) => void;
    setMeta: (meta: SearchedMarketMeta) => void;
    refetch: (meta: SearchedMarketMeta) => void;
    reset: () => void;
}


export const useMarketSearchStore = create<MarketSearchStore>((set) => ({
    data: [],
    meta: {
        page: 1,
    },

    refetch: (options: SearchedMarketMeta) => {
        set(state => ({
            ...state,
            meta: {
                ...state.meta,
                ...options
            }
        }))
    },
    setData: (data) => set({ data }),
    append: (payload) => set((state) => ({ data: [...state.data, ...payload] })),
    setMeta: (meta) => set({ meta }),
    reset: () => set({ data: [], meta: null }),
}));
