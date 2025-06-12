import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Category, ExpandedTransaction, Feedback, FeedInteractionItem, FeedItem, FeedItemAuthor, FeedOverviewStats, MarketWithAnalytics, NearbySellerResponse, Product, ProductCrud, SellerMarketAndCategory, WhispaResponse } from '@/types';
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryClient,
  QueryKey,
  useQueryClient
} from '@tanstack/react-query';
import { StatsOverview } from '../types';
import { MarketResult } from '@/services/marketsService';
import { useAxios } from '@/lib/axiosUtils';
import { useFeedStore, useInteractionStatsStore } from '@/contexts/Store';
import { debounce, useDebounce } from './use-debounce';
import { useMemo } from 'react';

const axiosUtil = useAxios()

export type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin' | null;
export type UserProfile = Database['public']['Tables']['profiles']['Row']
export type WalletInfo = Database['public']['Tables']['wallets']['Row']
export type EscrowTransaction = Database['public']['Tables']['escrow_transactions']['Row']
export type UsersByRole = Database['public']['Functions']['get_users_by_role']['Returns'][number]
export type WalletSummary = Database['public']['Functions']['get_wallet_summary']['Returns']
export type Transaction = Database['public']['Functions']['get_call_sessions_with_transactions']


// Cache time constants for different data types
const CACHE_TIMES = {
  DEFAULT: 1 * 60 * 1000,
  // Static/semi-static data - cache for longer periods
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  USER_ROLE: 15 * 60 * 1000, // 15 minutes
  USER_LISTS: 5 * 60 * 1000, // 5 minutes (sellers, buyers, etc.)
  MARKET_VISIT_LISTS: 60 * 1000, // 5 minutes (sellers, buyers, etc.)

  // Dynamic data - shorter cache times
  WALLET_DATA: 2 * 60 * 1000, // 2 minutes
  TRANSACTIONS: 1 * 60 * 1000, // 1 minute
  FEEDBACKS: 3 * 60 * 1000, // 3 minutes
  MARKETS: 1 * 60 * 1000, // 1 minutes

  // Real-time data - very short cache
  CURRENT_USER: 30 * 1000, // 30 seconds
  WALLET_SUMMARY: 30 * 1000, // 30 seconds
} as const;

// Create a query client with optimized default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors (auth issues)
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 2; // Only retry twice
      },
      staleTime: CACHE_TIMES.USER_PROFILE, // Default stale time
      gcTime: 30 * 60 * 1000, // Garbage collect after 30 minutes
      // Enable background refetching for better UX
      refetchOnMount: 'always',
      refetchInterval: false, // We'll set specific intervals where needed
    },
    mutations: {
      retry: 1, // Only retry mutations once
    },
  },
});

// Cache key factories for consistent key generation
export const cacheKeys = {
  // Auth related
  currentUser: () => ['auth', 'current_user'],

  // User related
  userRole: (userId: string) => ['user', userId, 'role'] as const,
  userProfile: (userId: string) => ['user', userId, 'profile'] as const,
  userWallet: (userId: string) => ['user', userId, 'wallet'] as const,
  completeProfile: (userId: string) => ['user', userId, 'complete'] as const,

  // Lists
  usersByRole: (role: string) => ['users', 'by_role', role] as const,
  markets: (params?: any) => ['markets', params] as const,
  categories: (params?: any) => ['categories', params] as const,
  seller_market_categories: (params?: any) => ['seller_market_categories', params] as const,
  sellers: () => ['users', 'sellers'] as const,
  buyers: () => ['users', 'buyers'] as const,
  moderators: () => ['users', 'moderators'] as const,
  admins: () => ['users', 'admins'] as const,

  // Transactions and financial
  transactions: (params: any) => ['transactions', params] as const,
  walletSummary: () => ['wallet', 'summary'] as const,

  // Feedback
  feedbacks: (params?: any) => ['feedbacks', params] as const,
} as const;

/**
 * Enhanced useFetch with automatic cache optimization
 */
export function useFetch<
  TData = unknown,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey
>(
  queryKey: TQueryKey,
  fetchFn: () => Promise<TData>,
  queryOptions?: Omit<UseQueryOptions<TData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'> & {
    cacheTime?: keyof typeof CACHE_TIMES;
  }
) {
  const { cacheTime, ...restOptions } = queryOptions || {};

  return useQuery<TData, TError, TData, TQueryKey>({
    queryKey,
    queryFn: fetchFn,
    staleTime: cacheTime ? CACHE_TIMES[cacheTime] : undefined,
    ...restOptions,
  });
}

/**
 * Enhanced useMutate with automatic cache invalidation patterns
 */
export function useMutate<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  mutateFn: (variables: TVariables) => Promise<TData>,
  mutationOptions?: Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
    invalidatePatterns?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { invalidatePatterns, ...restOptions } = mutationOptions || {};

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn: mutateFn,
    onSuccess: async (data, variables, context) => {
      // Auto-invalidate based on patterns
      if (invalidatePatterns) {
        await Promise.all(
          invalidatePatterns.map(pattern =>
            queryClient.invalidateQueries({ queryKey: pattern })
          )
        );
      }

      // Call original onSuccess if provided
      if (restOptions.onSuccess) {
        await restOptions.onSuccess(data, variables, context);
      }
    },
    ...restOptions,
  });
}

// ===================
// AUTH HOOKS
// ===================

export const useToggleOnlineStatus = () => {
  return useMutate(
    async ({ userId, status }: { userId: string; status: boolean }) => {
      console.log({ status, userId });

      const { data, error } = await supabase.from("profiles").update({ is_reachable: status }).eq("id", userId).select("is_reachable").single();
      if (error) throw error;

      return data.is_reachable
    }
  );
};
export const useSignInWithPhone = () => {
  return useMutate(
    async ({ phoneNumber }: { phoneNumber: string }) => {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
    },
    {
      invalidatePatterns: [cacheKeys.currentUser()],
    }
  );
};

export const useSignOut = () => {
  return useMutate(
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // Clear all cache on sign out
        await queryClient.clear();
      },
    }
  );
};

export const useVerifyOTP = () => {
  return useMutate(
    async ({ phoneNumber, token }: { phoneNumber: string; token: string }) => {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token,
        type: 'sms',
      });
      if (error) throw error;
    },
    {
      invalidatePatterns: [cacheKeys.currentUser()],
    }
  );
};

export const useCurrentUser = () => {
  return useFetch(
    cacheKeys.currentUser(),
    async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    {
      cacheTime: 'CURRENT_USER',
      // Refetch every 5 minutes to keep auth state fresh
      refetchInterval: 5 * 60 * 1000,
    }
  );
};

export const useResetPassword = () => {
  return useMutate(async ({ email }: { email: string }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  });
};

export const useUpdatePassword = () => {
  return useMutate(async ({ password }: { password: string }) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  });
};

// ===================
// USER MANAGEMENT HOOKS
// ===================

export const useUpdateUserRole = () => {
  return useMutate(
    async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role
        });
      if (error) throw error;
      return { userId, role };
    },
    {
      onSuccess: async ({ userId, role }) => {
        // Update cache immediately for better UX
        queryClient.setQueryData(cacheKeys.userRole(userId), role);

        // Invalidate related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cacheKeys.completeProfile(userId) }),
          queryClient.invalidateQueries({ queryKey: ['users', 'by_role'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'sellers'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'buyers'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'moderators'] }),
          queryClient.invalidateQueries({ queryKey: ['users', 'admins'] }),
        ]);
      },
    }
  );
};


export const useUpdateProfileLocation = () => {
  return useMutate(
    async ({ update }: {
      update: Partial<{ lng: number; lat: number }>
    }) => {
      await axiosUtil.Patch("/users/location", update)
    },
    {
      onSuccess: async () => {
        // Invalidate profile queries to trigger refetch
        await queryClient.invalidateQueries({ queryKey: cacheKeys.currentUser() });
      }
    }
  );
};

export const useUpdateProfile = () => {
  return useMutate(
    async ({ update }: {
      update: Partial<{ name: string; category: string; description: string; lng: number; lat: number }>
    }) => {
      await axiosUtil.Patch("/users/profile", update)
    },
    {
      onSuccess: async (_, { update }) => {
        // Optimistically update the cache
        queryClient.setQueryData(
          cacheKeys.userProfile(JSON.stringify(update)),
          (oldData: any) => oldData ? { ...oldData, ...update } : undefined
        );

        // Invalidate related queries
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cacheKeys.completeProfile(JSON.stringify(update)) }),
          queryClient.invalidateQueries({ queryKey: ['users', 'by_role'] }),
        ]);
      },
    }
  );
};

export const useSubmitFeedback = () => {
  return useMutate(
    async ({
      p_seller_id,
      rating,
      callDuration,
      feedback
    }: {
      p_seller_id: string;
      rating: number;
      feedback: string;
      callDuration: string
    }) => {
      const { error } = await supabase.rpc('submit_call_feedback', {
        p_seller_id: p_seller_id,
        p_rating: rating,
        p_feedback_text: feedback,
        p_call_duration: callDuration
      });
      if (error) throw error;
      return { p_seller_id };
    },
    {
      onSuccess: async ({ p_seller_id }) => {
        // Invalidate feedback and user data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cacheKeys.feedbacks() }),
          queryClient.invalidateQueries({ queryKey: cacheKeys.userProfile(p_seller_id) }),
          queryClient.invalidateQueries({ queryKey: cacheKeys.completeProfile(p_seller_id) }),
          queryClient.invalidateQueries({ queryKey: ['users', 'by_role'] }),
        ]);
      },
    }
  );
};


export const useCreateProduct = () => {
  return useMutate(
    async (payload: Omit<ProductCrud<"create">, "action">) => {
      const { data, error } = await supabase.rpc('product_crud', {
        action: "create",
        data: payload.data
      });
      if (error) throw error;
      return data
    }, {
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: ['products']
      })
    }
  }
  );
};

export const useUpdateProduct = () => {
  return useMutate(
    async (payload: Omit<ProductCrud<"update">, "action">): Promise<Product> => {
      const { data, error } = await supabase.rpc('product_crud', {
        action: "update",
        data: payload.data
      });
      if (error) throw error;
      return data
    }, {
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({ queryKey: ["products", variables.data.id] })
    },
  }
  );
};
export const useDeleteProduct = () => {
  return useMutate(
    async (payload: Omit<ProductCrud<"delete">, "action">): Promise<Product> => {
      const { data, error } = await supabase.rpc('product_crud', {
        action: "delete",
        data: payload.data
      });
      if (error) throw error;
      return data
    }, {
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  }
  );
};


export const useGetProducts = () => {
  return useFetch(
    ["products"],
    async (): Promise<Product[]> => {
      const { data, error } = await supabase.rpc('product_crud', {
        action: "read",
        data: []
      });
      if (error) throw error;
      return data || []
    },
    {
      cacheTime: 'DEFAULT',
    }
  );
};

// ===================
// USER DATA FETCHING HOOKS
// ===================

export const useGetUserRole = ({
  userId,
  enabled = true
}: {
  userId: string;
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.userRole(userId),
    async () => {
      const { data, error } = await supabase
        .rpc('get_user_role', { uid: userId });
      if (error) throw error;
      return data;
    },
    {
      enabled: enabled && !!userId,
      cacheTime: 'USER_ROLE',
    }
  );
};

export const useGetProfileData = ({
  userId,
  enabled = true
}: {
  userId: string;
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.userProfile(userId),
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    {
      enabled: enabled && !!userId,
      cacheTime: 'USER_PROFILE',
    }
  );
};

export const useGetWalletData = ({
  userId,
  enabled = true
}: {
  userId: string;
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.userWallet(userId),
    async () => {
      const { data, error } = await supabase
        .rpc('get_user_wallet', { uid: userId });
      if (error) throw error;
      return data;
    },
    {
      enabled: enabled && !!userId,
      cacheTime: 'WALLET_DATA',
      // Wallet data changes frequently, refetch on focus
      refetchOnWindowFocus: true,
    }
  );
};

export const useGetCompleteUserProfile = ({
  userId
}: {
  userId: string | undefined
}) => {
  return useFetch(
    cacheKeys.completeProfile(userId!),
    async () => {
      if (!userId) throw new Error("User ID is required");

      const [profileResponse, roleResponse, walletResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.rpc('get_user_role', { uid: userId }),
        supabase.rpc('get_user_wallet', { uid: userId })
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (roleResponse.error) throw roleResponse.error;
      if (walletResponse.error) throw walletResponse.error;

      const result = {
        profile: profileResponse.data,
        role: roleResponse.data,
        wallet: walletResponse.data
      };

      // Cache individual pieces for future use
      queryClient.setQueryData(cacheKeys.userProfile(userId), result.profile);
      queryClient.setQueryData(cacheKeys.userRole(userId), result.role);
      queryClient.setQueryData(cacheKeys.userWallet(userId), result.wallet);

      return result;
    },
    {
      enabled: !!userId,
      cacheTime: 'USER_PROFILE',
    }
  );
};

export const useUserHasRole = ({
  userId,
  role
}: {
  userId: string | undefined;
  role: UserRole
}) => {
  const { data: userRole, isLoading } = useGetUserRole({
    userId: userId!,
    enabled: !!userId
  });

  return {
    hasRole: userRole === role,
    userRole,
    isLoading: isLoading && !!userId
  };
};

// ===================
// FINANCIAL DATA HOOKS
// ===================

export const useGetWalletSummary = ({
  enabled = true
}: {
  enabled?: boolean
}) => {
  return useFetch(
    cacheKeys.walletSummary(),
    async () => {
      const { data, error } = await supabase.rpc('get_wallet_summary');
      if (error) throw error;
      return data;
    },
    {
      enabled,
      cacheTime: 'WALLET_SUMMARY',
      refetchOnWindowFocus: true,
      // Auto-refresh every 30 seconds for admin dashboards
      refetchInterval: 30 * 1000,
    }
  );
};

export const useGetTransactions = ({
  params
}: {
  params: Transaction['Args']
}) => {
  return useFetch<ExpandedTransaction[]>(
    cacheKeys.transactions(params),
    async () => {
      const { data, error } = await supabase
        .rpc('get_call_sessions_with_transactions', params);
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'TRANSACTIONS',
      refetchOnWindowFocus: true,
    }
  );
};

// ===================
// FEEDBACK HOOKS
// ===================
export interface GetFeedbacksParams {
  p_limit?: number; // default: 20
  p_offset?: number; // default: 0
  p_seller_id?: string; // UUID
  p_buyer_id?: string; // UUID
  p_search?: string; // optional search text
  p_start_date?: string; // ISO timestamp string
  p_end_date?: string; // ISO timestamp string
  p_min_rating?: number; // default: 1
}

export const useGetUserFeedbacks = (params?: GetFeedbacksParams) => {
  return useFetch<Feedback[]>(
    cacheKeys.feedbacks(params),
    async () => {
      const { data, error } = await supabase.rpc("get_feedbacks", params);
      if (error) throw error;
      return data;
    },
    {
      enabled: !!params,
      cacheTime: 'DEFAULT',
    }
  );
};

// ===================
// USER LIST HOOKS
// ===================

export const useGetSellers = () => {
  return useFetch(
    cacheKeys.sellers(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "seller" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};
export const useGetNearbySellers = (params: Record<string, string>) => {
  return useFetch(
    ["nearby_sellers", params],
    async () => {
      const sellers = await axiosUtil.Get<{ data: NearbySellerResponse[] }>("/markets/get-nearby-sellers", { params }).then(res => res.data)
      return sellers;
    },
    {
      staleTime: 60000, // 1 minute
      cacheTime: 'DEFAULT',
    }
  );
};

export const useGetBuyers = () => {
  return useFetch(
    cacheKeys.buyers(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "buyer" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetUsersByRole = ({
  role
}: {
  role: Exclude<UserRole, null>
}) => {
  return useFetch(
    cacheKeys.usersByRole(role),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: role });
      if (error) throw error;
      return data;
    },
    {
      enabled: !!role,
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetModerators = () => {
  return useFetch(
    cacheKeys.moderators(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "moderator" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetAdmins = () => {
  return useFetch(
    cacheKeys.admins(),
    async () => {
      const { data, error } = await supabase
        .rpc('get_users_by_role', { target_role: "admin" });
      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'USER_LISTS',
    }
  );
};

export const useGetMarketRecentVisits = ({ limit = 5, userId = null }: { limit?: number; userId?: string } = {}) => {
  return useFetch(
    cacheKeys.markets({ limit, userId }),
    async () => {

      const query = supabase
        .from('recent_visits')
        .select('*')

      if (userId) {
        query.eq('user_id', userId)
      }
      const { data, error } = await query
        .order('visited_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      const recentVisits = data.map(visit => ({
        id: visit.id,
        name: visit.market_name,
        address: visit.market_address,
        place_id: visit.place_id,
      }));

      return recentVisits;
    },
    {
      cacheTime: 'MARKET_VISIT_LISTS',
    }
  );
};


export const useGetMarkets = ({ userId, limit = 5 }: { userId?: string; limit?: number; } = {}) => {
  return useFetch(
    ["markets"],
    async () => {

      const queryParams = new URLSearchParams();
      if (userId) queryParams.append('userId', userId);
      queryParams.append('limit', limit.toString());

      const results = await axiosUtil.Get<{ data: MarketWithAnalytics[] }>(`/markets/get-available-markets?${queryParams.toString()}`).then(response => response.data)

      // const { data, error } = await supabase.rpc('get_available_markets', {
      //   p_seller_id: userId,
      //   p_limit: 50
      // });
      // if (error) throw error;
      return results;
    },
    {
      cacheTime: 'MARKETS',
    }
  );
};

type GetNearbyMarketsBaseSearchParams = {
  page?: number;
  pageSize?: number;
  query?: string;
};

type GetNearbyMarketsNearbySearchParams = {
  nearby: true;
  lat: number;
  lng: number;
} & GetNearbyMarketsBaseSearchParams;

type GetNearbyMarketsGlobalSearchParams = {
  nearby: false;
  query: string;
} & GetNearbyMarketsBaseSearchParams;

export type GetNearbyMarketsSearchParamsProps = GetNearbyMarketsNearbySearchParams | GetNearbyMarketsGlobalSearchParams;

function normalizeSearchParams(params: Partial<GetNearbyMarketsSearchParamsProps>): GetNearbyMarketsSearchParamsProps {
  return {
    nearby: params.nearby ?? false,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    ...(params.nearby ? { lat: params.lat!, lng: params.lng! } : { query: params.query ?? '' }),
  } as GetNearbyMarketsSearchParamsProps;
}


export const useGetNearbyMarkets = (
  params?: GetNearbyMarketsSearchParamsProps,
  enabled = false,
  locationUpdateCount = 0
) => {
  return useFetch(
    ["nearby_markets", params, locationUpdateCount],
    async () => {
      const response = await axiosUtil.Post<{ data: { markets: MarketWithAnalytics[], nextPageTokens: string } }>("/search", normalizeSearchParams(params)).then(it => it.data)
      return response;
    },
    {
      enabled,
      cacheTime: 'DEFAULT',
      throwOnError() {
        return true
      }
    }
  );
};



export const useGetCategories = ({ userId = undefined, limit = 20 }: { userId?: string; limit?: number; } = {}) => {
  return useFetch<Category[]>(
    ["categories"],
    async () => {
      const { data, error } = await supabase.rpc('get_market_categories', {
        p_seller_id: userId,
        p_limit: limit
      });

      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'DEFAULT',
    }
  );
};
export const useGetFeeds = ({ userId = undefined, limit = 20 }: { userId?: string; limit?: number; p_offset?: number } = {}) => {
  const store = useFeedStore()
  return useFetch<FeedItem[]>(
    ["feeds"],
    async () => {
      const { data, error } = await supabase.rpc('get_feeds', {
        p_created_by: null,
        p_limit: limit,
      });

      if (error) throw error;

      store.setFeeds(data)
      return data;
    },
    {
      cacheTime: 'DEFAULT',
    }
  );
};

interface FeedInteration extends Omit<FeedInteractionItem, "created_at"> {
  feed_id: string;
}

export const useCreateFeedInteraction = () => {
  const queryClient = useQueryClient()
  const store = useFeedStore();
  return useMutation<FeedInteration, Error, FeedInteration>({
    mutationFn: async (options) => {
      store.addInteraction(options.feed_id, { ...options, created_at: new Date().toLocaleDateString() });
      queryClient.invalidateQueries({queryKey: ["feed_interaction_stats"]})
      const { data } = await axiosUtil.Post<{ data: any }>("/whispa/feeds/interactions", options);
      return data;
    }
  });
};


export const useGetSellerMarketAndCategories = ({ seller, ...filters }: {
  seller: string;
  market_sort_col?: "impressions";
  market_sort_dir?: "asc" | "desc";
  market_limit?: number;
  category_sort_col?: "created_at";
  category_sort_dir?: "asc" | "desc";
  category_limit?: number;
}) => {
  return useFetch<SellerMarketAndCategory>(
    ["markets_categories"],
    async () => {
      const { data, error } = await supabase
        .rpc('get_seller_markets_and_categories', {
          seller,
          market_sort_col: 'impressions',
          market_sort_dir: 'desc',
          market_limit: 2,
          category_sort_col: 'created_at',
          category_sort_dir: 'asc',
          category_limit: 2
        });

      if (error) throw error;
      return data;
    },
    {
      cacheTime: 'DEFAULT',
    }
  );
};
export const useGetFeedInteractionStats = () => {
  const statsStore = useInteractionStatsStore()
  return useFetch<FeedOverviewStats>(
    ["feed_interaction_stats"],
    async () => {
      const { data, error } = await supabase.rpc('get_feed_interaction_stats');

      if (error) throw error;

      statsStore.setStats(data)

      return data;
    },
    {
      cacheTime: 'DEFAULT',
    }
  );
};
export const useGetSellerStats = ({ userId }: { userId: string }) => {
  return useFetch<StatsOverview>(
    ["seller_stats"],
    async () => {
      const { data, error } = await supabase
        .rpc('get_seller_stats', {
          p_seller_id: userId
        });

      if (error) throw error;
      return data;
    },
    {
      enabled: !!userId,
      cacheTime: 'DEFAULT',
    }
  );
};
export const useSellerCatrgoryMutation = () => {
  return useMutate(
    async ({ sellerId, payload }: {
      sellerId: string; payload: {
        selectedMarkets: string[];
        selectedCategories: string[];
      }
    }) => {
      const { selectedMarkets, selectedCategories } = payload;

      type InsertRecord = {
        seller_id: string;
        market_id: string;
        category_id: string | null;
      };
      
      const recordsToInsert: InsertRecord[] = [];
      
      if (selectedMarkets.length && selectedCategories.length) {
        // Full combinations
        selectedMarkets.forEach(marketId => {
          selectedCategories.forEach(categoryId => {
            recordsToInsert.push({ seller_id: sellerId, market_id: marketId, category_id: categoryId });
          });
        });
      } else if (selectedMarkets.length) {
        // Market-only inserts
        selectedMarkets.forEach(marketId => {
          recordsToInsert.push({ seller_id: sellerId, market_id: marketId, category_id: null });
        });
      }
      
      // Filter out duplicates before insert (optional but safe)
      const uniqueRecords = Array.from(
        new Map(recordsToInsert.map(r => [`${r.market_id}-${r.category_id}`, r])).values()
      );

      // Insert with upsert to avoid duplicates errors
      const { data, error } = await supabase
        .from('seller_market_category')
        .upsert(uniqueRecords);

      if (error) {
        console.error('Error inserting seller market categories:', error);
        throw error;
      }
      return data;
    },
    {
      async onSuccess() {
        await queryClient.invalidateQueries({ queryKey: ['markets'] })
        await queryClient.invalidateQueries({ queryKey: ['category'] })
        await queryClient.invalidateQueries({ queryKey: ['markets_categories'] })
      }
    }
  );
};

export const useDeleteMarketSelection = () => {
  return useMutate(async ({ userId, selectionId, criteria }: { userId: string; selectionId: string; criteria: "category_id" | "market_id" }) => {
    const { error } = await supabase.from("seller_market_category").delete().eq("seller_id", userId).eq(criteria, selectionId)
    if (error) throw error;
  }, {
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['markets'] })
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      await queryClient.invalidateQueries({ queryKey: ['markets_categories'] })
    }
  });
};



export const useJoinMarket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (market: MarketResult) => {
      const { data, error } = await supabase.rpc(
        'increment_market_user_count',
        {
          market_place_id: market.place_id,
          name: market.name,
          location: market.location, //market.location,
          address: market.address,
        }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries after mutation
      queryClient.invalidateQueries({
        queryKey: cacheKeys.markets(),
      });
    },
  });
};



export const useWhispaAIMutation = () => {
  return useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      return axiosUtil.Post<{ data: WhispaResponse }>(`/whispa/ai`, { message }).then(it => it.data)
    },
    onSuccess: (_, { message }) => {
      queryClient.invalidateQueries({
        queryKey: ["whispa_ai", message],
      });
    },
  })
}
// ===================
// UTILITY FUNCTIONS FOR CACHE MANAGEMENT
// ===================

export const cacheUtils = {
  /**
   * Prefetch user data to improve UX
   */
  prefetchUserData: async (userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: cacheKeys.userProfile(userId),
        queryFn: async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.USER_PROFILE,
      }),
      queryClient.prefetchQuery({
        queryKey: cacheKeys.userRole(userId),
        queryFn: async () => {
          const { data, error } = await supabase
            .rpc('get_user_role', { uid: userId });
          if (error) throw error;
          return data;
        },
        staleTime: CACHE_TIMES.USER_ROLE,
      }),
    ]);
  },


  /**
   * Clear user-specific cache
   */
  clearUserCache: async (userId: string) => {
    await Promise.all([
      queryClient.removeQueries({ queryKey: cacheKeys.userProfile(userId) }),
      queryClient.removeQueries({ queryKey: cacheKeys.userRole(userId) }),
      queryClient.removeQueries({ queryKey: cacheKeys.userWallet(userId) }),
      queryClient.removeQueries({ queryKey: cacheKeys.completeProfile(userId) }),
    ]);
  },

  /**
   * Refresh all user lists (useful after role changes)
   */
  refreshUserLists: async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: cacheKeys.sellers() }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.buyers() }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.moderators() }),
      queryClient.invalidateQueries({ queryKey: cacheKeys.admins() }),
    ]);
  },

  /**
   * Get cache statistics for debugging
   */
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  },
};
